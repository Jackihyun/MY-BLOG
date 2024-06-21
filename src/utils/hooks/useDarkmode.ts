import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { themeState } from "@/store/theme";

type Theme = "light" | "dark";

export const useDarkMode = (): [Theme, () => void] => {
  const [theme, setTheme] = useRecoilState(themeState);

  useEffect(() => {
    const localTheme = window.localStorage.getItem("theme") as Theme | null;

    if (localTheme) {
      setTheme({ value: localTheme });
      document.documentElement.classList.add(localTheme);
    } else {
      setTheme({ value: "light" });
      document.documentElement.classList.add("light");
    }
  }, [setTheme]);

  const toggleTheme = () => {
    const newTheme = theme.value === "light" ? "dark" : "light";
    window.localStorage.setItem("theme", newTheme);
    document.documentElement.classList.remove(theme.value);
    document.documentElement.classList.add(newTheme);
    setTheme({ value: newTheme });
  };

  return [theme.value, toggleTheme];
};
