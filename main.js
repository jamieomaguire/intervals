import './src/scss/style.scss';
import { Timer } from './timer';
import { ConfigManager } from './configManager';
import { QRHandler } from './qrHandler';

// Wrap everything inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Initializations
    const configManager = new ConfigManager();
    configManager.loadFromURL();
    const timer = new Timer(configManager);
    const qrHandler = new QRHandler(timer);

    // Event listeners for ConfigManager
    document.getElementById('addInterval').addEventListener('click', configManager.addInterval.bind(configManager));
    document.getElementById('createURL').addEventListener('click', configManager.saveToURL.bind(configManager));

    // Event listeners for Timer
    document.getElementById('startTimer').addEventListener('click', timer.startTimer.bind(timer));
    document.getElementById('stopTimer').addEventListener('click', timer.stopTimer.bind(timer));

    // Event listeners for QRHandler
    document.getElementById('saveToQR').addEventListener('click', qrHandler.saveToQR.bind(qrHandler));
    document.getElementById('scanQR').addEventListener('click', qrHandler.scanQR.bind(qrHandler));
    qrHandler.handleQRUpload();
});
