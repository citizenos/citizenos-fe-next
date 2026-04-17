import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from '../state/user.store';

export const authGuard: CanActivateFn = (route, state) => {
  const userStore = inject(UserStore);
  const router = inject(Router);

  if (userStore.isAuthenticated()) {
    return true;
  }

  // Preserve the lang param if it exists in the tree
  const lang = route.parent?.paramMap.get('lang') || 'en';
  
  return router.createUrlTree([`/${lang}/401`], {
    queryParams: { returnUrl: state.url },
  });
};
