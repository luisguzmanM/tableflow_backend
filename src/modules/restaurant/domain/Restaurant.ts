export interface RestaurantProps {
  id: string;
  name: string;
  tagline?: string;
  currency?: string;
  serviceHours?: string;
  acceptOrders?: boolean;
  askTip?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Restaurant {
  readonly id: string;
  readonly name: string;
  readonly tagline?: string;
  readonly currency: string;
  readonly serviceHours?: string;
  readonly acceptOrders: boolean;
  readonly askTip: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: RestaurantProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Restaurant name cannot be empty");
    }
    this.id = props.id;
    this.name = props.name.trim();
    this.tagline = props.tagline;
    this.currency = props.currency || "EUR";
    this.serviceHours = props.serviceHours;
    this.acceptOrders = props.acceptOrders ?? true;
    this.askTip = props.askTip ?? true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }
}
