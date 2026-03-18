import { getJobsApi } from '../api/jobs';
import { getCurrentUser } from '../state/auth-store';
import type { Bike } from '../types/bikes';

export async function createBikeCard(bike: Bike): Promise<HTMLElement> {
  const id = String(bike.id);
  const user = getCurrentUser();
  if (!user) throw new Error('No user found');

  const article = document.createElement('article');
  article.className = 'card bike-card';
  article.dataset.bikeId = id;
  article.setAttribute('data-testid', `card-bike-${id}`);

  article.innerHTML = `
  <div class="bike-card-main" data-testid="bike-card-main">
    <div class="bike-card-text">
      <h4 data-testid="bike-name"></h4>
      <p class="muted" data-testid="bike-meta"></p>
    </div>
    <div class="bike-card-actions" data-testid="bike-card-actions">
      <span class="tag" data-testid="bike-tag"></span>
      <button type="button" class="ghost danger bike-delete-btn"
      data-testid="btn-delete-bike"
      data-bike-id="${id}"
      data-action="delete-bike">Delete</button>
    </div>
  </div>
`;

  const nameEl = article.querySelector('[data-testid="bike-name"]');
  const paraEl = article.querySelector('[data-testid="bike-meta"]');
  const tagEl = article.querySelector('[data-testid="bike-tag"]');

  if (!nameEl || !paraEl || !tagEl) {
    throw new Error('Bike card template missing expected elements');
  }

  const jobs = await getJobsApi(user.id);

  const allJobsDone = jobs.find((job: any) => {
    return job.status !== 'done' && job.status !== 'cancelled';
  });

  if (allJobsDone) {
    tagEl.textContent = 'Not ready';
    tagEl.classList.add('notready');
  } else {
    tagEl.textContent = 'Ready';
  }

  nameEl.textContent = bike.make;
  paraEl.textContent = `${bike.year} ${bike.make} ${bike.model}`;

  return article;
}
