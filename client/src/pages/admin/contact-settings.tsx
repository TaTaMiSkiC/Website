import React from "react";
import { Helmet } from "react-helmet";
import AdminLayout from "@/components/admin/AdminLayout";
import ContactSettingsForm from "@/components/admin/ContactSettingsForm";

export default function ContactSettingsPage() {
  return (
    <>
      <Helmet>
        <title>Kontakt podaci | Admin Panel</title>
      </Helmet>
      
      <AdminLayout>
        <div className="container py-6">
          <h1 className="text-3xl font-bold mb-6">Kontakt podaci</h1>
          <p className="text-muted-foreground mb-6">
            Uredite kontakt podatke za vašu trgovinu. Ovi podaci bit će prikazani na kontakt stranici i u podnožju web stranice.
          </p>
          
          <ContactSettingsForm />
        </div>
      </AdminLayout>
    </>
  );
}