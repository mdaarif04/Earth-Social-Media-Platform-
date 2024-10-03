const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const SocketServer = require("./socketServer");
const path = require("path");
const connectDB = require("./DB/index.js");
const {ExpressPeerServer} = require('peer')
// const os = require("os");

// const totalcpu = os.cpus().length;
// console.log(totalcpu);

const _dirname = path.resolve();

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use(express.static("build"))

// Socket
const http = require("http").createServer(app)
const io = require("socket.io")(http)

// Create peer server
ExpressPeerServer({ port: 3001, path: "/" });

io.on("connection", (socket) => {
  SocketServer(socket);
});

dotenv.config();

connectDB();

// Routes
app.use("/api", require("./routes/authRoute"));
app.use("/api", require("./routes/userRouter"));
app.use("/api", require("./routes/postRouter"));
app.use("/api", require("./routes/commentRouter"));
app.use("/api", require("./routes/notifyRouter"));
app.use("/api", require("./routes/messageRouter"));

// -----------------------------Deployment----------------
app.use(express.static(path.join(_dirname, "/client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(_dirname, "client", "build", "index.html"));
});
// -----------------------------Deployment----------------

const port = process.env.PORT || 8000;
http.listen(port, () => console.log(`Sever is running on ${port}`));
