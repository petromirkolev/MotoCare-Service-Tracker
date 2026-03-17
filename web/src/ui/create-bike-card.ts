/* This file contains the createBikeCard function, which generates an HTML element representing a bike card in the UI. The card includes the bike's name, meta information, odometer reading, and action buttons for editing and deleting the bike. */

import type { Bike } from '../types/bikes';

export function createBikeCard(bike: Bike): HTMLElement {
  const id = String(bike.id);

  const article = document.createElement('article');
  article.className = 'card bike-card';
  article.dataset.bikeId = id;
  article.setAttribute('data-testid', `card-bike-${id}`);

  article.innerHTML = `
  <div class="bike-card-main" data-testid="bike-card-main">
    <div>
      <h4 data-testid="bike-name"></h4>
      <p class="muted" data-testid="bike-meta"></p>
    </div>
    <span class="tag" data-testid="bike-tag">Ready</span>
  </div>

  <div class="bike-card-actions" data-testid="bike-card-actions">
    <button
      type="button"
      class="ghost danger bike-delete-btn"
      data-testid="btn-delete-bike"
      data-action="delete-bike">
      Delete
    </button>
  </div>
`;

  const nameEl = article.querySelector('[data-testid="bike-name"]');
  const paraEl = article.querySelector('[data-testid="bike-meta"]');
  const tagEl = article.querySelector('[data-testid="bike-tag"]');

  if (!nameEl || !paraEl || !tagEl) {
    throw new Error('Bike card template missing expected elements');
  }

  nameEl.textContent = bike.make;
  paraEl.textContent = `${bike.year} ${bike.make} ${bike.model}`;
  tagEl.textContent = 'Not ready';

  return article;
}
