import { Pool } from "pg";
import { Menu } from "../domain/Menu";
import { Category } from "../domain/Category";
import { MenuItem } from "../domain/MenuItem";
import { ModifierGroup } from "../domain/ModifierGroup";
import { Modifier } from "../domain/Modifier";
import { MenuRepository } from "../domain/MenuRepository";
import { dbPool } from "../../../shared/infrastructure/database/pool";

export class PostgresMenuRepository implements MenuRepository {
  constructor(private readonly pool: Pool = dbPool) {}

  async findByRestaurantId(restaurantId: string): Promise<Menu | null> {
    // 1. Get menu
    const menuRes = await this.pool.query(
      `SELECT id, restaurant_id, created_at, updated_at FROM menus WHERE restaurant_id = $1`,
      [restaurantId]
    );
    if (menuRes.rows.length === 0) return null;
    const menuRow = menuRes.rows[0];

    // 2. Get categories
    const catRes = await this.pool.query(
      `SELECT id, menu_id, name, position, created_at, updated_at 
       FROM categories 
       WHERE menu_id = $1 
       ORDER BY position ASC, created_at ASC`,
      [menuRow.id]
    );

    // 3. Get all items in this menu's categories
    const itemRes = await this.pool.query(
      `SELECT mi.id, mi.category_id, mi.name, mi.description, mi.price, mi.image, mi.available, mi.position, mi.created_at, mi.updated_at
       FROM menu_items mi
       JOIN categories c ON mi.category_id = c.id
       WHERE c.menu_id = $1
       ORDER BY mi.position ASC, mi.created_at ASC`,
      [menuRow.id]
    );

    // 4. Get all modifier groups
    const groupRes = await this.pool.query(
      `SELECT mg.id, mg.menu_item_id, mg.name, mg.min_selections, mg.max_selections, mg.position, mg.created_at, mg.updated_at
       FROM modifier_groups mg
       JOIN menu_items mi ON mg.menu_item_id = mi.id
       JOIN categories c ON mi.category_id = c.id
       WHERE c.menu_id = $1
       ORDER BY mg.position ASC, mg.created_at ASC`,
      [menuRow.id]
    );

    // 5. Get all modifiers
    const modRes = await this.pool.query(
      `SELECT m.id, m.modifier_group_id, m.name, m.price, m.available, m.position, m.created_at, m.updated_at
       FROM modifiers m
       JOIN modifier_groups mg ON m.modifier_group_id = mg.id
       JOIN menu_items mi ON mg.menu_item_id = mi.id
       JOIN categories c ON mi.category_id = c.id
       WHERE c.menu_id = $1
       ORDER BY m.position ASC, m.created_at ASC`,
      [menuRow.id]
    );

    // Assemble hierarchical structure
    const modifiersByGroup = new Map<string, Modifier[]>();
    for (const m of modRes.rows) {
      const modifier = new Modifier({
        id: m.id,
        modifierGroupId: m.modifier_group_id,
        name: m.name,
        price: parseFloat(m.price),
        available: m.available,
        position: m.position,
        createdAt: m.created_at,
        updatedAt: m.updated_at,
      });
      const list = modifiersByGroup.get(m.modifier_group_id) || [];
      list.push(modifier);
      modifiersByGroup.set(m.modifier_group_id, list);
    }

    const groupsByItem = new Map<string, ModifierGroup[]>();
    for (const g of groupRes.rows) {
      const group = new ModifierGroup({
        id: g.id,
        menuItemId: g.menu_item_id,
        name: g.name,
        minSelections: g.min_selections,
        maxSelections: g.max_selections,
        position: g.position,
        modifiers: modifiersByGroup.get(g.id) || [],
        createdAt: g.created_at,
        updatedAt: g.updated_at,
      });
      const list = groupsByItem.get(g.menu_item_id) || [];
      list.push(group);
      groupsByItem.set(g.menu_item_id, list);
    }

    const itemsByCategory = new Map<string, MenuItem[]>();
    for (const i of itemRes.rows) {
      const item = new MenuItem({
        id: i.id,
        categoryId: i.category_id,
        name: i.name,
        description: i.description,
        price: parseFloat(i.price),
        image: i.image,
        available: i.available,
        position: i.position,
        modifierGroups: groupsByItem.get(i.id) || [],
        createdAt: i.created_at,
        updatedAt: i.updated_at,
      });
      const list = itemsByCategory.get(i.category_id) || [];
      list.push(item);
      itemsByCategory.set(i.category_id, list);
    }

    const categories: Category[] = catRes.rows.map((c) => {
      return new Category({
        id: c.id,
        menuId: c.menu_id,
        name: c.name,
        position: c.position,
        items: itemsByCategory.get(c.id) || [],
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      });
    });

    return new Menu({
      id: menuRow.id,
      restaurantId: menuRow.restaurant_id,
      categories,
      createdAt: menuRow.created_at,
      updatedAt: menuRow.updated_at,
    });
  }

