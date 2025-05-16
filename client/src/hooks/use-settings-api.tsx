import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface Setting {
  id: number;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export function useSettings() {
  const { toast } = useToast();

  // Hook za dohvaćanje svih postavki
  const allSettings = useQuery<Setting[]>({
    queryKey: ["/api/settings"],
    staleTime: 1000 * 60 * 5, // 5 minuta
  });

  // Hook za dohvaćanje vrijednosti određene postavke
  const getSetting = (key: string) => {
    return useQuery<Setting>({
      queryKey: ["/api/settings", key],
      enabled: !!key,
      staleTime: 0, // Uvijek dohvaćaj svježe podatke
      refetchOnWindowFocus: true, // Osvježi podatke kada se prozor fokusira
      refetchOnMount: true, // Osvježi pri svakom mountanju komponente
      refetchInterval: 2000, // Osvježi svakih 2 sekunde (dok je razvoj)
    });
  };

  // Hook za ažuriranje ili dodavanje nove vrijednosti postavke
  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      // Prvo provjerimo postoji li postavka
      const response = await apiRequest("GET", `/api/settings/${key}`);
      
      if (response.status === 200) {
        // Ako postoji, ažuriramo je
        const updatedResponse = await apiRequest("PUT", `/api/settings/${key}`, { value });
        return await updatedResponse.json();
      } else if (response.status === 404) {
        // Ako ne postoji, kreiramo novu
        const newResponse = await apiRequest("POST", "/api/settings", { key, value });
        return await newResponse.json();
      } else {
        throw new Error("Error checking setting status");
      }
    },
    onSuccess: (data: Setting) => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings", data.key] });
      toast({
        title: "Postavka spremljena",
        description: `Postavka "${data.key}" je uspješno spremljena.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Greška pri spremanju postavke",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Hook za brisanje postavke
  const deleteSetting = useMutation({
    mutationFn: async (key: string) => {
      await apiRequest("DELETE", `/api/settings/${key}`);
      return key;
    },
    onSuccess: (key: string) => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/settings", key] });
      toast({
        title: "Postavka izbrisana",
        description: `Postavka "${key}" je uspješno izbrisana.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Greška pri brisanju postavke",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Pomoćna funkcija za dohvaćanje vrijednosti postavke iz rezultata upita
  const getSettingValue = (key: string, defaultValue: string = "") => {
    const { data, isLoading, error } = getSetting(key);
    if (isLoading || error || !data) {
      return defaultValue;
    }
    return data.value;
  };

  return {
    allSettings,
    getSetting,
    updateSetting,
    deleteSetting,
    getSettingValue,
  };
}