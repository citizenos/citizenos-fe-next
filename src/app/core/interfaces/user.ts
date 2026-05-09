export interface User {
  id: string;
  name: string;
  email: string | null;
  language: string;
  imageUrl?: string;
  company?: string;
  preferences?: {
    showInSearch?: boolean;
    notifications?: Record<string, boolean | string>;
  };
  loggedIn?: boolean;
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface SearchResultUser {
  id?: string;
  userId?: string;
  name: string;
  email?: string;
  imageUrl?: string;
}
