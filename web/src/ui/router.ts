import { dom } from '../dom/selectors';
import { render } from '../dom/render';
import {
  readRegForm,
  readLoginForm,
  setCurrentUser,
} from '../state/auth-store';
import { registerUser, loginUser } from '../api/auth';
import { readBikeForm } from '../state/bike-store';
import { createBikeApi, deleteBikeApi } from '../api/bikes';
import { refreshBikes, refreshJobs } from '../state/state-store';
import { readJobForm } from '../state/job-store';
import { createJobApi, updateJobStatusApi } from '../api/jobs';
import { markJobs, setActiveJobFilter } from '../utils/dom-helper';

type Action =
  | 'show-login-form'
  | 'show-register-form'
  | 'login'
  | 'register'
  | 'logout'
  | 'save-bike'
  | 'delete-bike'
  | 'go-jobs'
  | 'go-bikes'
  | 'create-job'
  | 'approve-job'
  | 'start-job'
  | 'complete-job'
  | 'cancel-job'
  | 'filter-jobs-all'
  | 'filter-jobs-requested'
  | 'filter-jobs-approved'
  | 'filter-jobs-in-progress'
  | 'filter-jobs-done'
  | 'filter-jobs-cancelled';

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
      case 'show-register-form': {
        render.registerScreen();
        break;
      }
      case 'login': {
        try {
          const loginForm = dom.loginForm as HTMLFormElement;
          const input = readLoginForm(loginForm);
          const response = await loginUser(input.email, input.password);

          setCurrentUser(response.user);
          loginForm.reset();

          render.errorMessage('Login success, opening garage...', 'login');

          setTimeout(async () => {
            await refreshBikes();
            await render.bikeScreen();
          }, 1000);
        } catch (error) {
          error instanceof Error
            ? render.errorMessage(error.message, 'login')
            : render.errorMessage('Something went wrong', 'login');
        }
        break;
      }
      case 'register': {
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
      }
      case 'logout': {
        setCurrentUser(null);
        render.initialScreen();
        break;
      }
      case 'save-bike': {
        const addBikeForm = dom.addBikeForm as HTMLFormElement | null;
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
          render.errorMessage('', 'save-bike');

          await render.bikeScreen();
        } catch (error) {
          error instanceof Error
            ? render.errorMessage(error.message, 'save-bike')
            : render.errorMessage('Something went wrong', 'save-bike');
        }
        break;
      }
      case 'delete-bike': {
        try {
          const bikeCard = target.closest<HTMLElement>('[data-bike-id]');
          const id = bikeCard?.dataset.bikeId;

          if (!id) {
            throw new Error('Missing bike id');
          }

          await deleteBikeApi(id);
          await refreshBikes();
          await refreshJobs();
          await render.bikeScreen();
        } catch (error) {
          console.error(error);
        }
        break;
      }
      case 'go-jobs': {
        await render.jobScreen();
        break;
      }
      case 'go-bikes': {
        await render.bikeScreen();
        break;
      }
      case 'create-job': {
        const addJobForm = dom.addJobForm as HTMLFormElement | null;
        if (!addJobForm) throw new Error('Missing add job form');

        try {
          const input = readJobForm(addJobForm);

          await createJobApi({
            bike_id: input.bike_id,
            service_type: input.service_type,
            odometer: input.odometer,
            note: input.note,
          });

          addJobForm.reset();

          await refreshJobs();

          render.errorMessage('', 'create-job');
          await render.jobScreen();
        } catch (error) {
          error instanceof Error
            ? render.errorMessage(error.message, 'create-job')
            : render.errorMessage('Something went wrong', 'create-job');
        }
        break;
      }
      case 'approve-job': {
        try {
          const jobCard = target.closest<HTMLElement>('[data-job-id]');
          const id = jobCard?.dataset.jobId;

          if (!id) {
            throw new Error('Missing job id');
          }

          await updateJobStatusApi(id, 'approved');
          await refreshJobs();
          await render.jobScreen();
        } catch (error) {
          console.error(error);
        }
        break;
      }
      case 'start-job': {
        try {
          const jobCard = target.closest<HTMLElement>('[data-job-id]');
          const id = jobCard?.dataset.jobId;

          if (!id) {
            throw new Error('Missing job id');
          }

          await updateJobStatusApi(id, 'in_progress');
          await refreshJobs();
          await render.jobScreen();
        } catch (error) {
          console.error(error);
        }
        break;
      }
      case 'complete-job': {
        try {
          const jobCard = target.closest<HTMLElement>('[data-job-id]');
          const id = jobCard?.dataset.jobId;

          if (!id) {
            throw new Error('Missing job id');
          }

          await updateJobStatusApi(id, 'done');
          await refreshJobs();
          await render.jobScreen();
        } catch (error) {
          console.error(error);
        }
        break;
      }
      case 'cancel-job': {
        try {
          const jobCard = target.closest<HTMLElement>('[data-job-id]');
          const id = jobCard?.dataset.jobId;

          if (!id) {
            throw new Error('Missing job id');
          }

          await updateJobStatusApi(id, 'cancelled');
          await refreshJobs();
          await render.jobScreen();
        } catch (error) {
          console.error(error);
        }
        break;
      }
      case 'filter-jobs-all': {
        setActiveJobFilter(el);
        const jobCards = document.querySelectorAll<HTMLElement>('.job-card');
        jobCards.forEach((card) => card.classList.remove('is-hidden'));
        break;
      }
      case 'filter-jobs-requested': {
        setActiveJobFilter(el);
        markJobs('requested');
        break;
      }
      case 'filter-jobs-approved': {
        setActiveJobFilter(el);
        markJobs('approved');
        break;
      }
      case 'filter-jobs-in-progress': {
        setActiveJobFilter(el);
        markJobs('in-progress');
        break;
      }
      case 'filter-jobs-done': {
        setActiveJobFilter(el);
        markJobs('done');
        break;
      }
      case 'filter-jobs-cancelled': {
        setActiveJobFilter(el);
        markJobs('cancelled');
        break;
      }
    }
  });
}

export { bindEvents };
