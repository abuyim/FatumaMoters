import { useMemo, useState } from "react";
import VehicleCard from "@/components/VehicleCard";
import SectionHeading from "@/components/SectionHeading";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSiteContent, useVehicles } from "@/hooks/use-site-data";
import { PageError, PageLoader } from "@/components/PageState";

const Inventory = () => {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [availFilter, setAvailFilter] = useState<string>("all");
  const contentQuery = useSiteContent();
  const vehiclesQuery = useVehicles();

  const filtered = useMemo(() => {
    return (vehiclesQuery.data || []).filter((vehicle) => {
      if (typeFilter !== "all" && vehicle.type !== typeFilter) return false;
      if (availFilter !== "all" && vehicle.availability !== availFilter) return false;
      if (priceFilter === "under200k" && vehicle.price >= 200000) return false;
      if (priceFilter === "200k-500k" && (vehicle.price < 200000 || vehicle.price > 500000)) return false;
      if (priceFilter === "over500k" && vehicle.price <= 500000) return false;
      return true;
    });
  }, [vehiclesQuery.data, typeFilter, priceFilter, availFilter]);

  if (contentQuery.isLoading || vehiclesQuery.isLoading) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  if (contentQuery.isError || vehiclesQuery.isError || !contentQuery.data || !vehiclesQuery.data) {
    return (
      <Layout>
        <PageError message={contentQuery.error?.message || vehiclesQuery.error?.message || "Inventory data could not be loaded."} />
      </Layout>
    );
  }

  const inventoryPage = contentQuery.data.inventoryPage;

  const clearFilters = () => {
    setTypeFilter("all");
    setPriceFilter("all");
    setAvailFilter("all");
  };

  return (
    <Layout>
      <section className="bg-surface py-12 md:py-16">
        <div className="container">
          <SectionHeading label={inventoryPage.label} title={inventoryPage.title} description={inventoryPage.description} />

          <div className="mb-8 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
            <div className="min-w-[140px] flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Vehicle Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="motorcycle">Motorcycles</SelectItem>
                  <SelectItem value="bajaj">Bajaj Three-Wheelers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[140px] flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Price Range</label>
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="under200k">Under ETB 200,000</SelectItem>
                  <SelectItem value="200k-500k">ETB 200,000-500,000</SelectItem>
                  <SelectItem value="over500k">Over ETB 500,000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[140px] flex-1">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Availability</label>
              <Select value={availFilter} onValueChange={setAvailFilter}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="on-order">On Order</SelectItem>
                  <SelectItem value="sold-out">Sold Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFilters}>Clear Filters</Button>
          </div>

          <p className="mb-6 text-sm text-muted-foreground">{filtered.length} vehicle{filtered.length !== 1 ? "s" : ""} found</p>

          {filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card py-16 text-center">
              <p className="text-lg font-semibold text-foreground">No vehicles match your filters</p>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or contact us for custom orders.</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Inventory;
