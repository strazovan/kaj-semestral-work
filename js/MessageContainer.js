import { Message } from './Message.js'

/**
 * Class that represents message box. Uses provided HTMLElement to show messages.
 */
class MessageContainer {
    constructor(messageComponent) {
        this._messageComponent = messageComponent
    }

    /**
     * Adds message to messagebox. Creates representation according to it's content type.
     * @param {Message} message 
     */
    addMessage(message) {
        switch (message.contentType) {
            case "TEXT_MESSAGE":
                this._addTextMessage(message)
                break
            case "MESSAGE_LIST":
                const messages = JSON.parse(message.content)
                messages.forEach((msg) => this.addMessage(msg))
                break
            case "IMAGE":
                this._addImageMessage(message)
                break
            case "POSITION":
                this._addPositionMessage(message)
                break
        }

        this._messageComponent.scrollTo(0, this._messageComponent.scrollHeight)
    }

    _addTextMessage(message) {
        const div = this._prepareMessageDiv(message)

        const msg = document.createElement("p")
        msg.textContent = message.content
        div.appendChild(msg)
        this._messageComponent.appendChild(div)
        console.log("????")
    }

    _addImageMessage(message) {
        const div = this._prepareMessageDiv(message)
        const imageDiv = document.createElement("div")
        const canvas = document.createElement("canvas");
        canvas.classList.add("canvas-visible")

        canvas.classList.add("image-message")
        const context = canvas.getContext("2d")
        const data = message.content
        const image = new Image()
        image.onload = () => {
            canvas.height = image.height
            canvas.width = image.width
            context.drawImage(image, 0, 0, image.width, image.height)
        }

        image.src = data

        imageDiv.appendChild(canvas)
        div.appendChild(imageDiv)
        this._messageComponent.appendChild(div)
    }

    _addPositionMessage(message) {
        const div = this._prepareMessageDiv(message)

        const mapDiv = document.createElement("div")
        mapDiv.classList.add("map-div")

        div.appendChild(mapDiv)
        this._messageComponent.appendChild(div)

        const positions = message.content.split(" ")
        const middle = SMap.Coords.fromWGS84(positions[0], positions[1])
        const map = new SMap(JAK.gel(mapDiv), middle, 15, SMap.DEF_TURIST)
        map.addMarker(middle)


    }

    _prepareMessageDiv(message) {
        const div = document.createElement("div")
        div.classList.add("message-box")
        const user = document.createElement("b")
        div.appendChild(user)
        user.textContent = message.sender.username
        return div
    }

    /**
     * Sets enabled state of this componenet to parameter value. Disables container.
     * @param {Boolean} enabled 
     */
    setEnabled(enabled) {
        if (!enabled)
            this._messageComponent.classList.add("disabled")
        else
            this._messageComponent.classList.remove("disabled")
    }
}

export { MessageContainer }
