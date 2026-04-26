export type { Availability, Vehicle, VehicleType } from "@/types/site";

export const formatPrice = (price: number) => `ETB ${price.toLocaleString()}`;
