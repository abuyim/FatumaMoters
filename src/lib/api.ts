import type { Inquiry, SiteContent, Vehicle } from "@/types/site";

const adminTokenKey = "fm_admin_token";

const getAdminToken = () => {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(adminTokenKey) || "";
};

const getAuthHeaders = () => {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminAuth = {
  tokenKey: adminTokenKey,
  getToken: getAdminToken,
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(adminTokenKey, token);
    }
  },
  clearToken: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(adminTokenKey);
    }
  },
};

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
  loginAdmin: (payload: { username: string; password: string }) =>
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(toJson<{ token: string }>),
  getAdminSession: () =>
    fetch("/api/auth/session", {
      headers: { ...getAuthHeaders() },
    }).then(toJson<{ authenticated: boolean }>),
  logoutAdmin: () =>
    fetch("/api/auth/logout", {
      method: "POST",
      headers: { ...getAuthHeaders() },
    }).then(toJson<void>),
  getContent: () => fetch("/api/content").then(toJson<SiteContent>),
  updateContent: (content: SiteContent) =>
    fetch("/api/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(content),
    }).then(toJson<SiteContent>),
  getVehicles: () => fetch("/api/vehicles").then(toJson<Vehicle[]>),
  createVehicle: (vehicle: Vehicle) =>
    fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(vehicle),
    }).then(toJson<Vehicle>),
  updateVehicle: (vehicle: Vehicle) =>
    fetch(`/api/vehicles/${vehicle.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(vehicle),
    }).then(toJson<Vehicle>),
  deleteVehicle: (vehicleId: string) =>
    fetch(`/api/vehicles/${vehicleId}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    }).then(toJson<void>),
  createInquiry: (payload: Omit<Inquiry, "id" | "createdAt">) =>
    fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(toJson<Inquiry>),
  getInquiries: () =>
    fetch("/api/inquiries", {
      headers: { ...getAuthHeaders() },
    }).then(toJson<Inquiry[]>),
  deleteInquiry: (inquiryId: string) =>
    fetch(`/api/inquiries/${inquiryId}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    }).then(toJson<void>),
};
