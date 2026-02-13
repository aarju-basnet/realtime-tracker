const express = require('express');
const dotenv=  require('dotenv')
dotenv.config()
const app = express();
const http = require('http');
const path = require('path');
const socketio = require('socket.io');

const server = http.createServer(app);
const io = socketio(server);

// Set view engine
app.set("view engine", 'ejs');

// Serve static files correctly ✅
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function(socket) {
   socket.on("send-location", function(data){
    io.emit("receive-location", {id: socket.id, ...data});
   });
   console.log("connected");
});

app.get('/', (req, res) => {
    res.render('index');
});

const port = process.env.PORT

app.listen(port, () => {
    console.log(`server is running on the port ${port}`);
});

