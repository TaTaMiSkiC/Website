import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Inicijalizacija jezika dokumenta
if (typeof window !== "undefined") {
  const savedLang = localStorage.getItem("language");
  if (savedLang && ["hr", "en", "de"].includes(savedLang)) {
    document.documentElement.lang = savedLang;
  } else {
    document.documentElement.lang = "hr";
  }
}

createRoot(document.getElementById("root")!).render(
  <App />
);
