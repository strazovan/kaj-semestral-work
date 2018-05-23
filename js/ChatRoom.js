import { Message } from './Message.js'
import { MessageContainer } from './MessageContainer.js'
import { UsersContainer } from './UsersContainer.js'

class ChatRoom {
    constructor(address, roomName, username, messageComponent, usersComponent) {
        this._address = address
        this._roomName = roomName
        this._username = username
        this._messageContainer = new MessageContainer(messageComponent)
        this._usersContainer = new UsersContainer(this._username, usersComponent)
        //this._socket = this._createWebSocket()
        this._loggedIn = false
        if (navigator.onLine) {
            localStorage.setItem(roomName, JSON.stringify([]))
            this._socket = this._createWebSocket()
        }
        else{
            let lastMessages = localStorage.getItem(this._roomName)
            if(lastMessages != null){
                lastMessages = JSON.parse(lastMessages)
                lastMessages.forEach(msg => this._messageContainer.addMessage(msg))
            }
        }
    }

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

    disconnect() {
        this._socket.close()
    }

    _sendMessage(message) {
        const string = JSON.stringify(message)
        this._socket.send(string)
    }

    send(stringmessage) {
        const msg = new Message(this._username, "MESSAGE", "TEXT_MESSAGE", stringmessage)
        this._sendMessage(msg)
    }

    sendImage(imageAsUrl) {
        const msg = new Message(this._username, "MESSAGE", "IMAGE", imageAsUrl)
        this._sendMessage(msg)
    }

    sendPosition(positionString) {
        const msg = new Message(this._username, "MESSAGE", "POSITION", positionString)
        this._sendMessage(msg)
    }

    _login() {
        if (!this._loggedIn) {
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
                    console.log("failed to login")
                }
                else {
                    this._loggedIn = true
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
        console.log(event)
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
            const notification = new Notification(title, { body: content })
        }

        // Otherwise, we need to ask the user for permission
        else if (Notification.permission !== "denied") {
            Notification.requestPermission(function (permission) {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    const notification = new Notification(title, { body: content })
                }
            });
        }

        // At last, if the user has denied notifications, and you 
        // want to be respectful there is no need to bother them any more.
    }

    _saveMessageToLocalStorage(message) {
        const messages = JSON.parse(localStorage.getItem(this._roomName))
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

        localStorage.setItem(this._roomName, JSON.stringify(messages))
    }
}

export { ChatRoom }