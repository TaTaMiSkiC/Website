import { Check, ChevronDown, Globe } from "lucide-react";
import { useLanguage, Language, languageNames } from "@/hooks/use-language";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  // Zastave za svaki jezik (emoji zastave)
  const flags: Record<Language, string> = {
    de: "🇩🇪",
    hr: "🇭🇷",
    en: "🇬🇧",
    it: "🇮🇹",
    sl: "🇸🇮"
  };

  // Redoslijed jezika prema zahtjevu
  const languageOrder: Language[] = ['de', 'hr', 'en', 'it', 'sl'];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="flex items-center gap-1 rounded-md hover:bg-secondary hover:text-secondary-foreground transition-colors py-2 px-3 w-full md:w-auto">
        <Globe className="h-4 w-4 mr-1" />
        <span className="text-sm md:text-base">{languageNames[language]}</span>
        <span className="ml-1">{flags[language]}</span>
        <ChevronDown className="h-3 w-3 opacity-60 ml-auto md:ml-1" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[150px]">
        {languageOrder.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => {
              setLanguage(lang);
              setIsOpen(false);
            }}
            className="flex items-center justify-between py-2 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="mr-1">{flags[lang]}</span>
              <span>{languageNames[lang]}</span>
            </span>
            {language === lang && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}