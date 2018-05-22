import { ChatRoom } from './ChatRoom.js'

let chats = []
const name = document.getElementById("username")
const loginBtn = document.getElementById("login-button")
const username = document.getElementById("username-settings");
const usernameBtn = document.getElementById("change-name-button")


usernameBtn.addEventListener("click", e => {
    localStorage.setItem("username", username.value)
})

function createSettings() {
    const roomList = document.getElementById("room-list")
    const roomLi = document.createElement("li")
    const roomLink = document.createElement("a")
    roomLink.setAttribute("href", "#settings")
    roomLink.textContent = "Settings"
    roomLi.appendChild(roomLink)
    roomList.appendChild(roomLi)


}

createSettings()


const makeCanvasDrawable = (canvas) => {
    const ctx = canvas.getContext("2d")

    const fillColor = '#f0000';

    ctx.fillCircle = (x, y, radius, fillColor) => {
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.fill();
    };
    ctx.clearTo = (fillColor) => {
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    ctx.clearTo(fillColor || "#ddd");

    canvas.onmousemove = (e) => {
        if (!canvas.isDrawing) {
            return;
        }
        const x = e.pageX - canvas.offsetLeft;
        const y = e.pageY - canvas.offsetTop;
        const radius = 3;
        const fillColor = '#ff0000';
        ctx.fillCircle(x, y, radius, fillColor);
    };
    canvas.onmousedown = (e) => {
        canvas.isDrawing = true;
    };
    canvas.onmouseup = (e) => {
        canvas.isDrawing = false;
    };

}


const joinRoom = (username, roomName, rootElement, roomsList) => {
    // todo check room existence
    const mainDiv = document.createElement("div")
    mainDiv.classList.add("room")
    mainDiv.id = roomName

    const nameHeader = document.createElement("h2")
    nameHeader.textContent = roomName

    // mainDiv.appendChild(nameHeader)

    const chatarea = document.createElement("div")
    chatarea.classList.add("chat-area")

    const messagebox = document.createElement("div")
    messagebox.id = `room-box-${roomName}`
    messagebox.classList.add("room-box")


    chatarea.appendChild(messagebox)

    mainDiv.appendChild(chatarea)

    const usersbox = document.createElement("div")
    usersbox.id = `users-box-${roomName}`
    usersbox.classList.add("users-box")

    mainDiv.appendChild(usersbox)

    const room = new ChatRoom(`ws://localhost:7000/rooms/${roomName}`, roomName, username, messagebox, usersbox)

    const sendBox = document.createElement("div")
    sendBox.contentEditable = "true"
    sendBox.classList.add("send-box")

    sendBox.addEventListener("keyup", (event) => {
        if (event.keyCode === 13) {
            room.send(sendBox.textContent)
            sendBox.textContent = ""
        }
    })


    // mainDiv.addEventListener("dragenter", e => {
    //     mainDiv.classList.add("dragging")
    // })
    // mainDiv.addEventListener("dragleave", e => {
    //     mainDiv.classList.remove("dragging")
    // })
    messagebox.addEventListener("dragover", e => {
        e.preventDefault()
    })
    messagebox.addEventListener("drop", e => {
        e.preventDefault()
        const fileReader = new FileReader()
        fileReader.addEventListener("load", e => {
            room.sendImage(e.target.result)
        })
        Array.from(e.dataTransfer.files).forEach(file => {
            fileReader.readAsDataURL(e.dataTransfer.files[0])
        });

    })
    chatarea.appendChild(sendBox)

    const canvas = document.createElement("canvas")
    const canvasButton = document.createElement("button")
    canvasButton.classList.add("canvas-button")
    canvasButton.addEventListener("click", (e) => {
        canvas.classList.toggle("canvas-visible")
    })
    chatarea.appendChild(canvasButton)

    const sendImage = document.createElement("div")

    const sendImageBtn = document.createElement("input")
    sendImageBtn.setAttribute("type", "button")
    sendImageBtn.value = "Send image"

    sendImage.appendChild(sendImageBtn)
    chatarea.appendChild(sendImage)

    const sendPosition = document.createElement("div")

    const sendPositionBtn = document.createElement("input")
    sendPositionBtn.setAttribute("type", "button")
    sendPositionBtn.value = "Send Position"

    sendPositionBtn.addEventListener("click", e => {
        navigator.geolocation.getCurrentPosition(pos => {
            const toSend = pos.coords.longitude + " " + pos.coords.latitude
            room.sendPosition(toSend)
        })
    })

    sendPosition.appendChild(sendPositionBtn)
    chatarea.appendChild(sendPosition)

    const drawSpace = document.createElement("div")

    canvas.width = 400
    canvas.height = 200
    canvas.classList.add("draw-space")

    makeCanvasDrawable(canvas)

    sendImageBtn.addEventListener("click", (e) => {
        room.sendImage(canvas.toDataURL())
    })

    drawSpace.appendChild(canvas)
    chatarea.appendChild(drawSpace)

    rootElement.appendChild(mainDiv)

    const roomLi = document.createElement("li")
    const roomLink = document.createElement("a")
    roomLink.setAttribute("href", `#${roomName}`)
    roomLink.textContent = roomName
    roomLi.appendChild(roomLink)
    roomsList.appendChild(roomLi)

    roomLink.addEventListener("click", e => {
        const currentlyActive = document.querySelector(".current-room")
        if (currentlyActive != null) {
            currentlyActive.classList.toggle("current-room")
        }
        roomLi.classList.toggle("current-room")
    })

    const settingsRoomList = document.getElementById("settings-room-list")
    const li = document.createElement("li")
    const liTextValue = document.createTextNode(roomName)
    li.appendChild(liTextValue)

    const dcButton = document.createElement("button")
    dcButton.textContent = "Disconnect"
    dcButton.addEventListener("click", e => {
        disconnect(room, roomsList, roomLi, settingsRoomList, li, rootElement, mainDiv, roomName);
    })

    li.appendChild(dcButton)
    settingsRoomList.appendChild(li)

    chats.push(room)
    return room
}

if (localStorage.getItem("username") !== null) {
    username.value = localStorage.getItem("username")
    document.body.removeChild(document.getElementById("login"))
    if (localStorage.getItem("rooms") != null) {
        const rooms = JSON.parse(localStorage.getItem("rooms"))
        rooms.forEach(room => joinRoom(username.value, room, document.getElementById("empty"), document.getElementById("room-list")))

    }
}

document.getElementById("join-button").addEventListener("click", e => {
    const roomName = document.getElementById("new-room-input").value
    if (chats.filter(r => r.roomName == roomName).length == 0) {
        joinRoom(username.value, roomName, document.getElementById("empty"), document.getElementById("room-list"))
        saveRoomToLocalStorage(roomName)
    }
})

loginBtn.addEventListener("click", (e) => {
    localStorage.setItem("username", name.value)
    username.value = name.value
    document.getElementById("login").removeChild(name)
    document.getElementById("login").removeChild(loginBtn)

})

const saveRoomToLocalStorage = (roomName) => {
    let roomList = localStorage.getItem("rooms")
    if (roomList == null) {
        roomList = []
    } else {
        roomList = JSON.parse(roomList) //todo add try
    }
    if (!roomList.includes(roomName)) {
        roomList.push(roomName)
    }
    localStorage.setItem("rooms", JSON.stringify(roomList))
}

location.hash = "settings"


function disconnect(room, roomsList, roomLi, settingsRoomList, li, rootElement, mainDiv, roomName) {
    room.disconnect();
    roomsList.removeChild(roomLi);
    settingsRoomList.removeChild(li);
    rootElement.removeChild(mainDiv);
    chats = chats.filter(e => e.roomName != roomName);
    let rooms = localStorage.getItem("rooms");
    rooms = JSON.parse(rooms);
    rooms = rooms.filter(e => e != roomName);
    localStorage.setItem("rooms", JSON.stringify(rooms));
}

