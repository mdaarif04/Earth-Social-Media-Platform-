let users = []

const SocketServer = (socket) => {
    // Connect - Disconnect
    
    socket.on("joinUser", id => {
      users.push({ id, socketId: socket.id })
    console.log({users});
    });
    socket.on('disconnect', () => {
        users = users.filter(user => user.socketId !== socket.id)
    })

    // likes
    socket.on('likePost', newPost => {

        const ids = [...newPost.user.followers, newPost.user._id]
        const clients = users.filter(user => ids?.includes(user.id))
        
        if(clients.length > 0){
            clients.forEach(client => {
                socket.to(`${client.socketId}`).emit('likeToClient', newPost)
            })
        }
    })
}

module.exports = SocketServer;