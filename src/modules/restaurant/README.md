# Restaurant Module

Responsible for restaurants, branches, and tables.

## Internal Layers
- `domain/`: Business entities (`Restaurant`, `Branch`, `Table`), value objects, business rules, and repository interfaces.
- `application/`: Use cases for restaurant, branch, and table management.
- `infrastructure/`: PostgreSQL repositories and adapters.
- `presentation/`: Express routers, controllers, and Joi validation schemas.
