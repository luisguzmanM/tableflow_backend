import { MenuRepository } from "../domain/MenuRepository";

export class DeleteMenuItem {
  constructor(private readonly menuRepository: MenuRepository) {}

  async execute(menuItemId: string): Promise<void> {
    const existing = await this.menuRepository.findMenuItemById(menuItemId);
    if (!existing) {
      const error = new Error("Menu item not found");
      (error as any).statusCode = 404;
      throw error;
    }

    await this.menuRepository.deleteMenuItem(menuItemId);
  }
}
