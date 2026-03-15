const AUTH_RETURN_KEY = "auth:return";

export interface AuthReturnState {
  path: string;
  targetId?: string;
}

export function saveAuthReturnState(state: AuthReturnState) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(AUTH_RETURN_KEY, JSON.stringify(state));
}

export function readAuthReturnState(): AuthReturnState | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(AUTH_RETURN_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthReturnState;
    if (!parsed?.path) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearAuthReturnState() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(AUTH_RETURN_KEY);
}
