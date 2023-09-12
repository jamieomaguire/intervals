import LZString from 'lz-string';

export class ConfigManager {
  constructor() {
    // Initializing some properties to store intervals, rounds, and other settings.
    this.intervals = [];
    this.rounds = 1;
    this.countdownDuration = 0;
    this.sets = 1;
    this.restBetweenSetsDuration = 0;
  }

  captureInputs() {
    const intervalEls = document.querySelectorAll('.intervalFieldset');
    this.intervals = [];

    intervalEls.forEach(intervalEl => {
      const name = intervalEl.querySelector('.interval-name').value;
      const duration = parseInt(intervalEl.querySelector('.interval-duration').value) * 1000;
      const color = intervalEl.querySelector('.interval-color').value;

      if (name && duration) {
        this.intervals.push({ name, duration, color });
      }
    });

    this.sets = parseInt(document.getElementById('sets').value) || 1;
    this.restBetweenSetsDuration = parseInt(document.getElementById('restBetweenSets').value) * 1000;
    this.countdownDuration = parseInt(document.getElementById('countdown').value) * 1000;
    this.rounds = parseInt(document.getElementById('rounds').value) || 1;
  }

  addInterval() {
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

  saveToURL() {
    this.captureInputs();
    const settings = {
      intervals: this.intervals,
      rounds: this.rounds,
      countdownDuration: this.countdownDuration,
      sets: this.sets,
      restBetweenSetsDuration: this.restBetweenSetsDuration
    };

    const serialized = JSON.stringify(settings);
    const compressed = LZString.compressToEncodedURIComponent(serialized);

    if (compressed.length <= 2000) {
      const newUrl = new URL(window.location);
      newUrl.searchParams.set('config', compressed);
      window.history.pushState(null, '', newUrl);
    } else {
      console.warn('URL character length is above 2000. Consider other methods of saving configuration.');
    }
  }

  loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const config = urlParams.get('config');

    if (config) {
      const decompressed = LZString.decompressFromEncodedURIComponent(config);
      const data = JSON.parse(decompressed);

      this.intervals = data.intervals;
      this.rounds = data.rounds;
      this.countdownDuration = data.countdownDuration;
      this.sets = data.sets;
      this.restBetweenSetsDuration = data.restBetweenSetsDuration;
      this.populateFields();
      document.getElementById('output').innerHTML = 'Timer loaded from URL. (See "Customise timer" for settings)';
      document.getElementById('customise').open = true;
    }
  }

  loadFromSettings(settings) {
    this.intervals = settings.intervals;
    this.rounds = settings.rounds;
    this.countdownDuration = settings.countdownDuration;
    this.sets = settings.sets;
    this.restBetweenSetsDuration = settings.restBetweenSetsDuration;
    
    // Load the values into the appropriate input fields based on the provided settings
    document.getElementById('rounds').value = settings.rounds || '';
    document.getElementById('countdown').value = settings.countdownDuration / 1000 || ''; // converting to seconds
    document.getElementById('sets').value = settings.sets || '';
    document.getElementById('restBetweenSets').value = settings.restBetweenSetsDuration / 1000 || ''; // converting to seconds

    const container = document.getElementById('intervalContainer');

    // Clear out existing intervals
    container.innerHTML = '';

    settings.intervals.forEach(interval => {
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

    // Notify the user that settings have been loaded
    document.getElementById('output').innerHTML = 'Timer loaded from QR. (See "Customise timer" for settings)';

    document.getElementById('customise').open = true;
  }

  populateFields() {
    document.getElementById('countdown').value = this.countdownDuration / 1000;
    document.getElementById('rounds').value = this.rounds;
    document.getElementById('sets').value = this.sets;
    document.getElementById('restBetweenSets').value = this.restBetweenSetsDuration / 1000;

    const container = document.getElementById('intervalContainer');
    container.innerHTML = '';

    this.intervals.forEach(interval => {
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

  get capturedIntervals() {
    return this.intervals;
  }

  get capturedRounds() {
    return this.rounds;
  }

  get capturedCountdownDuration() {
    return this.countdownDuration;
  }

  get capturedSets() {
    return this.sets;
  }

  get capturedRestBetweenSetsDuration() {
    return this.restBetweenSetsDuration;
  }
}
