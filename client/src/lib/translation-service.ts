import { Language } from "@/hooks/use-language";

// Jednostavni rječnici za prevođenje često korištenih fraza i proizvodnog sadržaja
// Ovo je alternativa API-ju za strojno prevođenje, koja je jednostavnija i brža
const translationDictionaries: Record<string, Record<Language, string>> = {
  // Proizvodi
  "Kerzenbox groß": {
    de: "Kerzenbox groß",
    hr: "Velika kutija za svijeće",
    en: "Large Candle Box",
    it: "Grande scatola di candele",
    sl: "Velika škatlica za sveče"
  },
  "Kerzenbox mittel": {
    de: "Kerzenbox mittel",
    hr: "Srednja kutija za svijeće",
    en: "Medium Candle Box",
    it: "Media scatola di candele",
    sl: "Srednja škatlica za sveče"
  },
  "Kerzenbox klein": {
    de: "Kerzenbox klein",
    hr: "Mala kutija za svijeće",
    en: "Small Candle Box",
    it: "Piccola scatola di candele",
    sl: "Majhna škatlica za sveče"
  },
  "Dosenkerze Weiß": {
    de: "Dosenkerze Weiß",
    hr: "Svijeća u konzervi bijela",
    en: "White Can Candle",
    it: "Candela in lattina bianca",
    sl: "Sveča v pločevinki bela"
  },
  "Dosenkerze Schwarz": {
    de: "Dosenkerze Schwarz",
    hr: "Svijeća u konzervi crna",
    en: "Black Can Candle",
    it: "Candela in lattina nera",
    sl: "Sveča v pločevinki črna"
  },
  
  // Kategorije
  "Kerzenbox": {
    de: "Kerzenbox",
    hr: "Kutija za svijeće",
    en: "Candle Box",
    it: "Scatola di candele",
    sl: "Škatlica za sveče"
  },
  "Dosenkerzen": {
    de: "Dosenkerzen",
    hr: "Svijeće u konzervama",
    en: "Can Candles",
    it: "Candele in lattina",
    sl: "Sveče v pločevinki"
  },
  "Teelicht": {
    de: "Teelicht",
    hr: "Čajne svijeće",
    en: "Tea Light",
    it: "Candela tealight",
    sl: "Čajna svečka"
  },
  
  // Boje
  "Weiß": {
    de: "Weiß",
    hr: "Bijela",
    en: "White",
    it: "Bianco",
    sl: "Bela"
  },
  "Schwarz": {
    de: "Schwarz",
    hr: "Crna",
    en: "Black",
    it: "Nero",
    sl: "Črna"
  },
  "Rot": {
    de: "Rot",
    hr: "Crvena",
    en: "Red",
    it: "Rosso",
    sl: "Rdeča"
  },
  "Blau": {
    de: "Blau",
    hr: "Plava",
    en: "Blue",
    it: "Blu",
    sl: "Modra"
  },
  "Grün": {
    de: "Grün",
    hr: "Zelena",
    en: "Green",
    it: "Verde",
    sl: "Zelena"
  },
  "Gold": {
    de: "Gold",
    hr: "Zlatna",
    en: "Gold",
    it: "Oro",
    sl: "Zlata"
  },
  
  // Mirisi
  "Vanille": {
    de: "Vanille",
    hr: "Vanilija",
    en: "Vanilla",
    it: "Vaniglia",
    sl: "Vanilija"
  },
  "Apfel": {
    de: "Apfel",
    hr: "Jabuka",
    en: "Apple",
    it: "Mela",
    sl: "Jabolko"
  },
  "Zimt": {
    de: "Zimt",
    hr: "Cimet",
    en: "Cinnamon",
    it: "Cannella",
    sl: "Cimet"
  },
  "Lavendel": {
    de: "Lavendel",
    hr: "Lavanda",
    en: "Lavender",
    it: "Lavanda",
    sl: "Sivka"
  },
  
  // Kategorije proizvoda/svijeća
  "Mirisna svijeća": {
    de: "Duftkerze",
    hr: "Mirisna svijeća",
    en: "Scented Candle",
    it: "Candela profumata",
    sl: "Dišeča sveča"
  },
  "Dekorativna svijeća": {
    de: "Dekorative Kerze",
    hr: "Dekorativna svijeća",
    en: "Decorative Candle",
    it: "Candela decorativa",
    sl: "Dekorativna sveča"
  },
  "Personalizirana svijeća": {
    de: "Personalisierte Kerze",
    hr: "Personalizirana svijeća",
    en: "Personalized Candle",
    it: "Candela personalizzata",
    sl: "Personalizirana sveča"
  },
  "Svijeća": {
    de: "Kerze",
    hr: "Svijeća",
    en: "Candle",
    it: "Candela",
    sl: "Sveča"
  },
  
  // Tekst za gumbe i oznake
  "Odaberi opcije": {
    de: "Optionen wählen",
    hr: "Odaberi opcije",
    en: "Choose options",
    it: "Scegli opzioni",
    sl: "Izberi možnosti"
  },
  "ZADNJI KOMADI": {
    de: "LETZTE STÜCKE",
    hr: "ZADNJI KOMADI",
    en: "LAST PIECES",
    it: "ULTIMI PEZZI",
    sl: "ZADNJI KOSI"
  },
  
  // Status narudžbe
  "In Bearbeitung": {
    de: "In Bearbeitung",
    hr: "U obradi",
    en: "Processing",
    it: "In elaborazione",
    sl: "V obdelavi"
  },
  "Versandt": {
    de: "Versandt",
    hr: "Poslano",
    en: "Shipped",
    it: "Spedito",
    sl: "Poslano"
  },
  "Geliefert": {
    de: "Geliefert",
    hr: "Dostavljeno",
    en: "Delivered",
    it: "Consegnato",
    sl: "Dostavljeno"
  },
  "Storniert": {
    de: "Storniert",
    hr: "Otkazano",
    en: "Cancelled",
    it: "Annullato",
    sl: "Preklicano"
  }
};

