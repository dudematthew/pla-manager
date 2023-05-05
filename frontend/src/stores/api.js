import { defineStore } from "pinia";
import axios from 'axios';

export const useAPIStore = defineStore({
  id: "api",
  state: () => ({}),
  getters: {},
  actions: {
    async sayHello() {
        const response = await axios.get("http://localhost:3000/api/hello");
        return response.data;
    }
  },
});
