require("dotenv").config();
const http = require("http");
const app = require("./app");
const { initWebSocket } = require("./websocket");

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
initWebSocket(server);

server.listen(PORT, () => {
  console.log(`Server pokrenut na http://localhost:${PORT}`);
});
