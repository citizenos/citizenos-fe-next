import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { computed } from '@angular/core';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => store.user() !== null),
    displayName: computed(() => store.user()?.name ?? 'Guest'),
  })),
  withMethods((store) => ({
    logout() {
      patchState(store, { user: null, error: null });
    },
    // Mock login for now
    async login(email: string) {
      patchState(store, { loading: true, error: null });
      try {
        // Mock API call
        setTimeout(() => {
          patchState(store, { 
            user: { id: '1', name: 'Test User', email }, 
            loading: false 
          });
        }, 500);
      } catch (err: any) {
        patchState(store, { error: err.message, loading: false });
      }
    }
  }))
);
