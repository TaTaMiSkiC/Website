import { Helmet } from 'react-helmet';
import AdminLayout from "@/components/admin/AdminLayout";
import DocumentManager from "@/components/admin/DocumentManager";

export default function DocumentManagementPage() {
  return (
    <>
      <Helmet>
        <title>Upravljanje dokumentima | Admin Panel</title>
      </Helmet>
      
      <AdminLayout title="Upravljanje dokumentima">
        <div className="container py-6">
          <DocumentManager />
        </div>
      </AdminLayout>
    </>
  );
}