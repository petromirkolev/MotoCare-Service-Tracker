import './style.css';
import { bindEvents } from './ui/router';
import { render } from './dom/render';
import { getCurrentUser } from './state/auth-store';
import { refreshBikes } from './state/state-store';

async function bootstrap() {
  const user = getCurrentUser();

  if (user) {
    await refreshBikes();
    await render.bikeScreen();
  } else {
    render.initialScreen();
  }

  bindEvents();
}

bootstrap();
