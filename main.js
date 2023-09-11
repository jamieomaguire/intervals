import './src/scss/style.scss';
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
let sets;
let currentSet = 1;
let restBetweenSetsDuration = 0;
let inRestBetweenSets = false;

const canvas = document.getElementById('timerCanvas');
const ctx = canvas.getContext('2d');

/** Initial canvas setup */
window.devicePixelRatio = 2;

// Declare canvasWidth and canvasHeight outside of the resizeCanvas function
let canvasWidth, canvasHeight;

function resizeCanvas() {
  let viewportWidth = window.innerWidth;

  // Check if the device is mobile
  if (viewportWidth <= 768) {  // Assuming 768px as the breakpoint for mobile
    canvasWidth = viewportWidth - 16;
  } else {
    canvasWidth = Math.min(0.7 * viewportWidth, viewportWidth);
  }

  canvasHeight = (3 / 4) * canvasWidth;

  canvas.style.width = canvasWidth + "px";
  canvas.style.height = canvasHeight + "px";

  const scale = window.devicePixelRatio;
  canvas.width = canvasWidth * scale;
  canvas.height = canvasHeight * scale;

  ctx.scale(scale, scale);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';

  // Update the x and y values based on the new canvas dimensions
  window.x = canvasWidth / 2;
  window.y = canvasHeight / 2;
}

resizeCanvas();

// Event Listeners
window.addEventListener('resize', resizeCanvas);
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
    sets = data.sets;
    restBetweenSetsDuration = data.restBetweenSetsDuration;
    loadFromSettings();
    document.getElementById('output').innerHTML = 'Timer loaded from URL. (See "Create timer" for settings)';
    drawTime(countdownDuration, '', false);
  }
});

function adjustFontSize(ctx, maxFontSize, textArray, maxWidth) {
  let fontSize = maxFontSize;
  ctx.font = `${fontSize}px Arial`;

  const combinedWidth = textArray.reduce((acc, text) => acc + ctx.measureText(text).width, 0);

  while (combinedWidth > maxWidth && fontSize > 10) {
    fontSize--;
    ctx.font = `${fontSize}px Arial`;
  }

  return fontSize;
}

function drawTime(time, intervalName = '', displayRound = true) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = time % 1000;

  const minutesText = `${minutes.toString().padStart(2, '0')}:`;
  const secondsText = `${seconds.toString().padStart(2, '0')}.`;
  const milliText = milliseconds.toString().slice(0, 2).padStart(2, '0');

  const baseFontSize = canvasWidth * 0.1;
  const maxFontSize = 1.8 * baseFontSize;

  const fontSize = adjustFontSize(ctx, maxFontSize, [minutesText, secondsText, milliText], canvasWidth);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const maxMinutesWidth = ctx.measureText("59:").width;
  const maxSecondsWidth = ctx.measureText("59.").width;

  const startX = window.x - (maxMinutesWidth + maxSecondsWidth + ctx.measureText("99").width) / 2;

  ctx.fillText(minutesText, startX, y);
  ctx.fillText(secondsText, startX + maxMinutesWidth, window.y);
  ctx.fillText(milliText, startX + maxMinutesWidth + maxSecondsWidth, window.y);

  const bottomTextFontSize = 0.7 * baseFontSize;
  const bottomTextMargin = 10;

  // Display Name on bottom left
  ctx.font = `${bottomTextFontSize}px Arial`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(intervalName, bottomTextMargin, canvasHeight - bottomTextMargin);

  // Display current round on bottom right
  if (displayRound) {
    ctx.textAlign = 'right';
    const roundText = `${currentRound}/${rounds}`;
    ctx.fillText(roundText, canvasWidth - bottomTextMargin, canvasHeight - bottomTextMargin);
  }

  // Display current set in the top left
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = `${0.7 * baseFontSize}px Arial`;  // Adjust font size for set display as needed
  const setText = `Set: ${currentSet}/${sets}`;
  ctx.fillText(setText, bottomTextMargin, bottomTextMargin);  // Display set text in the top left corner
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
      canvas.style.backgroundColor = intervals[0].color;
      startTime = null;
      animate(currentTime);
      return;
    }
    drawTime(remainingTime, '', false);
  } else if (inRestBetweenSets) {
    let remainingRestTime = restBetweenSetsDuration - elapsed;
    if (remainingRestTime <= 0) {
      inRestBetweenSets = false;
      currentIntervalIndex = 0;  // Reset the interval index
      canvas.style.backgroundColor = intervals[0].color;
      startTime = null;
      animate(currentTime);
      return;
    }
    drawTime(remainingRestTime, "Resting", true);  // You can change "Resting" to any appropriate text.
  } else {
    let currentInterval = intervals[currentIntervalIndex];

    console.log(currentInterval)
    let remainingTime = currentInterval.duration - elapsed;

    if (remainingTime <= 0) {
      currentIntervalIndex++;

      if (currentIntervalIndex >= intervals.length) {
        currentRound++;

        if (currentRound > rounds) {
          currentSet++;
          currentRound = 1;

          if (currentSet > sets) {
            timerStopped = true;
            currentIntervalIndex = intervals.length - 1;
            canvas.style.backgroundColor = 'white';
            currentSet = sets; // Correcting the set display
            drawTime(0, '', false);
            return;
          }

          if (restBetweenSetsDuration > 0) {
            inRestBetweenSets = true;
            canvas.style.backgroundColor = 'grey'; // Or any color to indicate rest
            startTime = null;
            elapsed = 0;
            animate(currentTime);
            return;
          }
        }

        currentIntervalIndex = 0;
      }

      currentInterval = intervals[currentIntervalIndex];
      canvas.style.backgroundColor = currentInterval.color;
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
    canvas.style.backgroundColor = 'white';
    drawTime(0, '', false);
  }
}


