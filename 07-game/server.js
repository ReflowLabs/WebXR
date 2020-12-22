const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const next = require("next");

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

// fake DB
const db = {
  updated: {},
  state: {},
};

// socket.io server
io.on("connection", (socket) => {
  // setTimeout(() => {
  // console.log("init");
  socket.emit("init", db.state);
  // }, 1000);
  socket.on("update", (update) => {
    console.log(socket.id, update);
    db.state = { ...db.state, ...update };
    socket.broadcast.emit("update", update);
  });
});

nextApp.prepare().then(() => {
  app.get("*", (req, res) => {
    return nextHandler(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
