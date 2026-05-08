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
      },

      async sendPasswordReset(email: string) {
        patchState(store, { isLoading: true });
        try {
          await firstValueFrom(userService.sendPasswordReset(email));
          patchState(store, { isLoading: false });
        } catch (error) {
          patchState(store, { isLoading: false });
          throw error;
        }
      },

      async resetPassword(password: string, token: string) {
        patchState(store, { isLoading: true });
        try {
          await firstValueFrom(userService.resetPassword(password, token));
          patchState(store, { isLoading: false });
        } catch (error) {
          patchState(store, { isLoading: false });
          throw error;
        }
      },

      async loginMobiilIdInit(pid: string, phoneNumber: string) {
        patchState(store, { isLoading: true });
        try {
          const res = await firstValueFrom(userService.loginMobiilIdInit(pid, phoneNumber));
          patchState(store, { isLoading: false });
          return res.data;
        } catch (error) {
          patchState(store, { isLoading: false });
          throw error;
        }
      },

      async loginMobiilIdStatus(token: string) {
        return firstValueFrom(userService.loginMobiilIdStatus(token));
      },

      async loginSmartIdInit(pid: string, countryCode = 'EE') {
        patchState(store, { isLoading: true });
        try {
          const res = await firstValueFrom(userService.loginSmartIdInit(pid, countryCode));
          patchState(store, { isLoading: false });
          return res.data;
        } catch (error) {
          patchState(store, { isLoading: false });
          throw error;
        }
      },

      async loginSmartIdStatus(token: string) {
        return firstValueFrom(userService.loginSmartIdStatus(token));
      },

      async loginIdCard(data: any) {
        patchState(store, { isLoading: true });
        try {
          await firstValueFrom(userService.loginIdCard(data));
          await this.checkStatus();
        } catch (error) {
          patchState(store, { isLoading: false });
          throw error;
        }
      },

      async updateProfile(params: any) {
        patchState(store, { isLoading: true });
        try {
          await firstValueFrom(userService.update(params));
          await this.checkStatus();
        } catch (error) {
          patchState(store, { isLoading: false });
          throw error;
        }
      },

      async deleteAccount() {
        patchState(store, { isLoading: true });
        try {
          await firstValueFrom(userService.deleteUser());
          patchState(store, { user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          patchState(store, { isLoading: false });
          throw error;
        }
      }
    };
  })
);
