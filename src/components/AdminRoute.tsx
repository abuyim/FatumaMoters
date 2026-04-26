import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { PageLoader } from "@/components/PageState";
import { adminAuth, api } from "@/lib/api";

const AdminRoute = () => {
  const location = useLocation();
  const token = adminAuth.getToken();

  const sessionQuery = useQuery({
    queryKey: ["admin-session", token],
    queryFn: api.getAdminSession,
    enabled: Boolean(token),
    retry: false,
    staleTime: 30_000,
  });

  if (!token) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (sessionQuery.isLoading) {
    return (
      <Layout>
        <PageLoader />
      </Layout>
    );
  }

  if (sessionQuery.isError || !sessionQuery.data?.authenticated) {
    adminAuth.clearToken();
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default AdminRoute;
