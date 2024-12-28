import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("m4s-theme") || "dark",
  setTheme: (theme) => {
    localStorage.setItem("m4s-theme", theme);
    set({ theme });
  },
}));
