// require("dotenv").config();
const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const SocketServer = require("./socketServer")
const path = require('path')

const app = express();
app.use(express.json());
app.use(cors())
app.use(cookieParser())

app.use(express.static('build'))

// Socket
const http = require("http").createServer(app);
const io = require("socket.io")(http);

io.on("connection", (socket) => {
  SocketServer(socket);
});

dotenv.config();


// app.get("/", (req, res) => {
//   res.json({ msg: "Server is running..." });
// })

// Routes
app.use("/api", require("./routes/authRoute"));
app.use("/api", require("./routes/userRouter"));
app.use("/api", require("./routes/postRouter"));
app.use("/api", require("./routes/commentRouter"))
app.use("/api", require("./routes/notifyRouter"))
app.use("/api", require("./routes/messageRouter"))

// For check;
// const run = async () => {
//   await mongoose.connect(url);
//   console.log("Connected to myDB");
// };

// run().catch((err) => console.error(err));
//
const url = process.env.MONGO_URL;

mongoose
  .connect(url)
  .then(() => {
    console.log(`Connect Successfully`);
  })
  .catch(() => console.log(`Not Connected`))


  // -----------------------------Deployment----------------

const __dirname1 = path.resolve()
if (process.env.NODE_ENV==="production") {
  app.use(express.static(path.join(__dirname1,"/client/build")));

  app.get('*',(req,res) =>{
    res.sendFile(path.resolve(__dirname1,"client","build","index.html"));
  });

}else{
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// -----------------------------Deployment----------------

const port = process.env.PORT || 8000;
http.listen(port, () => console.log(`Sever is running on ${port}`)
)
