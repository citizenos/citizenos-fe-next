import { signalStore, withState, withMethods, patchState, withComputed, withHooks } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { User, UserState } from '../interfaces/user';
import { UserService } from '../services/user.service';
import { firstValueFrom } from 'rxjs';

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    displayName: computed(() => store.user()?.name ?? 'Guest'),
  })),
  withMethods((store) => {
    const userService = inject(UserService);

    return {
      async checkStatus() {
        patchState(store, { isLoading: true });
        try {
          const user = await firstValueFrom(userService.status());
          patchState(store, { user, isAuthenticated: !!user, isLoading: false });
        } catch (error) {
          patchState(store, { user: null, isAuthenticated: false, isLoading: false });
        }
      },

      async login(email: string, password: string) {
        patchState(store, { isLoading: true });
        try {
          await firstValueFrom(userService.login(email, password));
          await this.checkStatus();
        } catch (error) {
          patchState(store, { isLoading: false });
          throw error;
        }
      },

      async logout() {
        patchState(store, { isLoading: true });
        try {
          await firstValueFrom(userService.logout());
          patchState(store, { user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          patchState(store, { isLoading: false });
        }
      },

      async signup(data: any) {
        patchState(store, { isLoading: true });
        try {
          await firstValueFrom(userService.signUp(data));
          // Usually we login or wait for status
          await this.checkStatus();
        } catch (error) {
          patchState(store, { isLoading: false });
          throw error;
        }
      }
    };
  }),
  withHooks({
    onInit(store) {
      store.checkStatus();
    }
  })
);
