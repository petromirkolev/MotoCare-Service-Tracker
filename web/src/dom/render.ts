import { dom } from './selectors';
import { req } from '../utils/dom-helper';
import { showScreen, showAuthForm } from '../ui/show-screen';
import {
  getState,
  initState,
  loadState,
  refreshBikes,
} from '../state/state-store';
import { getCurrentUser } from '../state/auth-store';
import { createBikeCard } from '../ui/create-bike-card';
import { bikeStore } from '../state/bike-store';
import { fetchBikes } from '../api/bikes';

export const render = {
  initialScreen(): void {
    showScreen('auth');
    showAuthForm('login');
    this.errorMessage('', 'login');
    this.errorMessage('', 'register');
  },

  loginScreen(): void {
    showScreen('auth');
    showAuthForm('login');
    this.errorMessage('', 'login');
  },

  registerScreen(): void {
    showScreen('auth');
    showAuthForm('register');
    this.errorMessage('', 'register');
  },

  async bikeScreen(): Promise<any> {
    showScreen('bikes');

    const grid = req(dom.bikeGrid, 'bikeGrid');

    grid.innerHTML = '';

    const state = getState();

    const bikes = state.bikes;
    const currentUser = getCurrentUser();

    req(dom.currentUserEmail, 'currentUserEmail').textContent =
      `Hello, ${currentUser?.email}!`;
    req(dom.bikesCount, 'bikesCount').textContent =
      bikes.length > 1 || bikes.length === 0
        ? `${bikes.length} motorcycles`
        : `${bikes.length} motorcycle`;

    bikes.forEach((bike: any) => grid.appendChild(createBikeCard(bike)));

    bikes.length > 0
      ? req(dom.emptyBikeGrid, 'emptyBikeGrid').classList.add('is-hidden')
      : req(dom.emptyBikeGrid, 'emptyBikeGrid').classList.remove('is-hidden');
  },

  errorMessage(
    message: string = '',
    target: 'login' | 'register' | 'save-bike' | 'logout' = 'login',
  ) {
    switch (target) {
      case 'login':
        if (dom.loginHint) dom.loginHint.textContent = message;
        break;
      case 'register':
        if (dom.registerHint) dom.registerHint.textContent = message;
        break;
      case 'save-bike':
        if (dom.addBikeHint) dom.addBikeHint.textContent = message;
        break;
      default:
        break;
    }
  },
};
