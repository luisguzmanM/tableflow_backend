# Auth Module

Responsible for employee users, roles (`ADMIN`, `WAITER`, `KITCHEN`, `CASHIER`), authentication, and permission verification.

## Internal Layers
- `domain/`: Business entities (`User`, `Role`), password hashing contracts, and repository interfaces.
- `application/`: Use cases for user registration, authentication (login), and permission checking.
- `infrastructure/`: PostgreSQL repositories and crypto adapters.
- `presentation/`: Express routers, auth middleware, controllers, and Joi validation schemas.