/**
 * Prevodi tekst iz izvornog u ciljni jezik
 * @param text Tekst za prevođenje
 * @param targetLanguage Ciljni jezik
 * @param sourceLanguage Izvorni jezik (opcionalno)
 * @returns Prevedeni tekst ili originalni tekst ako prijevod nije dostupan
 */
export function translateText(text: string, targetLanguage: Language, sourceLanguage?: Language): string {
  // Ako je izvorni i ciljni jezik isti, vrati originalni tekst
  if (sourceLanguage && sourceLanguage === targetLanguage) {
    return text;
  }
  
  // Pokušaj prevesti iz rječnika
  if (translationDictionaries[text] && translationDictionaries[text][targetLanguage]) {
    return translationDictionaries[text][targetLanguage];
  }
  
  // Vrati originalni tekst ako prijevod nije pronađen
  return text;
}

/**
 * Prevodi objekt s tekstualnim vrijednostima iz izvornog u ciljni jezik
 * @param obj Objekt za prevođenje
 * @param targetLanguage Ciljni jezik
 * @param sourceLanguage Izvorni jezik (opcionalno)
 * @returns Novi objekt s prevedenim vrijednostima
 */
export function translateObject<T extends Record<string, any>>(
  obj: T, 
  targetLanguage: Language, 
  sourceLanguage?: Language
): T {
  const result = { ...obj } as T;
  
  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      if (typeof result[key] === 'string') {
        // Koristeći as any sprječavamo type error
        (result as any)[key] = translateText(result[key], targetLanguage, sourceLanguage);
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        (result as any)[key] = translateObject(result[key], targetLanguage, sourceLanguage);
      }
    }
  }
  
  return result;
}

/**
 * Prevodi niz objekata iz izvornog u ciljni jezik
 * @param array Niz za prevođenje
 * @param targetLanguage Ciljni jezik
 * @param sourceLanguage Izvorni jezik (opcionalno)
 * @returns Novi niz s prevedenim objektima
 */
export function translateArray<T extends Record<string, any>>(
  array: T[], 
  targetLanguage: Language, 
  sourceLanguage?: Language
): T[] {
  return array.map(item => translateObject(item, targetLanguage, sourceLanguage));
}