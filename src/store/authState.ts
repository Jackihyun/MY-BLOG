import { atom } from "recoil";

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  expiresAt: number | null;
  isHydrated: boolean;
}

const initialAuthState: AuthState = {
  token: null,
  isAuthenticated: false,
  expiresAt: null,
  isHydrated: false,
};

export const authState = atom<AuthState>({
  key: "authState",
  default: initialAuthState,
});
