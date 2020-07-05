const socket = io()
const $msgForm = document.querySelector("#msg-form")
const $msgFormInput = $msgForm.querySelector("input")
const $msgFormbutton = $msgForm.querySelector("button")
const $sendLocation = document.querySelector("#send-location")
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

//tempplate
const messageTemplate = document.querySelector('#messageTemplate').innerHTML
const locationTempate = document.querySelector('#locationTempalte').innerHTML
const sidebarTempalte = document.querySelector('#sidebarTempalte').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMsgStyle = getComputedStyle($newMessage)
    const newMsgMargnin = parseInt(newMsgStyle.marginBottom)
    const h = $newMessage.offsetHeight + newMsgMargnin

    const visibleHeight = $messages.offsetHeight
    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight


    if(containerHeight - h <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('locationMessage', (location) => {
    const href = Mustache.render(locationTempate, {
        username: location.username,
        location,
        createdAt: moment(location.createdAt).format('h:mm a')
    })

    $messages.insertAdjacentHTML('beforeend', href)
    autoScroll()
})

socket.on("message", (msg) => {
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        msg: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on("roomData", ({ room, users }) => {
    const html = Mustache.render(sidebarTempalte, {
        room,
        users
    })

    $sidebar.innerHTML = html
})

$msgForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $msgForm.setAttribute('disabled', 'disabled')
    const msg = e.target.elements.message.value
    socket.emit("sendMsg", msg, () => {
        $msgForm.removeAttribute('disabled')
        $msgFormInput.value = ''
        $msgFormInput.focus()

        //     const html = Mustache.render(messageTemplate, {
        //         msg: "Delivered!!"
        //     })
        //     $messages.insertAdjacentHTML('beforeend', html)
    })
})

$sendLocation.addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        console.log("Your brwser does not support this feature!")
        return
    }

    $sendLocation.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((postion) => {
        socket.emit("share-location", {
            lat: postion.coords.latitude,
            long: postion.coords.longitude
        }, (msg) => {
            $sendLocation.removeAttribute('disabled')
        })
    })
})

socket.emit("join", { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = "/index.html"
    }
})