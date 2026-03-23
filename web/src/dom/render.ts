import { dom } from './selectors';
import { req } from '../utils/dom-helper';
import { showScreen, showAuthForm } from '../ui/show-screen';
import { getState, refreshBikes, refreshJobs } from '../state/state-store';
import { getCurrentUser } from '../state/auth-store';
import { createBikeCard } from '../ui/create-bike-card';
import { createJobCard } from '../ui/create-job-card';

export const render = {
  initialScreen(): void {
    showScreen('auth');
    showAuthForm('login');
    this.errorMessage('', 'login');
    this.errorMessage('', 'register');
    dom.topBar?.classList.add('is-hidden');
  },

  loginScreen(): void {
    showScreen('auth');
    showAuthForm('login');
    this.errorMessage('', 'login');
    dom.loginButton?.classList.add('active');
    dom.registerButton?.classList.remove('active');
  },

  registerScreen(): void {
    showScreen('auth');
    showAuthForm('register');
    this.errorMessage('', 'register');
    dom.registerButton?.classList.add('active');
    dom.loginButton?.classList.remove('active');
  },

  async bikeScreen(): Promise<void> {
    showScreen('bikes');
    await refreshBikes();
    await refreshJobs();

    dom.navBikes?.classList.add('active');
    dom.navJobs?.classList.remove('active');

    const grid = req(dom.bikeGrid, 'bikeGrid');

    grid.innerHTML = '';

    const { bikes, jobs } = getState();
    const currentUser = getCurrentUser();

    if (dom.currentUserEmail) {
      dom.currentUserEmail.textContent = currentUser
        ? `Hello, ${currentUser.email}!`
        : '';
    }

    if (dom.bikesCount) {
      dom.bikesCount.textContent =
        bikes.length === 1 ? '1 motorcycle' : `${bikes.length} motorcycles`;
    }

    bikes.forEach((bike) => {
      const hasOpenJobs = jobs.some((job) => {
        return (
          String(job.bike_id) === String(bike.id) &&
          job.status !== 'done' &&
          job.status !== 'cancelled'
        );
      });

      const isReady = !hasOpenJobs;
      grid.appendChild(createBikeCard(bike, isReady));
    });

    if (dom.emptyBikeGrid) {
      if (bikes.length > 0) {
        dom.emptyBikeGrid.classList.add('is-hidden');
      } else {
        dom.emptyBikeGrid.classList.remove('is-hidden');
      }
    }
  },

  async jobScreen(): Promise<void> {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      showScreen('auth');
      return;
    }

    showScreen('jobs');

    dom.navJobs?.classList.add('active');
    dom.navBikes?.classList.remove('active');

    if (dom.currentUserEmail) {
      dom.currentUserEmail.textContent = `Hello, ${currentUser.email}!`;
    }

    await refreshBikes();
    await refreshJobs();

    this.populateJobBikeSelect();
    this.renderJobsList();
  },

  populateJobBikeSelect(): void {
    if (!dom.jobBikeSelect) return;

    const { bikes } = getState();

    dom.jobBikeSelect.innerHTML = '';

    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = 'Select bike';
    dom.jobBikeSelect.appendChild(emptyOption);

    for (const bike of bikes) {
      const option = document.createElement('option');
      option.value = String(bike.id) ?? '';
      option.textContent = `${bike.make} ${bike.model}`;
      dom.jobBikeSelect.appendChild(option);
    }
  },

  renderJobsList(): void {
    if (!dom.jobList || !dom.emptyJobs) return;

    const { jobs, bikes } = getState();

    dom.jobList.innerHTML = '';

    if (jobs.length === 0) {
      dom.emptyJobs.classList.remove('is-hidden');
      dom.jobList.classList.add('is-hidden');
      return;
    }

    dom.emptyJobs.classList.add('is-hidden');
    dom.jobList.classList.remove('is-hidden');

    for (const job of jobs) {
      const bike = bikes.find((b) => String(b.id) === String(job.bike_id));
      const bikeLabel = bike ? `${bike.make} ${bike.model}` : 'Unknown bike';

      const card = createJobCard(job, bikeLabel);
      dom.jobList.appendChild(card);
    }
  },

  topbar(): void {
    dom.topBar?.classList.toggle('is-hidden');
  },

  errorMessage(
    message: string = '',
    target:
      | 'login'
      | 'register'
      | 'save-bike'
      | 'create-job'
      | 'logout' = 'login',
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
      case 'create-job':
        if (dom.addJobHint) dom.addJobHint.textContent = message;
        break;
      default:
        break;
    }
  },
};
