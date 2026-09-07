import { describe, it, expect } from "vitest";
import { ModifierGroup } from "../../src/modules/menu/domain/ModifierGroup";
import { MenuItem } from "../../src/modules/menu/domain/MenuItem";

describe("Menu Domain Entities", () => {
  it("should validate modifier group selection bounds", () => {
    const singleChoiceGroup = new ModifierGroup({
      id: "group-1",
      menuItemId: "item-1",
      name: "Punto de la carne",
      minSelections: 1,
      maxSelections: 1,
    });

    expect(singleChoiceGroup.validateSelectionCount(1)).toBe(true);
    expect(singleChoiceGroup.validateSelectionCount(0)).toBe(false);
    expect(singleChoiceGroup.validateSelectionCount(2)).toBe(false);

    const multiChoiceGroup = new ModifierGroup({
      id: "group-2",
      menuItemId: "item-1",
      name: "Extras",
      minSelections: 0,
      maxSelections: 3,
    });

    expect(multiChoiceGroup.validateSelectionCount(0)).toBe(true);
    expect(multiChoiceGroup.validateSelectionCount(2)).toBe(true);
    expect(multiChoiceGroup.validateSelectionCount(3)).toBe(true);
    expect(multiChoiceGroup.validateSelectionCount(4)).toBe(false);
  });

  it("should prevent negative prices in MenuItem", () => {
    expect(() => {
      new MenuItem({
        id: "item-1",
        categoryId: "cat-1",
        name: "Test Item",
        price: -5,
      });
    }).toThrow("MenuItem price cannot be negative");
  });
});
