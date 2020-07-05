const express = require("express")
const path = require('path')
const http = require("http")
const socketio = require('socket.io')
const { join } = require("path")
const { generateMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 5000
const punlicDir = path.join(__dirname, '../public')

app.use(express.static(punlicDir))

server.listen(port, () => {
    console.log(`server is up on ${port}`)
})

io.on('connection', (socket) => {
    console.log("new client connected")

    socket.on("join", (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit("message", generateMessage("Admin", `Welcome! ${user.username}`))
        socket.broadcast.to(user.room).emit("message", generateMessage("Admin", `${user.username} joined`))

        io.to(user.room).emit("roomData", {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on("sendMsg", (msg, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit("message", generateMessage(user.username, msg))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit("message", generateMessage("Admin", `${user.username} has left!`))
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on("share-location", (position, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit("locationMessage", generateMessage(user.username, `https://google.com/maps?q=${position.lat},${position.long}`))
        callback("Success")
    })
})