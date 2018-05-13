import { Message } from './Message.js'

class MessageContainer {
    constructor(messageComponent) {
        this._messageComponent = messageComponent
    }

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

        const content = document.createElement("p")
        imageDiv.appendChild(canvas)
        content.appendChild(imageDiv)
        div.appendChild(content)
        this._messageComponent.appendChild(div)
    }

    _prepareMessageDiv(message) {
        const div = document.createElement("div")
        div.classList.add("message-box")
        const user = document.createElement("b")
        div.appendChild(user)
        user.textContent = message.sender.username
        return div
    }
}

export { MessageContainer }
