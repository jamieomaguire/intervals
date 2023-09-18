import './src/scss/style.scss';
import { Timer } from './timer';
import { ConfigManager } from './configManager';

// Wrap everything inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Initializations
  const configManager = new ConfigManager();
  configManager.loadFromURL();
  const timer = new Timer(configManager);

  // Event listeners for ConfigManager
  document.getElementById('addInterval').addEventListener('click', configManager.addInterval.bind(configManager));
  document.getElementById('createURL').addEventListener('click', configManager.saveToURL.bind(configManager));

  // Event listeners for Timer
  document.getElementById('startTimer').addEventListener('click', timer.startTimer.bind(timer));
  document.getElementById('stopTimer').addEventListener('click', timer.stopTimer.bind(timer));

  document.querySelectorAll('details').forEach(details => {
    let clicked = false;

    details.addEventListener('click', () => {
      clicked = true;
    });

    details.addEventListener('toggle', function () {
      if (clicked) {
        this.scrollIntoView({ behavior: 'smooth', block: 'start' });
        clicked = false;  // Reset the flag
      }
    });
  });
});
