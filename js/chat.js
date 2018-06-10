import { ChatRoom } from './ChatRoom.js'
import { getFromLocalStorage, saveToLocalStorage} from './localstorage.js'

let chats = []
const listUrl = "https://kaj-backend.herokuapp.com/rooms/list"
const endpoint = "wss://kaj-backend.herokuapp.com/rooms"
const username = document.getElementById("username-settings");
const usernameBtn = document.getElementById("change-name-button")
const roomsList = document.getElementById("room-list");
const settingsRoomList = document.getElementById("settings-room-list")


usernameBtn.addEventListener("click", e => {
    saveToLocalStorage("username", username.value)
})

function createSettings() {
    const roomList = roomsList
    const roomLi = createRoomLi("settings")
    roomList.appendChild(roomLi)


}

// fetch(listUrl).then(response => {
//     response.json().then(rooms => {
//         rooms.map(room => {
//             const tNode = document.createTextNode(room.name)
//             const li = document.createElement("li")
//             li.appendChild(tNode)
//             settingsRoomList.appendChild(li)
//         })
//     })
// })

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

    const room = new ChatRoom(`${endpoint}/${roomName}`, roomName, username, messagebox, usersbox)

    const sendBox = document.createElement("div")
    sendBox.contentEditable = "true"
    sendBox.classList.add("send-box")

    sendBox.addEventListener("keyup", (event) => {
        if (event.keyCode === 13 && sendBox.innerText.trim().length > 0) {
            if (room.send(sendBox.textContent))
                sendBox.textContent = ""
        }
    })


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
    canvasButton.textContent = "Show canvas"
    canvasButton.classList.add("canvas-button")
    canvasButton.addEventListener("click", (e) => {
        canvas.classList.toggle("canvas-visible")
    })
    chatarea.appendChild(canvasButton)


    const sendImageBtn = document.createElement("input")
    sendImageBtn.setAttribute("type", "button")
    sendImageBtn.value = "Send image"

    chatarea.appendChild(sendImageBtn)


    const sendPositionBtn = document.createElement("button")
    //sendPositionBtn.setAttribute("type", "button")
    sendPositionBtn.textContent = "Send Position"

    sendPositionBtn.addEventListener("click", e => {
        navigator.geolocation.getCurrentPosition(pos => {
            const toSend = pos.coords.longitude + " " + pos.coords.latitude
            room.sendPosition(toSend)
        })
    })

    chatarea.appendChild(sendPositionBtn)

    const drawSpace = document.createElement("div")

    canvas.width = 400
    canvas.height = 200
    canvas.classList.add("draw-space")

    makeCanvasDrawable(canvas)

    sendImageBtn.addEventListener("click", (e) => {
        room.sendImage(canvas.toDataURL())
        canvas.getContext("2d").clearTo("black")
    })

    drawSpace.appendChild(canvas)
    chatarea.appendChild(drawSpace)


    const roomLi = createRoomLi(roomName);


    const li = document.createElement("li")
    const liTextValue = document.createTextNode(roomName)
    li.appendChild(liTextValue)

    const dcButton = document.createElement("button")
    dcButton.textContent = "Disconnect"
    dcButton.addEventListener("click", e => {
        disconnect(room, roomsList, roomLi, settingsRoomList, li, rootElement, mainDiv, roomName);
    })

    li.appendChild(dcButton)

    const checkLoggedIn = (resolve, reject) => {
        if (room.loggedIn === "WAITING") {
            console.log("still waiting")
            setTimeout(checkLoggedIn, 500, resolve, reject)
        }
        else {
            if (room.loggedIn === "SUCCES") {
                return resolve()
            }
            else {
                return reject()
            }
        }
    }
    new Promise((resolve, reject) => {
        checkLoggedIn(resolve, reject)
    }).then(() => {
        roomsList.appendChild(roomLi)
        settingsRoomList.appendChild(li)
        rootElement.appendChild(mainDiv)
        chats.push(room)
        saveRoomToLocalStorage(roomName)
    }).catch(() => alert("Login has failed, name you choosed is probably already taken."))


    return room
}

if (getFromLocalStorage("username") != null) {
    const savedName = getFromLocalStorage("username")
    if (savedName.length > 0) {
        username.value = savedName
        if (getFromLocalStorage("rooms") != null) {
            const rooms = JSON.parse(getFromLocalStorage("rooms"))
            rooms.forEach(room => joinRoom(username.value, room, document.getElementById("empty"), roomsList))

        }
    }
}


window.addEventListener("online", _ => chats.forEach(room => room.setEnabled(true)))
window.addEventListener("offline", _ => chats.forEach(room => room.setEnabled(false)))

document.getElementById("join-button").addEventListener("click", e => {
    if (username.value.length == 0) {
        return
    }
    const roomName = document.getElementById("new-room-input").value
    if (chats.filter(r => r.roomName == roomName).length == 0) {
        joinRoom(username.value, roomName, document.getElementById("empty"), roomsList)
    }
})


const saveRoomToLocalStorage = (roomName) => {
    let roomList = getFromLocalStorage("rooms")
    if (roomList == null) {
        roomList = []
    } else {
        roomList = JSON.parse(roomList) //todo add try
    }
    if (!roomList.includes(roomName)) {
        roomList.push(roomName)
    }
    saveToLocalStorage("rooms", JSON.stringify(roomList))
}

location.hash = "settings"


function createRoomLi(roomName) {
    const roomLi = document.createElement("li");
    const roomLink = document.createElement("a");
    roomLink.setAttribute("href", `#${roomName}`);
    roomLink.textContent = roomName;
    roomLi.appendChild(roomLink);
    roomLink.addEventListener("click", e => {
        const currentlyActive = document.querySelector(".current-room");
        if (currentlyActive != null) {
            currentlyActive.classList.toggle("current-room");
        }
        roomLi.classList.toggle("current-room");
    });
    return roomLi;
}

function disconnect(room, roomsList, roomLi, settingsRoomList, li, rootElement, mainDiv, roomName) {
    room.disconnect();
    roomsList.removeChild(roomLi);
    settingsRoomList.removeChild(li);
    rootElement.removeChild(mainDiv);
    chats = chats.filter(e => e.roomName != roomName);
    let rooms = getFromLocalStorage("rooms");
    rooms = JSON.parse(rooms);
    rooms = rooms.filter(e => e != roomName);
    saveToLocalStorage("rooms", JSON.stringify(rooms));
}

