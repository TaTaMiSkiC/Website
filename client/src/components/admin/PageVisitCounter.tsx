import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { PageVisit } from "@shared/schema";
import { Loader2 } from "lucide-react";

export function PageVisitCounter() {
  const { user } = useAuth();
  const [hasRegisteredVisit, setHasRegisteredVisit] = useState(false);
  
  // Samo dohvati broj posjeta ako je admin prijavljen
  const { data: visitData, isLoading } = useQuery<PageVisit[]>({
    queryKey: ["/api/page-visits"],
    queryFn: async () => {
      const res = await fetch("/api/page-visits");
      if (!res.ok) {
        throw new Error("Neuspješno dohvaćanje broja posjeta");
      }
      return res.json();
    },
    enabled: !!user?.isAdmin, // Samo omogući upit ako je admin prijavljen
  });

  // Registriranje posjeta pri učitavanju stranice
  useEffect(() => {
    if (!hasRegisteredVisit) {
      // Koristimo POST metodu za povećanje brojača
      fetch("/api/page-visits", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "/" })
      })
      .then(() => setHasRegisteredVisit(true))
      .catch(error => console.error("Greška prilikom brojanja posjeta:", error));
    }
  }, [hasRegisteredVisit]);

  // Ništa ne prikazuj ako korisnik nije admin
  if (!user?.isAdmin) return null;

  if (isLoading) {
    return (
      <div className="flex items-center text-gray-500 text-xs">
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
        Učitavanje statistike...
      </div>
    );
  }

  // Nađi broj posjeta za početnu stranicu ('/')
  const homepageVisit = visitData?.find(visit => visit.path === '/');
  
  return (
    <div className="text-gray-500 text-xs">
      Broj posjeta stranice: {homepageVisit?.count || 0}
    </div>
  );
}