/** 
 * Starts the timer after capturing user inputs 
 */
function startTimer() {
  captureInputs();
  console.log(sets)
  if (timerStopped && intervals.length > 0) {
    timerStopped = false;
    currentIntervalIndex = 0;
    currentRound = 1;
    if (countdownDuration > 0) {
      inCountdown = true;
    } else {
      canvas.style.backgroundColor = intervals[0].color;
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
  canvas.style.backgroundColor = 'white';
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

  sets = parseInt(document.getElementById('sets').value) || 1;
  restBetweenSetsDuration = parseInt(document.getElementById('restBetweenSets').value) * 1000;

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
                <input type="text" placeholder="Name" class="interval-name">
                <input type="number" placeholder="Seconds" class="interval-duration">
                <input type="color" class="interval-color">
            `;
  container.appendChild(newInterval);
}

function saveToURL() {
  captureInputs();
  const settings = {
    intervals: intervals,
    rounds: rounds,
    countdownDuration: countdownDuration,
    sets: sets,
    restBetweenSetsDuration: restBetweenSetsDuration
  };

  const serialized = JSON.stringify(settings);
  console.log(serialized)
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
    countdownDuration: countdownDuration,
    sets: sets,
    restBetweenSetsDuration: restBetweenSetsDuration
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
  videoElement.style.display = 'block';
  const qrScanner = new QrScanner(
    videoElement,
    result => {
      console.log(result)
      const data = JSON.parse(result.data);
      console.log(data);
      intervals = data.intervals;
      rounds = data.rounds;
      countdownDuration = data.countdownDuration;
      sets = data.sets;
      restBetweenSetsDuration: data.restBetweenSetsDuration;
      loadFromSettings();
      document.getElementById('output').innerHTML = 'Timer loaded from QR scan. (See "Create timer" for settings)';
      drawTime(countdownDuration, '', false);
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
  document.getElementById('sets').value = sets;
  document.getElementById('restBetweenSets').value = restBetweenSetsDuration / 1000;

  const container = document.getElementById('intervalContainer');
  container.innerHTML = '';

  intervals.forEach(interval => {
    const container = document.getElementById('intervalContainer');
    const newInterval = document.createElement('fieldset');
    newInterval.className = 'intervalFieldset';
    newInterval.innerHTML = `
                  <label>Interval ${container.querySelectorAll('.intervalFieldset').length + 1}: </label>
                  <input type="text" placeholder="Name" class="interval-name" value="${interval.name}">
                  <input type="number" placeholder="Seconds" class="interval-duration" value="${interval.duration / 1000}">
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
      document.getElementById('output').innerHTML = 'Timer loaded from QR upload. (See "Create timer" for settings)';
      drawTime(countdownDuration, '', false);
    } catch (err) {
      console.error('Failed to decode QR code from image:', err);
    }
  }
});
