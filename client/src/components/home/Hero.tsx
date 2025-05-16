import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import candleBackground from "@/assets/candle-background.jpg";
import { useLanguage } from "@/hooks/use-language";

export default function Hero() {
  const { t, language } = useLanguage();
  
  // Fetch hero settings from API
  const { data: heroSettings } = useQuery({
    queryKey: ["/api/settings/hero"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/settings/hero");
        if (!response.ok) {
          throw new Error("Failed to fetch hero settings");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching hero settings:", error);
        return null;
      }
    }
  });
  
  // Get title and subtitle text for current language, falling back to translations if not found
  const getTitleText = () => {
    if (heroSettings?.titleText && heroSettings.titleText[language]) {
      return heroSettings.titleText[language];
    }
    return t('home.heroTitle');
  };
  
  const getSubtitleText = () => {
    if (heroSettings?.subtitleText && heroSettings.subtitleText[language]) {
      return heroSettings.subtitleText[language];
    }
    return t('home.heroSubtitle');
  };
  
  // Use inline styles for custom font properties
  const getTitleClasses = () => {
    const classes = ["heading", "mb-4"];
    
    // Use default tailwind classes if settings not available
    if (!heroSettings) {
      classes.push("text-4xl md:text-5xl lg:text-6xl font-bold");
    }
    
    return classes.join(" ");
  };
  
  const getSubtitleClasses = () => {
    const classes = ["mb-8"];
    
    // Use default tailwind classes if settings not available
    if (!heroSettings) {
      classes.push("text-lg md:text-xl font-normal");
    }
    
    return classes.join(" ");
  };
  
  // Get CSS properties for title styling
  const getTitleStyle = () => {
    if (!heroSettings) return { color: "white" };
    
    return {
      color: heroSettings.titleColor || "white",
      fontSize: getFontSizeValue(heroSettings.titleFontSize),
      fontWeight: getFontWeightValue(heroSettings.titleFontWeight)
    };
  };
  
  // Get CSS properties for subtitle styling
  const getSubtitleStyle = () => {
    if (!heroSettings) return { color: "white", opacity: 0.9 };
    
    return {
      color: heroSettings.subtitleColor || "white",
      fontSize: getFontSizeValue(heroSettings.subtitleFontSize),
      fontWeight: getFontWeightValue(heroSettings.subtitleFontWeight)
    };
  };
  
  // Helper function to convert tailwind class to CSS size
  function getFontSizeValue(size: string | undefined) {
    if (!size) return undefined;
    
    // Handle responsive sizes by taking the first value
    const firstSize = size.split(" ")[0];
    const sizeMap: Record<string, string> = {
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "3.75rem",
    };
    
    // Extract the size from something like "4xl" from "4xl md:text-5xl lg:text-6xl"
    const match = firstSize.match(/(\d?xl|\w+)$/);
    return match && sizeMap[match[0]] ? sizeMap[match[0]] : undefined;
  }
  
  // Helper function to convert tailwind weight to CSS weight
  function getFontWeightValue(weight: string | undefined) {
    if (!weight) return undefined;
    
    const weightMap: Record<string, string> = {
      thin: "100",
      extralight: "200",
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
      extrabold: "800",
      black: "900",
    };
    
    return weightMap[weight] || undefined;
  };
  
  return (
    <section className="relative h-[70vh] md:h-[80vh] bg-cover bg-center" style={{ backgroundImage: `url(${candleBackground})` }}>
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="container mx-auto px-4 h-full flex items-center relative z-10">
        <div className="max-w-xl">
          <h1 
            className={getTitleClasses()}
            style={getTitleStyle()}
          >
            {getTitleText()}
          </h1>
          <p 
            className={getSubtitleClasses()}
            style={getSubtitleStyle()}
          >
            {getSubtitleText()}
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Link href="/products">
              <Button 
                size="lg" 
                className="w-full sm:w-auto"
              >
                {t('home.exploreCollection')}
              </Button>
            </Link>
            <Link href="/about">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary w-full sm:w-auto"
              >
                {t('home.aboutUs')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
