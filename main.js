import './style.scss';
import QrScanner from 'qr-scanner';
import { QRCode } from './src/qrcode';
import LZString from 'lz-string';

/** Global variables */
let startTime;
let elapsed;
let timerStopped = true;
let intervals = [];
let currentIntervalIndex = 0;
let rounds;
let currentRound = 1;
let countdownDuration = 0;
let inCountdown = false;

const canvas = document.getElementById('timerCanvas');
canvas.style.border = '1px dashed purple';
const ctx = canvas.getContext('2d');

/** Initial canvas setup */
window.devicePixelRatio = 2;
const size = 250;

canvas.style.width = size + "px";
canvas.style.height = size + "px";

const scale = window.devicePixelRatio;
canvas.width = size * scale;
canvas.height = size * scale;

ctx.scale(scale, scale);
ctx.font = '30px Arial';
ctx.textBaseline = 'middle';
ctx.textAlign = 'left';

const x = size / 2;
const y = size / 2;

// Event Listeners
document.getElementById('addInterval').addEventListener('click', addInterval);
document.getElementById('startTimer').addEventListener('click', startTimer);
document.getElementById('stopTimer').addEventListener('click', stopTimer);
document.getElementById('saveToQR').addEventListener('click', saveToQR);
document.getElementById('scanQR').addEventListener('click', scanQR);
document.getElementById('createURL').addEventListener('click', saveToURL);

// When the app loads, check for config in URL and apply if present
window.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const config = urlParams.get('config');

  if (config) {
    const decompressed = LZString.decompressFromEncodedURIComponent(config);
    const data = JSON.parse(decompressed);

    intervals = data.intervals;
    rounds = data.rounds;
    countdownDuration = data.countdownDuration;
    loadFromSettings();
  }
});

/**
 * Draws the given time on the canvas
 * @param {number} time - Time in milliseconds
 * @param {string} [intervalName=''] - Name of the current interval
 * @param {boolean} [displayRound=true] - Flag to display the current round
 */
function drawTime(time, intervalName = '', displayRound = true) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = time % 1000;

  const minutesText = `${minutes}:`;
  const secondsText = `${seconds.toString().padStart(2, '0')}.`;
  const milliText = milliseconds.toString().slice(0, 2);

  const minutesMetrics = ctx.measureText(minutesText);
  const secondsMetrics = ctx.measureText(secondsText);

  ctx.fillText(minutesText, x - minutesMetrics.width - secondsMetrics.width, y - 30);
  ctx.fillText(secondsText, x - secondsMetrics.width, y - 30);
  ctx.fillText(milliText, x, y - 30);

  if (displayRound) {
    ctx.fillText(`${currentRound}/${rounds}`, x - (ctx.measureText(`On ${currentRound}/${rounds}`).width / 2), y);
  }

  ctx.fillText(intervalName, x - (ctx.measureText(intervalName).width / 2), y + 30);
}

/** 
 * Animation function to handle timer countdown and transitions
 * @param {number} currentTime - Current timestamp provided by requestAnimationFrame 
 */
function animate(currentTime) {
  if (!startTime) {
    startTime = currentTime;
  }

  elapsed = currentTime - startTime;

  if (inCountdown) {
    let remainingTime = countdownDuration - elapsed;
    if (remainingTime <= 0) {
      inCountdown = false;
      document.body.style.backgroundColor = intervals[0].color;
      startTime = null;
      animate(currentTime);
      return;
    }
    drawTime(remainingTime, 'Countdown', false);
  } else {
    let currentInterval = intervals[currentIntervalIndex];
    let remainingTime = currentInterval.duration - elapsed;

    if (remainingTime <= 0) {
      currentIntervalIndex++;

      if (currentIntervalIndex >= intervals.length) {
        currentRound++;
        currentIntervalIndex = 0;
      }

      if (currentRound > rounds) {
        timerStopped = true;
        currentIntervalIndex = intervals.length - 1;
        document.body.style.backgroundColor = 'white';
        currentRound = rounds; // Correcting the round display
        drawTime(0, '', false);
        return;
      }

      currentInterval = intervals[currentIntervalIndex];
      document.body.style.backgroundColor = currentInterval.color;
      startTime = null;
      elapsed = 0;
      remainingTime = currentInterval.duration;
    }

    drawTime(remainingTime, currentInterval.name);
  }

  if (!timerStopped) {
    requestAnimationFrame(animate);
  } else {
    console.log('timer stopped');
    document.body.style.backgroundColor = 'white';
    drawTime(0, '', false);
  }
}

/** 
 * Starts the timer after capturing user inputs 
 */
