import { Message } from './Message.js'

class UsersContainer {
    constructor(myUserName, component) {
        this._me = myUserName
        this._list = document.createElement("ul")
        this._component = component
        component.appendChild(document.createTextNode("Users in room"))
        component.appendChild(this._list)
    }

    addUsersList(usersJson) {
        const users = JSON.parse(usersJson)
        users.forEach((user) => {
            const userli = this._createUserLi(user.username)
            this._list.appendChild(userli)
        });
    }

    addSingleUser(userJson) {
        const user = JSON.parse(userJson)
        const userli = this._createUserLi(user.username)
        this._list.appendChild(userli)
    }

    removeUser(userJson) {
        const user = JSON.parse(userJson)
        const toRemove = [...this._list.childNodes].find((node) => {
            return node.textContent === user.username
        })
        if (toRemove != null) {
            this._list.removeChild(toRemove)
        }
    }

    _createUserLi(username) {
        const userli = document.createElement("li")
        const text = document.createTextNode(username)
        if (username == this._me) {
            const bold = document.createElement("b")
            bold.appendChild(text)
            userli.appendChild(bold)
        } else {
            userli.appendChild(text)
        }
        return userli
    }
}

export { UsersContainer }