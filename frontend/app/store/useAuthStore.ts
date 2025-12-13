import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logoutUser } from "@/services/auth";


interface User {
  email: string;
  role: "admin" | "ambulance";
  ambulanceId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
}


export const useAuthStore = create<AuthState>()(

  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: (user, token) =>
        set({
          user,
          token: token || null,
          isAuthenticated: true,
        }),

      logout: async () => {
        try {
          await logoutUser(); 
  
        } catch (err) {
          console.error("Logout API failed", err);
        } finally {
     
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
