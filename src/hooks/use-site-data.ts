import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Inquiry, SiteContent, Vehicle } from "@/types/site";

export const siteContentQueryKey = ["site-content"];
export const vehiclesQueryKey = ["vehicles"];
export const inquiriesQueryKey = ["inquiries"];

export const useSiteContent = () =>
  useQuery({
    queryKey: siteContentQueryKey,
    queryFn: api.getContent,
  });

export const useVehicles = () =>
  useQuery({
    queryKey: vehiclesQueryKey,
    queryFn: api.getVehicles,
  });

export const useInquiries = () =>
  useQuery({
    queryKey: inquiriesQueryKey,
    queryFn: api.getInquiries,
  });

export const useUpdateSiteContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: SiteContent) => api.updateContent(content),
    onSuccess: (content) => {
      queryClient.setQueryData(siteContentQueryKey, content);
    },
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicle: Vehicle) => api.createVehicle(vehicle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesQueryKey });
    },
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicle: Vehicle) => api.updateVehicle(vehicle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesQueryKey });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehicleId: string) => api.deleteVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiclesQueryKey });
    },
  });
};

export const useCreateInquiry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Omit<Inquiry, "id" | "createdAt">) => api.createInquiry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inquiriesQueryKey });
    },
  });
};

export const useDeleteInquiry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inquiryId: string) => api.deleteInquiry(inquiryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inquiriesQueryKey });
    },
  });
};
