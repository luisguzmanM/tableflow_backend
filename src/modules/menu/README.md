# Menu Module

Responsible for menus, categories, menu items, and modifier groups/modifiers.

## Internal Layers
- `domain/`: Business entities (`Menu`, `Category`, `MenuItem`, `ModifierGroup`, `Modifier`), rules, and repository interfaces.
- `application/`: Use cases for managing the menu and querying available items.
- `infrastructure/`: PostgreSQL repositories and adapters.
- `presentation/`: Express routers, controllers, and Joi validation schemas.
