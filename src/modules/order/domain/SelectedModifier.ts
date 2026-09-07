export interface SelectedModifierProps {
  id?: string;
  modifierId?: string | null;
  modifierName: string;
  price: number;
}

export class SelectedModifier {
  readonly id?: string;
  readonly modifierId: string | null;
  readonly modifierName: string;
  readonly price: number;

  constructor(props: SelectedModifierProps) {
    if (!props.modifierName || props.modifierName.trim().length === 0) {
      throw new Error("SelectedModifier must have a modifierName snapshot");
    }
    if (props.price < 0) {
      throw new Error("SelectedModifier price cannot be negative");
    }

    this.id = props.id;
    this.modifierId = props.modifierId ?? null;
    this.modifierName = props.modifierName.trim();
    this.price = props.price;
  }
}
