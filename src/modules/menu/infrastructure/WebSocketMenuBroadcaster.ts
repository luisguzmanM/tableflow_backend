import { WebSocket, WebSocketServer } from "ws";
import { Server as HttpServer } from "http";

export interface MenuItemAvailabilityChangedEvent {
  restaurantId: string;
  itemId: string;
  available: boolean;
}

interface ClientSubscription {
  restaurantIds: Set<string>;
}

export class WebSocketMenuBroadcaster {
  private wss: WebSocketServer | null = null;
  private clientSubscriptions = new Map<WebSocket, ClientSubscription>();

  attach(server: HttpServer, path: string = "/ws/menu"): void {
    this.wss = new WebSocketServer({ server, path });

    this.wss.on("connection", (ws: WebSocket) => {
      this.clientSubscriptions.set(ws, {
        restaurantIds: new Set(),
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

      ws.send(JSON.stringify({ type: "CONNECTED", message: "TableFlow Menu WebSocket Connected" }));
    });
  }

  private handleClientMessage(ws: WebSocket, message: any): void {
    const subs = this.clientSubscriptions.get(ws);
    if (!subs) return;

    if (message.action === "SUBSCRIBE_MENU" && message.restaurantId) {
      subs.restaurantIds.add(message.restaurantId);
      ws.send(JSON.stringify({ type: "SUBSCRIBED", channel: `menu:${message.restaurantId}` }));
    }
  }

  publishItemAvailabilityChanged(event: MenuItemAvailabilityChangedEvent): void {
    const payload = JSON.stringify({
      type: "MENU_ITEM_AVAILABILITY_CHANGED",
      data: event,
    });

    for (const [ws, subs] of this.clientSubscriptions.entries()) {
      if (ws.readyState === WebSocket.OPEN) {
        if (subs.restaurantIds.has(event.restaurantId)) {
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

export const menuBroadcaster = new WebSocketMenuBroadcaster();
