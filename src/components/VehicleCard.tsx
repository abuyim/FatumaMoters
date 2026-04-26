import { Link } from "react-router-dom";
import { Fuel, Gauge, Cog } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/data/vehicles";
import type { Vehicle } from "@/types/site";

const availabilityStyles: Record<string, string> = {
  "in-stock": "bg-emerald-100 text-emerald-800",
  "on-order": "bg-amber-100 text-amber-800",
  "sold-out": "bg-red-100 text-red-800",
};

const availabilityLabels: Record<string, string> = {
  "in-stock": "In Stock",
  "on-order": "On Order",
  "sold-out": "Sold Out",
};

const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
  <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg">
    <div className="relative aspect-[4/3] bg-muted">
      <img src={vehicle.image} alt={vehicle.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <Badge className={`absolute left-3 top-3 ${availabilityStyles[vehicle.availability]}`}>
        {availabilityLabels[vehicle.availability]}
      </Badge>
      {vehicle.popular && <Badge className="absolute right-3 top-3 bg-primary text-primary-foreground">Popular</Badge>}
    </div>
    <div className="flex flex-1 flex-col p-5">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {vehicle.category} · {vehicle.type === "bajaj" ? "Bajaj" : "Motorcycle"}
      </p>
      <h3 className="font-heading text-lg font-bold text-foreground">{vehicle.name}</h3>
      <p className="mt-1 text-xl font-bold text-primary">{formatPrice(vehicle.price)}</p>
      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{vehicle.specs.engine}</span>
        <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" />{vehicle.specs.power}</span>
        <span className="flex items-center gap-1"><Cog className="h-3.5 w-3.5" />{vehicle.specs.transmission}</span>
      </div>
      <div className="mt-auto flex gap-2 pt-4">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to={`/inventory/${vehicle.id}`}>View Details</Link>
        </Button>
        <Button asChild size="sm" className="flex-1">
          <Link to={`/contact?vehicle=${encodeURIComponent(vehicle.name)}`}>Inquire</Link>
        </Button>
      </div>
    </div>
  </div>
);

export default VehicleCard;
