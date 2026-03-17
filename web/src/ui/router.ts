import { dom } from '../dom/selectors';
import { render } from '../dom/render';
import { readRegForm, readLoginForm } from '../state/auth-store';
import { registerUser, loginUser } from '../api/auth';
import { setCurrentUser } from '../state/auth-store';
import { readBikeForm } from '../state/bike-store';
import { createBikeApi } from '../api/bikes';
import { refreshBikes } from '../state/state-store';

type Action =
  | 'show-login-form'
  | 'show-register-form'
  | 'login'
  | 'register'
  | 'logout'
  | 'save-bike';

function bindEvents(): void {
  document.addEventListener('click', async (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    const el = target.closest<HTMLElement>('[data-action]');
    if (!el) return;

    const action = el.dataset.action as Action;
    if (!action) return;

    switch (action) {
      case 'show-login-form': {
        const forms = document.querySelectorAll('form');
        forms.forEach((form) => (form as HTMLFormElement).reset());
        render.loginScreen();
        break;
      }

      case 'show-register-form':
        render.registerScreen();
        break;

      case 'login':
        try {
          const loginForm = dom.loginForm as HTMLFormElement;
          const input = readLoginForm(loginForm);
          const response = await loginUser(input.email, input.password);

          setCurrentUser(response.user);
          loginForm.reset();

          render.errorMessage('Login success, opening garage...', 'login');

          setTimeout(() => {
            refreshBikes();
            render.bikeScreen();
          }, 1000);
        } catch (error) {
          error instanceof Error
            ? render.errorMessage(error.message, 'login')
            : render.errorMessage('Something went wrong', 'login');
        }
        break;

      case 'register':
        try {
          const regForm = dom.registerForm as HTMLFormElement;
          const input = readRegForm(regForm);

          await registerUser(input.email.toLowerCase(), input.password);

          regForm.reset();

          render.errorMessage('Registration successful!', 'register');

          setTimeout(() => {
            render.loginScreen();
          }, 1500);
        } catch (error) {
          error instanceof Error
            ? render.errorMessage(error.message, 'register')
            : render.errorMessage('Something went wrong', 'register');
        }
        break;

      case 'logout':
        setCurrentUser(null);
        render.initialScreen();
        break;

      case 'save-bike':
        const addBikeForm = (dom.addBikeForm as HTMLFormElement) || null;
        if (!addBikeForm) throw new Error('Missing add bike form');

        try {
          const input = readBikeForm(addBikeForm);

          await createBikeApi({
            make: input.make,
            model: input.model,
            year: Number(input.year),
          });

          await refreshBikes();

          addBikeForm.reset();

          render.bikeScreen();
        } catch (error) {
          error instanceof Error
            ? render.errorMessage(error.message, action)
            : render.errorMessage('Something went wrong', action);
        }
        break;
    }
  });
}

export { bindEvents };
