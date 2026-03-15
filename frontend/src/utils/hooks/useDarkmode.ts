import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { themeState } from "@/store/theme";

type Theme = "light" | "dark";

export const useDarkMode = (): [Theme, () => void] => {
  const [theme, setTheme] = useRecoilState(themeState);

  useEffect(() => {
    const localTheme = window.localStorage.getItem("theme") as Theme | null;
    const initialTheme = localTheme || "light";
    
    setTheme({ value: initialTheme });
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, [setTheme]);

  const toggleTheme = () => {
    const newTheme = theme.value === "light" ? "dark" : "light";
    window.localStorage.setItem("theme", newTheme);
    
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
    
    setTheme({ value: newTheme });
  };

  return [theme.value, toggleTheme];
};
