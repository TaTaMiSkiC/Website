// ThemeScript.tsx
// Ova komponenta dodaje script za inicijalizaciju teme prije renderiranja React aplikacije
// Ovo sprječava treperenje pri prvom učitavanju (FOUC - Flash of Unstyled Content)

export function ThemeScript() {
  const themeScript = `
    (function() {
      // Dohvaćanje teme iz lokalnog spremnika
      const storedTheme = localStorage.getItem('theme');
      const theme = storedTheme ? storedTheme : 'system';
      
      // Postavljanje teme na HTML element
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    })();
  `;

  // dangerouslySetInnerHTML koristi se samo za skripte koje generiramo i kontroliramo!
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}