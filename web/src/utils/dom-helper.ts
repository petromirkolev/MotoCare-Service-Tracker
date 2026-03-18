export function req<T extends HTMLElement>(el: T | null, name: string): T {
  if (!el) throw new Error(`Missing DOM element: ${name}`);
  return el;
}

export function markJobs(status: string) {
  const jobCards = document.querySelectorAll<HTMLElement>('.job-card');

  jobCards.forEach((card) => {
    const statusEl = card.querySelector<HTMLElement>('.status');

    statusEl?.classList.contains(status)
      ? card.classList.remove('is-hidden')
      : card.classList.add('is-hidden');
  });
}

export function setActiveJobFilter(target: HTMLElement): void {
  const filterButtons = document.querySelectorAll<HTMLElement>('.filter');

  filterButtons.forEach((button) => {
    button.classList.remove('active');
  });

  target.classList.add('active');
}
