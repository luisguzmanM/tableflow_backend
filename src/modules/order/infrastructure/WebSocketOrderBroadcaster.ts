import { WebSocket, WebSocketServer } from "ws";
import { Server as HttpServer } from "http";
import {
  OrderEventBroadcaster,
  OrderCreatedEvent,
  OrderStatusChangedEvent,
} from "../domain/OrderEventBroadcaster";

interface ClientSubscription {
  branchIds: Set<string>;
  orderIds: Set<string>;
}

export class WebSocketOrderBroadcaster implements OrderEventBroadcaster {
  private wss: WebSocketServer | null = null;
  private clientSubscriptions = new Map<WebSocket, ClientSubscription>();

  attach(server: HttpServer, path: string = "/ws/orders"): void {
    this.wss = new WebSocketServer({ server, path });

    this.wss.on("connection", (ws: WebSocket) => {
      this.clientSubscriptions.set(ws, {
        branchIds: new Set(),
        orderIds: new Set(),
      });

      ws.on("message", (message: string) => {
        try {
          const parsed = JSON.parse(message.toString());
          this.handleClientMessage(ws, parsed);
        } catch (err) {
          ws.send(JSON.stringify({ error: "Invalid JSON message" }));
        }
      });

      ws.on("close", () => {
        this.clientSubscriptions.delete(ws);
      });

      ws.on("error", () => {
        this.clientSubscriptions.delete(ws);
      });

      // Welcome handshake
      ws.send(JSON.stringify({ type: "CONNECTED", message: "TableFlow Realtime WebSocket Connected" }));
    });
  }

  private handleClientMessage(ws: WebSocket, message: any): void {
    const subs = this.clientSubscriptions.get(ws);
    if (!subs) return;

    if (message.action === "SUBSCRIBE_BRANCH" && message.branchId) {
      subs.branchIds.add(message.branchId);
      ws.send(JSON.stringify({ type: "SUBSCRIBED", channel: `branch:${message.branchId}` }));
    } else if (message.action === "SUBSCRIBE_ORDER" && message.orderId) {
      subs.orderIds.add(message.orderId);
      ws.send(JSON.stringify({ type: "SUBSCRIBED", channel: `order:${message.orderId}` }));
    }
  }

  publishOrderCreated(event: OrderCreatedEvent): void {
    const payload = JSON.stringify({
      type: "ORDER_CREATED",
      data: event,
    });

    for (const [ws, subs] of this.clientSubscriptions.entries()) {
      if (ws.readyState === WebSocket.OPEN) {
        // Broadcast to clients subscribed to this branch or all if not filtered
        if (subs.branchIds.size === 0 || subs.branchIds.has(event.branchId)) {
          ws.send(payload);
        }
      }
    }
  }

  publishOrderStatusChanged(event: OrderStatusChangedEvent): void {
    const payload = JSON.stringify({
      type: "ORDER_STATUS_CHANGED",
      data: event,
    });

    for (const [ws, subs] of this.clientSubscriptions.entries()) {
      if (ws.readyState === WebSocket.OPEN) {
        const isBranchSub = subs.branchIds.size === 0;
        const isOrderSub = subs.orderIds.has(event.orderId);

        if (isBranchSub || isOrderSub) {
          ws.send(payload);
        }
      }
    }
  }

  close(): void {
    if (this.wss) {
      this.wss.close();
    }
  }
}

// Singleton broadcaster instance for the Order module
export const orderBroadcaster = new WebSocketOrderBroadcaster();
