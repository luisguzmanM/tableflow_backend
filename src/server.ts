import http from "http";
import { createApp } from "./app";
import { config } from "./shared/config/env";
import { orderBroadcaster } from "./modules/order/infrastructure/WebSocketOrderBroadcaster";

const app = createApp();
const server = http.createServer(app);

// Attach WebSocket server for real-time order updates
orderBroadcaster.attach(server, "/ws/orders");

server.listen(config.port, () => {
  console.log(`🚀 TableFlow backend server running on http://localhost:${config.port}`);
  console.log(`📡 WebSocket server listening on ws://localhost:${config.port}/ws/orders`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});
