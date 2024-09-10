let users = [];

const SocketServer = (socket) => {
  // Connect - Disconnect

  socket.on("joinUser", (id) => {
    users.push({ id, socketId: socket.id });
    console.log({ users });
  });
  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.id);
  });

  // likes
  socket.on("likePost", (newPost) => {
    const ids = [...(newPost.user.followers || []), newPost.user?._id]; // Ensure 'followers' is an array
    const clients = users.filter((user) => ids.includes(user.id)); // Optional chaining removed as 'ids' is always an array

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketId}`).emit("likeToClient", newPost);
      });
    }
  });

  // unlikes
  socket.on("unLikePost", (newPost) => {
    const ids = [...(newPost.user.followers || []), newPost.user?._id]; // Ensure 'followers' is an array
    const clients = users.filter((user) => ids.includes(user.id)); // Optional chaining removed as 'ids' is always an array

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketId}`).emit("unLikeToClient", newPost);
      });
    }
  });

  // Comments
  socket.on("createComment", (newPost) => {
    // console.log(newPost)
    const ids = [...(newPost.user.followers || []), newPost.user?._id]; // Ensure 'followers' is an array
    const clients = users.filter((user) => ids.includes(user.id)); // Optional chaining removed as 'ids' is always an array

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketId}`).emit("createCommentToClient", newPost);
      });
    }
  });

  //Delete Comments
  socket.on("deleteComment", (newPost) => {
    // console.log(newPost)
    const ids = [...(newPost.user.followers || []), newPost.user?._id]; // Ensure 'followers' is an array
    const clients = users.filter((user) => ids.includes(user.id)); // Optional chaining removed as 'ids' is always an array

    if (clients.length > 0) {
      clients.forEach((client) => {
        socket.to(`${client.socketId}`).emit("deleteCommentToClient", newPost);
      });
    }
  });

  //Follow
  socket.on("follow", (newUser) => {
    const user = users.find((user) => user.id === newUser._id)
    user &&
      socket.to(`${user.socketId}`).emit("followToClient", newUser)
  })
  //UnFollow
  socket.on("unfollow", (newUser) => {
    const user = users.find((user) => user.id === newUser._id);
    user && socket.to(`${user.socketId}`).emit("unfollowToClient", newUser);
  });
};

module.exports = SocketServer;
