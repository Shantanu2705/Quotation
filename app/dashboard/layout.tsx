import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Layout(props: any) {
  return (
    <ProtectedRoute>
      <DashboardLayout>{props.children}</DashboardLayout>
    </ProtectedRoute>
  );
}
