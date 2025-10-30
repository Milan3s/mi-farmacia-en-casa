import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    login(userData) {
      this.user = userData; // 👈 Guarda todo el objeto user (id, name, email)
      localStorage.setItem("user", JSON.stringify(this.user));
    },
    logout() {
      this.user = null;
      localStorage.removeItem("user");
    },
    loadUser() {
      const stored = localStorage.getItem("user");
      if (stored) {
        this.user = JSON.parse(stored);
      }
    },
  },
});