  async findCategoryById(categoryId: string): Promise<Category | null> {
    const res = await this.pool.query(
      `SELECT id, menu_id, name, position, created_at, updated_at FROM categories WHERE id = $1`,
      [categoryId]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return new Category({
      id: row.id,
      menuId: row.menu_id,
      name: row.name,
      position: row.position,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async findMenuItemById(menuItemId: string): Promise<MenuItem | null> {
    const res = await this.pool.query(
      `SELECT id, category_id, name, description, price, image, available, position, created_at, updated_at 
       FROM menu_items WHERE id = $1`,
      [menuItemId]
    );
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return new MenuItem({
      id: row.id,
      categoryId: row.category_id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      image: row.image,
      available: row.available,
      position: row.position,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  async getRestaurantIdByMenuItemId(menuItemId: string): Promise<string | null> {
    const res = await this.pool.query(
      `SELECT m.restaurant_id 
       FROM menu_items mi
       JOIN categories c ON mi.category_id = c.id
       JOIN menus m ON c.menu_id = m.id
       WHERE mi.id = $1`,
      [menuItemId]
    );
    if (res.rows.length === 0) return null;
    return res.rows[0].restaurant_id;
  }

  async saveMenu(menu: Menu): Promise<void> {
    await this.pool.query(
      `INSERT INTO menus (id, restaurant_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET updated_at = NOW()`,
      [menu.id, menu.restaurantId, menu.createdAt, menu.updatedAt]
    );
  }

  async saveCategory(category: Category): Promise<void> {
    await this.pool.query(
      `INSERT INTO categories (id, menu_id, name, position, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         position = EXCLUDED.position,
         updated_at = NOW()`,
      [category.id, category.menuId, category.name, category.position, category.createdAt, category.updatedAt]
    );
  }

  async saveMenuItem(menuItem: MenuItem): Promise<void> {
    await this.pool.query(
      `INSERT INTO menu_items (id, category_id, name, description, price, image, available, position, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         category_id = EXCLUDED.category_id,
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         price = EXCLUDED.price,
         image = EXCLUDED.image,
         available = EXCLUDED.available,
         position = EXCLUDED.position,
         updated_at = NOW()`,
      [
        menuItem.id,
        menuItem.categoryId,
        menuItem.name,
        menuItem.description,
        menuItem.price,
        menuItem.image,
        menuItem.available,
        menuItem.position,
        menuItem.createdAt,
        menuItem.updatedAt,
      ]
    );
  }

  async setItemAvailability(menuItemId: string, available: boolean): Promise<void> {
    await this.pool.query(
      `UPDATE menu_items SET available = $1, updated_at = NOW() WHERE id = $2`,
      [available, menuItemId]
    );
  }

  async deleteMenuItem(menuItemId: string): Promise<void> {
    await this.pool.query(`DELETE FROM menu_items WHERE id = $1`, [menuItemId]);
  }
}
