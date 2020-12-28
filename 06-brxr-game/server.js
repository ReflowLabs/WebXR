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
  p0: {},
  p1: {},
};

let players = 0;

// socket.io server
io.on("connection", (socket) => {
  players++;
  const player = players % 2;
  const enemy = player == 1 ? 0 : 1;
  const pK = `p${player}`;
  const oK = `p${enemy}`;
  console.log("welcome player", players);
  socket.emit("init", { ...db[oK], player });
  socket.on("update", (update) => {
    console.log(player, socket.id, update);
    db[pK] = { ...db[pK], ...update };
    socket.broadcast.emit(oK, update);
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
