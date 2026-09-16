import { defineStore } from "pinia";

export const useModalStore = defineStore("modal", {
  state: () => ({
    isRegisterOpen: false,
  }),
  actions: {
    openRegister() {
      this.isRegisterOpen = true;
    },
    closeRegister() {
      this.isRegisterOpen = false;
    },
  },
});