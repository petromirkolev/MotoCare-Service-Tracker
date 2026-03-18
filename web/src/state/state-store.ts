import { getBikesApi } from '../api/bikes';
import { getJobsApi } from '../api/jobs';
import { getCurrentUser } from './auth-store';
import type { StoreState } from '../types/state';

const listeners = new Set<() => void>();

let state: StoreState = {
  bikes: [],
  jobs: [],
};

async function initState(): Promise<void> {
  state = await loadState();
  notify();
}

async function loadState(): Promise<StoreState> {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return {
      bikes: [],
      jobs: [],
    };
  }

  try {
    const bikes = await getBikesApi();
    const jobs = await getJobsApi(currentUser.id);

    return {
      bikes: Array.isArray(bikes) ? bikes : [],
      jobs: Array.isArray(jobs) ? jobs : [],
    };
  } catch {
    return {
      bikes: [],
      jobs: [],
    };
  }
}

function getState(): StoreState {
  return state;
}

function setState(nextState: StoreState): void {
  state = nextState;
  notify();
}

function updateState(updater: (prev: StoreState) => StoreState): void {
  state = updater(state);
  notify();
}

async function refreshBikes(): Promise<void> {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    state = {
      ...state,
      bikes: [],
    };
    notify();
    return;
  }

  const bikes = await getBikesApi();

  state = {
    ...state,
    bikes: Array.isArray(bikes) ? bikes : [],
  };

  notify();
}

async function refreshJobs(): Promise<void> {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    state = {
      ...state,
      jobs: [],
    };
    notify();
    return;
  }

  const jobs = await getJobsApi(currentUser.id);

  state = {
    ...state,
    jobs: Array.isArray(jobs) ? jobs : [],
  };

  notify();
}

function notify() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export {
  initState,
  loadState,
  notify,
  subscribe,
  setState,
  getState,
  updateState,
  refreshBikes,
  refreshJobs,
};
