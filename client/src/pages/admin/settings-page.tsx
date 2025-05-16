import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function AdminSettings() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Automatski preusmjeri na stranicu za postavke dostave
    setLocation("/admin/delivery-settings");
  }, [setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Preusmjeravanje na postavke dostave...</p>
      </div>
    </div>
  );
}