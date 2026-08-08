// src/hooks/useDarkMode.js
import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Carrega do localStorage, senão padrão é LIGHT MODE
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return false; // Light mode é o padrão
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  function toggleDarkMode() {
    setIsDark(!isDark);
  }

  return { isDark, toggleDarkMode };
}