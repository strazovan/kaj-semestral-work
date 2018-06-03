
/**
 * Class that rapresents one message.
 */
class Message {
    constructor(sender, messageType, contentType ,content, createdAt = new Date()){
        this.sender = { username: sender}
        this.messageType = messageType
        this.contentType = contentType
        this.content = content
        this.createdAt = createdAt
    }

    /**
     * Parses message from string
     * @param {String} json 
     */
    static fromJson(json){
        const parsed = JSON.parse(json)
        return new Message(parsed.sender, parsed.contentType, parsed.messageType, parsed.content)
    }


}


export { Message }