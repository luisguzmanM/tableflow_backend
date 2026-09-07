# Order Module

Responsible for table orders, order items with product and modifier snapshots, status lifecycle transitions, and realtime events.

## Internal Layers
- `domain/`: Business entities (`Order`, `OrderItem`, `SelectedModifier`, `OrderStatus`), lifecycle transition invariants, and repository interfaces.
- `application/`: Use cases for creating orders, advancing status, and fetching order queues (kitchen, waiter, cashier).
- `infrastructure/`: PostgreSQL repositories and WebSocket/event broadcasting adapters.
- `presentation/`: Express routers, controllers, Joi validation schemas, and WebSocket connection handlers.
