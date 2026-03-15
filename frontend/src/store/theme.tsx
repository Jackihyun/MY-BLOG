import { atom } from "recoil";

export type ThemeState = {
  value: "light" | "dark";
};

export const initialThemeState: ThemeState = {
  value: "light",
};

export const themeState = atom({
  key: "themeState",
  default: initialThemeState,
});
