import './src/scss/style.scss';
import { Timer } from './timer';
import { ConfigManager } from './configManager';
// import { QRHandler } from './qrHandler';

// Wrap everything inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // Initializations
  const configManager = new ConfigManager();
  configManager.loadFromURL();
  const timer = new Timer(configManager);
  // const qrHandler = new QRHandler(timer);

  // Event listeners for ConfigManager
  document.getElementById('addInterval').addEventListener('click', configManager.addInterval.bind(configManager));
  document.getElementById('createURL').addEventListener('click', configManager.saveToURL.bind(configManager));

  // Event listeners for Timer
  document.getElementById('startTimer').addEventListener('click', timer.startTimer.bind(timer));
  document.getElementById('stopTimer').addEventListener('click', timer.stopTimer.bind(timer));

  // Event listeners for QRHandler
  // document.getElementById('saveToQR').addEventListener('click', qrHandler.saveToQR.bind(qrHandler));
  // document.getElementById('scanQR').addEventListener('click', qrHandler.scanQR.bind(qrHandler));
  // qrHandler.handleQRUpload();   

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

  // const themeToggle = document.getElementById('themeToggle');
  // const logo = document.getElementById('logo');

  // themeToggle.addEventListener('click', () => {
  //   if (document.documentElement.getAttribute('data-theme') === 'dark') {
  //     document.documentElement.removeAttribute('data-theme');
  //     themeToggle.innerHTML = '<span>&#9790;</span>';
  //     logo.src = "./logo-light.png";
  //   } else {
  //     document.documentElement.setAttribute('data-theme', 'dark');
  //     themeToggle.innerHTML = '<span>&#9728;</span>';
  //     logo.src = "./logo-dark.png";
  //   }

  //   const themeChangeEvent = new Event('themeChange');
  //   document.documentElement.dispatchEvent(themeChangeEvent);
  // });
});
