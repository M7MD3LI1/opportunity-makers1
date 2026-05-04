import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "default" | "professional" | "bw";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  customColor: string;
  setCustomColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>((localStorage.getItem("theme") as Theme) || "default");
  const [customColor, setCustomColor] = useState(localStorage.getItem("primaryColor") || "#701b73");

  useEffect(() => {
    const root = document.documentElement;
    
    // Always add dashboard-theme
    root.classList.add("dashboard-theme");
    
    // Reset classes
    root.classList.remove("theme-bw", "theme-professional");
    
    if (theme === "bw") {
      root.classList.add("theme-bw");
    } else if (theme === "professional") {
      root.classList.add("theme-professional");
    }
    
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === "default") {
      root.style.setProperty("--dash-primary", customColor);
      root.style.setProperty("--dash-primary-light", customColor + "cc");
      root.style.setProperty("--dash-primary-lighter", customColor + "99");
      localStorage.setItem("primaryColor", customColor);
    } else {
      // These will be handled by the CSS classes .theme-bw or .theme-professional
      root.style.removeProperty("--dash-primary");
      root.style.removeProperty("--dash-primary-light");
      root.style.removeProperty("--dash-primary-lighter");
    }
  }, [customColor, theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, customColor, setCustomColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
