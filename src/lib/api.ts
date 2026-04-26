import type { Inquiry, SiteContent, Vehicle } from "@/types/site";

const toJson = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: "Request failed." }));
    throw new Error(data.message || "Request failed.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

export const api = {
  getContent: () => fetch("/api/content").then(toJson<SiteContent>),
  updateContent: (content: SiteContent) =>
    fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content),
    }).then(toJson<SiteContent>),
  getVehicles: () => fetch("/api/vehicles").then(toJson<Vehicle[]>),
  createVehicle: (vehicle: Vehicle) =>
    fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vehicle),
    }).then(toJson<Vehicle>),
  updateVehicle: (vehicle: Vehicle) =>
    fetch(`/api/vehicles/${vehicle.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vehicle),
    }).then(toJson<Vehicle>),
  deleteVehicle: (vehicleId: string) =>
    fetch(`/api/vehicles/${vehicleId}`, {
      method: "DELETE",
    }).then(toJson<void>),
  createInquiry: (payload: Omit<Inquiry, "id" | "createdAt">) =>
    fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(toJson<Inquiry>),
  getInquiries: () => fetch("/api/inquiries").then(toJson<Inquiry[]>),
  deleteInquiry: (inquiryId: string) =>
    fetch(`/api/inquiries/${inquiryId}`, {
      method: "DELETE",
    }).then(toJson<void>),
};
