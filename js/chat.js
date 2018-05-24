import { ChatRoom } from './ChatRoom.js'

let chats = []
const name = document.getElementById("username")
const loginBtn = document.getElementById("login-button")
const username = document.getElementById("username-settings");
const usernameBtn = document.getElementById("change-name-button")
const roomsList = document.getElementById("room-list");


usernameBtn.addEventListener("click", e => {
    localStorage.setItem("username", username.value)
})

function createSettings() {
    const roomList = roomsList
    const roomLi = createRoomLi("Settings")
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

    const checkLoggedIn = (resolve, reject) => {
        if(room.loggedIn === "WAITING"){
            console.log("still waiting")
            setTimeout(checkLoggedIn, 500, resolve, reject)
        }
        else{
            if(room.loggedIn === "SUCCES"){
                return resolve()
            }
            else{
                return reject()
            }
        }
    }
    new Promise( (resolve, reject) => {
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

if (localStorage.getItem("username") !== null) {
    username.value = localStorage.getItem("username")
    document.body.removeChild(document.getElementById("login"))
    if (localStorage.getItem("rooms") != null) {
        const rooms = JSON.parse(localStorage.getItem("rooms"))
        rooms.forEach(room => joinRoom(username.value, room, document.getElementById("empty"), roomsList))

    }
}

document.getElementById("join-button").addEventListener("click", e => {
    const roomName = document.getElementById("new-room-input").value
    if (chats.filter(r => r.roomName == roomName).length == 0) {
        joinRoom(username.value, roomName, document.getElementById("empty"), roomsList)
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
    let rooms = localStorage.getItem("rooms");
    rooms = JSON.parse(rooms);
    rooms = rooms.filter(e => e != roomName);
    localStorage.setItem("rooms", JSON.stringify(rooms));
}

