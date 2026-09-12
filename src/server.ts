import http from "http";
import { createApp } from "./app";
import { config } from "./shared/config/env";
import { orderBroadcaster } from "./modules/order/infrastructure/WebSocketOrderBroadcaster";
import { menuBroadcaster } from "./modules/menu/infrastructure/WebSocketMenuBroadcaster";

const app = createApp();
const server = http.createServer(app);

// Attach WebSocket servers for real-time updates
orderBroadcaster.attach(server, "/ws/orders");
menuBroadcaster.attach(server, "/ws/menu");

server.listen(config.port, () => {
  console.log(`🚀 TableFlow backend server running on http://localhost:${config.port}`);
  console.log(`📡 WebSocket server listening on ws://localhost:${config.port}/ws/orders`);
  console.log(`📡 WebSocket server listening on ws://localhost:${config.port}/ws/menu`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});
