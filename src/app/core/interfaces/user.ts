export interface User {
  id: string;
  name: string;
  email: string | null;
  language: string;
  imageUrl?: string;
  company?: string;
  preferences?: {
    showInSearch?: boolean;
    notifications?: any;
  };
  loggedIn?: boolean;
}

export interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
