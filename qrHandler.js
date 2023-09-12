import QrScanner from 'qr-scanner';
import { QRCode } from './src/qrcode';

export class QRHandler {
  constructor(timer) {
    this.timer = timer;
    this.qrScanner = null;

    document.getElementById('uploadQR').addEventListener('change', this.handleQRUpload.bind(this));
  }

  saveToQR() {
    this.timer.configManager.captureInputs(); // Use the ConfigManager's captureInputs method
    const settings = {
      intervals: this.timer.configManager.capturedIntervals,
      rounds: this.timer.configManager.capturedRounds,
      countdownDuration: this.timer.configManager.capturedCountdownDuration,
      sets: this.timer.configManager.capturedSets,
      restBetweenSetsDuration: this.timer.configManager.capturedRestBetweenSetsDuration
    };
    const serialized = JSON.stringify(settings);

    console.log(serialized.length)

    const qrCodeEl = document.getElementById('qrCode');

    // delete previous QR code
    qrCodeEl.innerHTML = '';

    // Generate QR code using qrcodejs library
    const qrcode = new QRCode(qrCodeEl, {
      text: serialized,
      correctLevel: QRCode.CorrectLevel.L
    });
  }

  scanQR() {
    const videoElement = document.getElementById('preview');
    videoElement.style.display = 'block';

    const qrScanner = new QrScanner(
      videoElement,
      result => {
        console.log(result);
        const data = JSON.parse(result.data);
        this.timer.configManager.loadFromSettings(data);
        this.timer.drawTime(data.countdownDuration || 0, '', false);
        console.log(qrScanner);
        qrScanner.stop();
      },
      { returnDetailedScanResult: true }
    );

    qrScanner.start();
  }

  handleQRUpload() {
    const fileInput = document.getElementById('uploadQR');
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (file) {
        try {
          const result = await QrScanner.scanImage(file);
          console.log(result);
          const data = JSON.parse(result);
          this.timer.configManager.loadFromSettings(data);
          this.timer.drawTime(data.countdownDuration || 0, '', false);
          console.log(this.timer.timerStopped)
        } catch (err) {
          console.error('Failed to decode QR code from image:', err);
        }
      }
    });
  }
}