function startTimer() {
  captureInputs();
  if (timerStopped && intervals.length > 0) {
    timerStopped = false;
    currentIntervalIndex = 0;
    currentRound = 1;
    if (countdownDuration > 0) {
      inCountdown = true;
    } else {
      document.body.style.backgroundColor = intervals[0].color;
    }
    startTime = null;
    requestAnimationFrame(animate);
  }
}

/** 
 * Stops the timer and resets some global states
 */
function stopTimer() {
  timerStopped = true;
  currentIntervalIndex = 0;
  inCountdown = false;
  document.body.style.backgroundColor = 'white';
}

/** 
 * Captures inputs for intervals, countdown, and rounds
 */
function captureInputs() {
  const intervalEls = document.querySelectorAll('.intervalFieldset');
  intervals = [];

  intervalEls.forEach(intervalEl => {
    const name = intervalEl.querySelector('.interval-name').value;
    const duration = parseInt(intervalEl.querySelector('.interval-duration').value) * 1000;
    const color = intervalEl.querySelector('.interval-color').value;

    if (name && duration) {
      intervals.push({ name, duration, color });
    }
  });

  countdownDuration = parseInt(document.getElementById('countdown').value) * 1000;
  rounds = parseInt(document.getElementById('rounds').value) || 1;
}

/** 
 * Adds another interval input field to the DOM 
 */
function addInterval() {
  const container = document.getElementById('intervalContainer');
  const newInterval = document.createElement('fieldset');
  newInterval.className = 'intervalFieldset';
  newInterval.innerHTML = `
                <label>Interval ${container.querySelectorAll('.intervalFieldset').length + 1}: </label>
                <input type="text" placeholder="Interval Name" class="interval-name">
                <input type="number" placeholder="Duration (seconds)" class="interval-duration">
                <input type="color" class="interval-color">
            `;
  container.appendChild(newInterval);
}

function saveToURL() {
  captureInputs();
  const settings = {
    intervals: intervals,
    rounds: rounds,
    countdownDuration: countdownDuration
  };
  const serialized = JSON.stringify(settings);
  const compressed = LZString.compressToEncodedURIComponent(serialized);

  if (compressed.length <= 2000) {
    // Update the URL with the compressed string
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('config', compressed);
    window.history.pushState(null, '', newUrl);
  } else {
    console.warn('URL character length is above 2000. Saving as QR code instead.');
    // If compressed data is too long, revert to using QR code
    saveToQR();
  }
}

// EXPERIMENTAL - QR CODE FUNCTIONALITY
function saveToQR() {
  captureInputs();
  const settings = {
    intervals: intervals,
    rounds: rounds,
    countdownDuration: countdownDuration
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

function scanQR() {
  const videoElement = document.getElementById('preview');
  const qrScanner = new QrScanner(
    videoElement,
    result => {
      console.log(result)
      const data = JSON.parse(result.data);
      console.log(data);
      intervals = data.intervals;
      rounds = data.rounds;
      countdownDuration = data.countdownDuration;
      loadFromSettings();
      console.log(qrScanner)
      qrScanner.stop();
    },
    { returnDetailedScanResult: true },
  );

  qrScanner.start();
}

function loadFromSettings() {
  // Populate the fields on the page based on the scanned settings
  document.getElementById('countdown').value = countdownDuration / 1000;
  document.getElementById('rounds').value = rounds;

  const container = document.getElementById('intervalContainer');
  container.innerHTML = '';

  intervals.forEach(interval => {
    const container = document.getElementById('intervalContainer');
    const newInterval = document.createElement('fieldset');
    newInterval.className = 'intervalFieldset';
    newInterval.innerHTML = `
                  <label>Interval ${container.querySelectorAll('.intervalFieldset').length + 1}: </label>
                  <input type="text" placeholder="Interval Name" class="interval-name" value="${interval.name}">
                  <input type="number" placeholder="Duration (seconds)" class="interval-duration" value="${interval.duration / 1000}">
                  <input type="color" class="interval-color" value="${interval.color}">
              `;

    container.appendChild(newInterval);
  });
}

// QR code upload event listener
document.getElementById('uploadQR').addEventListener('change', async function () {
  const file = this.files[0];
  if (file) {
    try {
      const result = await QrScanner.scanImage(file);
      console.log(result);
      const data = JSON.parse(result);
      intervals = data.intervals;
      rounds = data.rounds;
      countdownDuration = data.countdownDuration;
      loadFromSettings();
    } catch (err) {
      console.error('Failed to decode QR code from image:', err);
    }
  }
});
