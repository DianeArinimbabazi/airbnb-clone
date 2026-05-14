 export interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  email: string | null;
  login: (email: string, password: string) => void;
  logout: () => void;
} 
