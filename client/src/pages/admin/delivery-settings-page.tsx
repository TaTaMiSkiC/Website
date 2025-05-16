import React from "react";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/admin/AdminLayout";
import ShippingSettingsForm from "@/components/admin/ShippingSettingsForm";
import { Truck } from "lucide-react";

export default function DeliverySettingsPage() {
  return (
    <AdminLayout title="Postavke dostave">
      <Helmet>
        <title>Postavke dostave | Admin Panel</title>
      </Helmet>
      
      <div className="flex items-center mb-6">
        <Truck className="mr-2 h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Postavke dostave</h1>
          <p className="text-muted-foreground">Upravljajte troškovima dostave i postavkama dostave</p>
        </div>
      </div>
      
      <div className="space-y-4 bg-card p-6 rounded-md border">
        <ShippingSettingsForm />
      </div>
    </AdminLayout>
  );
}