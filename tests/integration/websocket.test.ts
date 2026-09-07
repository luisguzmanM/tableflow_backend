import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "http";
import { WebSocket } from "ws";
import { createApp } from "../../src/app";
import { WebSocketOrderBroadcaster } from "../../src/modules/order/infrastructure/WebSocketOrderBroadcaster";

describe("WebSocket Realtime Integration", () => {
  let server: http.Server;
  let broadcaster: WebSocketOrderBroadcaster;
  let serverPort: number;

  beforeAll(async () => {
    const app = createApp();
    server = http.createServer(app);
    broadcaster = new WebSocketOrderBroadcaster();
    broadcaster.attach(server, "/ws/orders");

    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const address = server.address() as any;
        serverPort = address.port;
        resolve();
      });
    });
  });

  afterAll(async () => {
    broadcaster.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("should connect, receive welcome handshake, and subscribe to branch events", async () => {
    const ws = new WebSocket(`ws://localhost:${serverPort}/ws/orders`);

    const messages: any[] = [];

    await new Promise<void>((resolve) => {
      ws.on("message", (data) => {
        const msg = JSON.parse(data.toString());
        messages.push(msg);
        if (msg.type === "CONNECTED") {
          ws.send(JSON.stringify({ action: "SUBSCRIBE_BRANCH", branchId: "branch-1" }));
        } else if (msg.type === "SUBSCRIBED") {
          resolve();
        }
      });
    });

    expect(messages[0].type).toBe("CONNECTED");
    expect(messages[1].type).toBe("SUBSCRIBED");
    expect(messages[1].channel).toBe("branch:branch-1");

    // Now test broadcasting an ORDER_CREATED event
    const receivedBroadcast = new Promise<any>((resolve) => {
      ws.on("message", (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === "ORDER_CREATED") {
          resolve(msg);
        }
      });
    });

    broadcaster.publishOrderCreated({
      orderId: "ord-test-live",
      tableId: "tbl-1",
      tableNumber: 7,
      branchId: "branch-1",
      status: "PENDING",
      total: 15.5,
      items: [{ productName: "Hamburguesa", quantity: 1, unitPrice: 15.5, modifiers: [] }],
      createdAt: new Date(),
    });

    const event = await receivedBroadcast;
    expect(event.type).toBe("ORDER_CREATED");
    expect(event.data.orderId).toBe("ord-test-live");
    expect(event.data.tableNumber).toBe(7);

    ws.close();
  });
});
