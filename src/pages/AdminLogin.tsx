import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { adminAuth, api } from "@/lib/api";

const AdminLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const token = adminAuth.getToken();
  const [form, setForm] = useState({ username: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination = (location.state as { from?: string } | null)?.from || "/admin";

  if (token) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      toast({ title: "Please enter username and password.", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      const data = await api.loginAdmin({ username: form.username, password: form.password });
      adminAuth.setToken(data.token);
      toast({ title: "Login successful." });
      navigate(destination, { replace: true });
    } catch (error) {
      toast({ title: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="bg-surface py-14 md:py-20">
        <div className="container max-w-md">
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Admin Access</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-foreground">Admin Login</h1>
            <p className="mt-2 text-sm text-muted-foreground">Login to manage products, content sections, social links, and inquiries.</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit}>
              <Input
                placeholder="Username"
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
              />
              <Input
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AdminLogin;
