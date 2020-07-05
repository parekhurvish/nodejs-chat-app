const users = []

const addUser = (({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: "Username and Room are required"
        }
    }

    const existingUSer = users.find((user) => user.room === room && user.username == username)

    if (existingUSer) {
        return {
            error: "Username is in use!"
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
})

const removeUser = ((id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
})

const getUser = ((id) => {
    console.log("ID", id);
    console.log(users)
    const user = users.find((user) => user.id === id)
    console.log(user)
    return user
})

const getUsersInRoom = ((room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
})

module.exports = {
    addUser, removeUser, getUser, getUsersInRoom
}