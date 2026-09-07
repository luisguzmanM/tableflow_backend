import { Modifier } from "./Modifier";

export interface ModifierGroupProps {
  id: string;
  menuItemId: string;
  name: string;
  minSelections?: number;
  maxSelections?: number;
  position?: number;
  modifiers?: Modifier[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class ModifierGroup {
  readonly id: string;
  readonly menuItemId: string;
  readonly name: string;
  readonly minSelections: number;
  readonly maxSelections: number;
  readonly position: number;
  readonly modifiers: Modifier[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: ModifierGroupProps) {
    if (!props.menuItemId) {
      throw new Error("ModifierGroup must belong to a menu item");
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("ModifierGroup name cannot be empty");
    }
    const min = props.minSelections ?? 0;
    const max = props.maxSelections ?? 1;

    if (min < 0) {
      throw new Error("minSelections cannot be negative");
    }
    if (max < min) {
      throw new Error("maxSelections cannot be less than minSelections");
    }

    this.id = props.id;
    this.menuItemId = props.menuItemId;
    this.name = props.name.trim();
    this.minSelections = min;
    this.maxSelections = max;
    this.position = props.position ?? 0;
    this.modifiers = props.modifiers ? [...props.modifiers] : [];
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  validateSelectionCount(count: number): boolean {
    return count >= this.minSelections && count <= this.maxSelections;
  }
}
