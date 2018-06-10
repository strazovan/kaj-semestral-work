import { Message } from './Message.js'
import { MessageContainer } from './MessageContainer.js'
import { UsersContainer } from './UsersContainer.js'
import { getFromLocalStorage, saveToLocalStorage} from './localstorage.js'

/**
 * Class that represents one chat room. Provides methods for sending all types of messages. 
 * This class itself contains websocket for room and handles all incomming messages.
 */
class ChatRoom {
    constructor(address, roomName, username, messageComponent, usersComponent) {
        this._enabled = true
        this._address = address
        this._roomName = roomName
        this._username = username
        this._messageContainer = new MessageContainer(messageComponent)
        this._usersContainer = new UsersContainer(this._username, usersComponent)
        this._loggedIn = "WAITING"
        if (navigator.onLine) {
            saveToLocalStorage(roomName, JSON.stringify([]))
            this._socket = this._createWebSocket()
        }
        else {
            let lastMessages = getFromLocalStorage(this._roomName)
            if (lastMessages != null) {
                lastMessages = JSON.parse(lastMessages)
                lastMessages.forEach(msg => this._messageContainer.addMessage(msg))
            }
        }
    }

    /**
     * Creates websocket and assings handlers.
     */
    _createWebSocket() {
        const socket = new WebSocket(this._address)

        socket.addEventListener("open", this._onConnect.bind(this))
        socket.addEventListener("close", this._onClose.bind(this))
        socket.addEventListener("message", this._onMessage.bind(this))

        return socket
    }

    get connected() {
        return this._socket.OPEN
    }

    get roomName() {
        return this._roomName
    }

    get loggedIn() {
        return this._loggedIn
    }

    disconnect() {
        this._socket.close()
    }

    _sendMessage(message) {
        if (!this._enabled)
            return false
        const string = JSON.stringify(message)
        this._socket.send(string)
        return true
    }

    send(stringmessage) {
        const msg = new Message(this._username, "MESSAGE", "TEXT_MESSAGE", stringmessage)
        return this._sendMessage(msg)
    }

    sendImage(imageAsUrl) {
        const msg = new Message(this._username, "MESSAGE", "IMAGE", imageAsUrl)
        return this._sendMessage(msg)
    }

    sendPosition(positionString) {
        const msg = new Message(this._username, "MESSAGE", "POSITION", positionString)
        return this._sendMessage(msg)
    }

    _login() {
        if (this._loggedIn === "WAITING") {
            this._sendMessage(new Message(this._username, "LOGIN", "TEXT_MESSAGE", this._username))
        }
    }

    _getHistory() {
        this._sendMessage(new Message(this._username, "COMMAND", "TEXT_MESSAGE", "getHistory"))
    }
    _getUsersList() {
        this._sendMessage(new Message(this._username, "COMMAND", "TEXT_MESSAGE", "getUsers"))
    }

    _onConnect(event) {
        this._login()
        this._getHistory()
        this._getUsersList()
    }

    /**
     * Handles incoming messages. If needed, delegates it to proper container.
     * @param {MessageEvent} event 
     */
    _onMessage(event) {
        console.log(event.data)
        const message = JSON.parse(event.data)
        switch (message.messageType) {
            case "MESSAGE":
                this._messageContainer.addMessage(message)
                this._saveMessageToLocalStorage(message)
                break
            case "LOGIN":
                if (message.content === "Login failed") {
                    this._loggedIn = "FAILED"
                }
                else {
                    this._loggedIn = "SUCCES"
                }
                // todo get login success and change 
                break
            case "USERS":
                switch (message.contentType) {
                    case "USERS_LIST":
                        this._usersContainer.addUsersList(message.content)
                        break
                    case "USER_CONNECTED":
                        this._usersContainer.addSingleUser(message.content)
                        break
                    case "USER_DISCONNECTED":
                        this._usersContainer.removeUser(message.content);
                        break
                }
                break
        }
        this.notifyMessage(message)
    }

    _onClose(event) {
        this._messageContainer.addMessage(JSON.stringify(new Message("Server", "message", "message/text", "You have been disconnected.")))
        console.log(event)
    }

    /**
     * Sets rooms enabled state to <code>enabled</code>.
     * @param {Boolean} enabled 
     */
    setEnabled(enabled) {
        if (this._enabled != enabled) {
            this._enabled = enabled
            this._messageContainer.setEnabled(enabled)
        }
    }

    notifyMessage(message) {

        if (message.sender.username == this._username)
            return

        let title = `${message.sender.username} in ${this._roomName}:`
        let content = ""

        if (message.messageType === "MESSAGE" && message.contentType === "TEXT_MESSAGE") {
            content += message.content
        }
        else if (message.messageType === "MESSAGE" && message.contentType === "IMAGE") {
            content += "Sent image."
        }
        else {
            return
        }

        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            console.warn("Broswer doesn't support notifications.")
        }

        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            new Notification(title, { body: content })
            new Audio("resources/beep.mp3").play()
        }

        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {
            Notification.requestPermission(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    new Notification(title, { body: content })
                    new Audio("resources/beep.mp3").play()
                }
            });
        }

        // At last, if the user has denied notifications, and you 
        // want to be respectful there is no need to bother them any more.
    }

    /**
     * Saves incoming message to local storage.
     * @param {Message} message 
     */
    _saveMessageToLocalStorage(message) {
        const messages = JSON.parse(getFromLocalStorage(this._roomName))
        switch (message.contentType) {
            case "TEXT_MESSAGE":
                messages.push(message)
                break
            case "IMAGE":
                message.contentType = "TEXT"
                message.content = "WE DO NOT SAVE IMAGES :("
                break
            case "POSITION":
                messages.push(message)
                break
        }

        saveToLocalStorage(this._roomName, JSON.stringify(messages))
    }
}

export { ChatRoom }