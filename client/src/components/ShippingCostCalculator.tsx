import { useSettings } from "@/hooks/use-settings-api";
import { useLanguage } from "@/hooks/use-language";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";

interface ShippingCostCalculatorProps {
  subtotal: number;
}

export function ShippingCostCalculator({ subtotal }: ShippingCostCalculatorProps) {
  const { getSetting } = useSettings();
  const { t } = useLanguage();
  const [directValues, setDirectValues] = useState<{
    freeShippingThreshold: string;
    standardShippingRate: string;
  } | null>(null);
  const [isDirectlyLoading, setIsDirectlyLoading] = useState(true);
  
  // Direktan pristup API-ju za zaobilaženje React Query keša
  useEffect(() => {
    const fetchDirectData = async () => {
      try {
        setIsDirectlyLoading(true);
        const freeThresholdResponse = await fetch("/api/settings/freeShippingThreshold");
        const freeThresholdData = await freeThresholdResponse.json();
        
        const standardRateResponse = await fetch("/api/settings/standardShippingRate");
        const standardRateData = await standardRateResponse.json();
        
        console.log("Učitane postavke iz API-ja:", {
          freeShippingThreshold: freeThresholdData.value,
          standardShippingRate: standardRateData.value,
          expressShippingRate: standardRateData.value,
        });
        
        // Spremi najsvježije podatke u state
        setDirectValues({
          freeShippingThreshold: freeThresholdData.value,
          standardShippingRate: standardRateData.value,
        });
        
        // Ažuriraj i localStorage
        localStorage.setItem('freeShippingThreshold', freeThresholdData.value);
        localStorage.setItem('standardShippingRate', standardRateData.value);
        
        // Invalidiate React Query keš za automatsko osvježavanje
        queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
        queryClient.invalidateQueries({ queryKey: ["/api/settings", "freeShippingThreshold"] });
        queryClient.invalidateQueries({ queryKey: ["/api/settings", "standardShippingRate"] });
      } catch (error) {
        console.error("Greška pri dohvaćanju postavki:", error);
      } finally {
        setIsDirectlyLoading(false);
      }
    };
    
    fetchDirectData();
  }, []);
  
  // Dohvati postavke troškova dostave preko React Query-ja (kao fallback)
  const { data: freeShippingThresholdSetting, isLoading: isLoadingFreeShippingThreshold } = 
    getSetting("freeShippingThreshold");
  const { data: standardShippingRateSetting, isLoading: isLoadingStandardShippingRate } = 
    getSetting("standardShippingRate");
  
  const isLoading = (isLoadingFreeShippingThreshold || isLoadingStandardShippingRate) && isDirectlyLoading;
  
  if (isLoading) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t('cart.loading')}
      </div>
    );
  }
  
  // Prioritiziraj direktno dohvaćene vrijednosti, zatim React Query vrijednosti, pa fallback
  const apiThreshold = directValues?.freeShippingThreshold || freeShippingThresholdSetting?.value || "50";
  const apiRate = directValues?.standardShippingRate || standardShippingRateSetting?.value || "5";
  
  // Koristi vrijednosti iz API-ja
  const freeShippingThreshold = parseFloat(apiThreshold);
  const standardShippingRate = parseFloat(apiRate);
  
  // Ako je standardShippingRate postavljen na 0, dostava je uvijek besplatna
  if (standardShippingRate === 0) {
    return (
      <div className="flex justify-between py-2">
        <span className="text-muted-foreground">{t('cart.shipping')}:</span>
        <span className="font-medium text-green-600 dark:text-green-500">{t('cart.shippingFree')}</span>
      </div>
    );
  }
  
  const isFreeShipping = subtotal >= freeShippingThreshold && freeShippingThreshold > 0;
  const shippingCost = isFreeShipping ? 0 : standardShippingRate;
  
  return (
    <div className="flex justify-between py-2">
      <span className="text-muted-foreground">{t('cart.shipping')}:</span>
      <span>
        {isFreeShipping ? (
          <span className="font-medium text-green-600 dark:text-green-500">{t('cart.shippingFree')}</span>
        ) : (
          <span>{shippingCost.toFixed(2)} €</span>
        )}
      </span>
    </div>
  );
}

// Komponenta za prikaz informacije o potrebnom iznosu za besplatnu dostavu
export function FreeShippingProgress({ subtotal }: ShippingCostCalculatorProps) {
  const { getSetting } = useSettings();
  const { t, translateText } = useLanguage();
  const [directValues, setDirectValues] = useState<{
    freeShippingThreshold: string;
    standardShippingRate: string;
  } | null>(null);
  const [isDirectlyLoading, setIsDirectlyLoading] = useState(true);
  
  // Direktan pristup API-ju za zaobilaženje React Query keša
  useEffect(() => {
    const fetchDirectData = async () => {
      try {
        setIsDirectlyLoading(true);
        const freeThresholdResponse = await fetch("/api/settings/freeShippingThreshold");
        const freeThresholdData = await freeThresholdResponse.json();
        
        const standardRateResponse = await fetch("/api/settings/standardShippingRate");
        const standardRateData = await standardRateResponse.json();
        
        console.log("Direktno dohvaćene postavke (traka napretka):", {
          freeShippingThreshold: freeThresholdData.value,
          standardShippingRate: standardRateData.value
        });
        
        // Spremi najsvježije podatke u state
        setDirectValues({
          freeShippingThreshold: freeThresholdData.value,
          standardShippingRate: standardRateData.value,
        });
        
        // Ažuriraj i localStorage
        localStorage.setItem('freeShippingThreshold', freeThresholdData.value);
        localStorage.setItem('standardShippingRate', standardRateData.value);
      } catch (error) {
        console.error("Greška pri dohvaćanju postavki:", error);
      } finally {
        setIsDirectlyLoading(false);
      }
    };
    
    fetchDirectData();
  }, []);
  
  // Dohvati postavke za besplatnu dostavu (kao fallback)
  const { data: freeShippingThresholdSetting, isLoading: isLoadingFreeThreshold } = getSetting("freeShippingThreshold");
  const { data: standardShippingRateSetting, isLoading: isLoadingShippingRate } = getSetting("standardShippingRate");
  
  const isLoading = (isLoadingFreeThreshold || isLoadingShippingRate) && isDirectlyLoading;
  
  if (isLoading) {
    return null;
  }
  
  // Prioritiziraj direktno dohvaćene vrijednosti, zatim React Query vrijednosti, pa fallback
  const apiThreshold = directValues?.freeShippingThreshold || freeShippingThresholdSetting?.value || "50";
  const apiRate = directValues?.standardShippingRate || standardShippingRateSetting?.value || "5";
  
  // Koristi vrijednosti iz API-ja
  const freeShippingThreshold = parseFloat(apiThreshold);
  const standardShippingRate = parseFloat(apiRate);
  
  // Ako je standardShippingRate 0, dostava je uvijek besplatna, pa ne prikazujemo informaciju
  // Također, ako je prag za besplatnu dostavu 0 ili je već dosegnut prag, ne prikazujemo komponentu
  if (standardShippingRate === 0 || freeShippingThreshold <= 0 || subtotal >= freeShippingThreshold) {
    return null;
  }
  
  const remaining = freeShippingThreshold - subtotal;
  const progressPercentage = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  
  return (
    <div className="mt-2 p-3 bg-muted/40 rounded-md">
      <p className="text-sm mb-2">
        {translateText(t('cart.addMoreForFreeShipping').replace('{amount}', remaining.toFixed(2)))}
      </p>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}