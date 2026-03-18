/* DOM selectors for the application. These are used to access and manipulate specific elements in the DOM throughout the app. */

export const dom = {
  /* Initial screen */
  initialScreen: document.querySelector<HTMLElement>(
    '[data-testid="page-auth"]',
  ),
  loginButton: document.querySelector<HTMLButtonElement>(
    '[data-testid="tab-login"]',
  ),
  registerButton: document.querySelector<HTMLButtonElement>(
    '[data-testid="tab-register"]',
  ),

  /* Login screen */
  loginForm: document.querySelector<HTMLFormElement>(
    '[data-testid="form-login"]',
  ),
  loginHint: document.querySelector<HTMLElement>(
    '[data-testid="message-login-error"]',
  ),

  /* Register screen */
  registerForm: document.querySelector<HTMLFormElement>(
    '[data-testid="form-register"]',
  ),
  registerHint: document.querySelector<HTMLElement>(
    '[data-testid="message-register-error"]',
  ),

  /* Topbar */
  currentUserEmail: document.querySelector<HTMLElement>(
    '[data-testid="text-current-user-email"]',
  ),
  navBikes: document.querySelector<HTMLElement>('[data-testid="nav-bikes"]'),
  navJobs: document.querySelector<HTMLElement>('[data-testid="nav-jobs"]'),

  /* Bikes screen */
  bikeScreen: document.querySelector<HTMLFormElement>(
    '[data-testid="page-bikes"]',
  ),
  bikeGrid: document.querySelector<HTMLElement>('[data-testid="list-bikes"]'),
  emptyBikeGrid: document.querySelector<HTMLElement>(
    '[data-testid="empty-bikes"]',
  ),
  bikesCount: document.querySelector<HTMLElement>(
    '[data-testid="text-bike-count"]',
  ),

  /* Add bike form */
  addBikeForm: document.querySelector<HTMLFormElement>(
    '[data-testid="form-add-bike"]',
  ),
  addBikeHint: document.querySelector<HTMLElement>(
    '[data-testid="message-bike-error"]',
  ),

  /* Jobs screen */
  jobScreen: document.querySelector<HTMLElement>('[data-testid="page-jobs"]'),
  jobBikeSelect: document.querySelector<HTMLSelectElement>(
    '[data-testid="select-job-bike"]',
  ),
  jobList: document.querySelector<HTMLElement>('[data-testid="list-jobs"]'),
  emptyJobs: document.querySelector<HTMLElement>('[data-testid="empty-jobs"]'),

  /* Add job form */
  addJobForm: document.querySelector<HTMLFormElement>(
    '[data-testid="form-create-job"]',
  ),
  addJobHint: document.querySelector<HTMLElement>(
    '[data-testid="message-job-error"]',
  ),
};
