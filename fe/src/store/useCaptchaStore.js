import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useCaptchaStore = create((set, get) => ({
  captcha: { id: "", svg: "" },
  isLoading: false,

  fetchCaptcha: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get('/auth/captcha');
      set({ captcha: { id: response.data.captchaId, svg: response.data.captchaSvg } });
    } catch (error) {
      console.error("Error fetching CAPTCHA:", error);
      toast.error("Failed to load CAPTCHA");
    } finally {
      set({ isLoading: false });
    }
  },

  resetCaptcha: () => {
    set({ captcha: { id: "", svg: "" } });
  }
}));