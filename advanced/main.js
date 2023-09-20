import { WorkoutSet } from './workoutSet';
import { Interval } from './interval';
import LZString from 'lz-string';
import './advanced.scss';

document.addEventListener('DOMContentLoaded', () => {
  const setsContainer = document.getElementById('setsContainer');
  const addSetBtn = document.getElementById('addSetBtn');
  const canvasEl = document.getElementById('timer');

  let workout = {};
  function updateSetNumbers() {
    const sets = setsContainer.querySelectorAll('.set');
    sets.forEach((set, index) => {
      const setId = index + 1;
      set.querySelector('.set-number').textContent = setId;
      set.setAttribute('data-testid', `set-${setId}`);
      set.querySelector('.rounds-input').setAttribute('data-testid', `set-${setId}-rounds`);
      set.querySelector('.rest-input').setAttribute('data-testid', `set-${setId}-rest`);
      set.querySelector('.addIntervalBtn').setAttribute('data-testid', `set-${setId}-add-interval`);
      set.querySelector('.deleteSetBtn').setAttribute('data-testid', `set-${setId}-delete-set`);
    });
  }

  // Update the visibility of the Save button based on the number of sets
  function updateSaveButtonVisibility() {
    const sets = setsContainer.querySelectorAll('.set');
    if (sets.length === 0) {
      saveBtn.style.display = 'none';
    } else {
      saveBtn.style.display = 'block';
    }
  }


  addSetBtn.addEventListener('click', () => {
    const setTemplate = document.getElementById('setTemplate').content.cloneNode(true);
    const setId = setsContainer.children.length + 1;
    setTemplate.querySelector('.set-number').textContent = setId;
    setTemplate.querySelector('.set').setAttribute('data-testid', `set-${setId}`);
    setTemplate.querySelector('.rounds-input').setAttribute('data-testid', `set-${setId}-rounds`);
    setTemplate.querySelector('.rest-input').setAttribute('data-testid', `set-${setId}-rest`);
    setTemplate.querySelector('.addIntervalBtn').setAttribute('data-testid', `set-${setId}-add-interval`);
    setTemplate.querySelector('.deleteSetBtn').setAttribute('data-testid', `set-${setId}-delete-set`);

    const addIntervalBtn = setTemplate.querySelector('.addIntervalBtn');
    const deleteSetBtn = setTemplate.querySelector('.deleteSetBtn');
    const intervalsContainer = setTemplate.querySelector('.intervalsContainer');

    addIntervalBtn.addEventListener('click', () => {
      const intervalTemplate = document.getElementById('intervalTemplate').content.cloneNode(true);
      const deleteIntervalBtn = intervalTemplate.querySelector('.deleteIntervalBtn');
      const intervalIndex = intervalsContainer.children.length + 1;

      // Set unique identifier for the interval
      const intervalDiv = intervalTemplate.querySelector('.interval');
      intervalDiv.setAttribute('data-testid', `set-${setId}-interval-${intervalIndex}`);
      deleteIntervalBtn.setAttribute('data-testid', `set-${setId}-interval-${intervalIndex}-delete-interval`);

      // Set unique names and data-testid for form fields within the interval
      const nameInput = intervalTemplate.querySelector('.name-input');
      nameInput.name = `set-${setId}-interval-${intervalIndex}-name`;
      nameInput.setAttribute('data-testid', `set-${setId}-interval-${intervalIndex}-name`);

      const durationInput = intervalTemplate.querySelector('.duration-input');
      durationInput.name = `set-${setId}-interval-${intervalIndex}-duration`;
      durationInput.setAttribute('data-testid', `set-${setId}-interval-${intervalIndex}-duration`);

      // Event listener to delete the interval
      deleteIntervalBtn.addEventListener('click', () => {
        intervalsContainer.removeChild(deleteIntervalBtn.parentElement);
      });

      intervalsContainer.appendChild(intervalTemplate);
    });

    // Event listener to delete the set
    deleteSetBtn.addEventListener('click', () => {
      setsContainer.removeChild(deleteSetBtn.parentElement);
      updateSetNumbers(); // Update set numbers after deleting a set
      updateSaveButtonVisibility();
    });

    setsContainer.appendChild(setTemplate);

    // Show the Save button since we now have at least one set
    saveBtn.style.display = 'block';
  });

  // Buttons
  const saveBtn = document.getElementById('saveBtn');
  const editBtn = document.getElementById('editBtn');

  saveBtn.addEventListener('click', () => {
    // Clear any previous validation errors
    const existingErrors = setsContainer.querySelectorAll('.validation-error');
    existingErrors.forEach(errorDiv => errorDiv.remove());

    // Track if all sets and intervals are valid
    let isValid = true;

    // Validation for intervals
    const intervals = setsContainer.querySelectorAll('.interval');
    for (let interval of intervals) {
      const name = interval.querySelector('.name-input').value.trim();
      const duration = interval.querySelector('.duration-input').value.trim();

      if (!name || !duration) {
        isValid = false;
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('validation-error');
        errorMessage.textContent = 'Please ensure this interval has both a name and a duration.';
        interval.appendChild(errorMessage);
      }
    }

    // Validation to ensure each set has at least one interval
    const sets = setsContainer.querySelectorAll('.set');
    for (let set of sets) {
      const setIntervals = set.querySelectorAll('.interval');
      if (setIntervals.length === 0) {
        isValid = false;
        const errorMessage = document.createElement('div');
        errorMessage.classList.add('validation-error');
        errorMessage.textContent = 'Please add at least one interval to this set.';
        set.appendChild(errorMessage);
      }
    }

    if (!isValid) return;

    // Create a collection to store all sets
    const allSets = [];

    // Loop through each set in the form
    sets.forEach((setElement) => {
      const rounds = parseInt(setElement.querySelector('.rounds-input').value, 10);
      const set = new WorkoutSet(rounds);

      // Loop through each interval in the set
      const intervals = setElement.querySelectorAll('.interval');
      intervals.forEach((intervalElement) => {
        const name = intervalElement.querySelector('.name-input').value;
        const duration = parseInt(intervalElement.querySelector('.duration-input').value, 10);
        const interval = new Interval(name, duration);
        set.addInterval(interval);
      });

      // Set the rest duration for the set
      const rest = parseInt(setElement.querySelector('.rest-input').value, 10);
      set.setRest(rest);

      // Add the set to the collection
      allSets.push(set);
    });

    // Convert the allSets collection to JSON
    const serializedData = JSON.stringify(allSets.map(s => s.toJSON()));

    workout = allSets;
    // Convert to read-only mode and hide the form
    // Create a container for read-only data
    const readOnlyContainer = document.createElement('div');
    readOnlyContainer.id = 'readOnlyContainer';

    sets.forEach((set, index) => {
      // Extract data from the form
      const setId = index + 1;
      const rounds = set.querySelector('.rounds-input').value;

      // Create a Set div
      const setDiv = document.createElement('div');
      setDiv.classList.add('set');
      setDiv.setAttribute('data-testid', `readonly-set-${setId}`);
      const setHeader = document.createElement('h2');
      setHeader.textContent = `Set ${setId}`;
      setDiv.appendChild(setHeader);

      const roundDiv = document.createElement('div');
      roundDiv.classList.add('round');
      roundDiv.textContent = `${rounds} Rounds`;
      roundDiv.setAttribute('data-testid', `readonly-set-${setId}-rounds`);

      const intervals = set.querySelectorAll('.interval');
      intervals.forEach((interval, intervalIndex) => {
        const name = interval.querySelector('.name-input').value;
        const duration = interval.querySelector('.duration-input').value;

        const intervalDiv = document.createElement('div');
        intervalDiv.classList.add('interval');
        if (name.toLowerCase() === 'rest') {
          intervalDiv.style = "--highlight: hotpink;";
        }
        intervalDiv.innerHTML = `
            <span class="name">${name}</span>
            <span class="duration">${duration} seconds</span>
            `;

        // Adding data-testid for the readonly interval name and duration
        const intervalId = `readonly-set-${setId}-interval-${intervalIndex + 1}`;
        intervalDiv.setAttribute('data-testid', intervalId);
        intervalDiv.querySelector('.name').setAttribute('data-testid', `${intervalId}-name`);
        intervalDiv.querySelector('.duration').setAttribute('data-testid', `${intervalId}-duration`);

        roundDiv.appendChild(intervalDiv);
      });

      setDiv.appendChild(roundDiv);
      readOnlyContainer.appendChild(setDiv);

      // Add rest for the set below the set only if there's a rest duration specified
      const restDuration = set.querySelector('.rest-input').value;
      if (restDuration && parseInt(restDuration) > 0) {
        const restDiv = document.createElement('div');
        restDiv.classList.add('interval');
        restDiv.style = "--bg-color: #333; --highlight: coral;";
        restDiv.innerHTML = `
          <span class="name">Rest</span>
          <span class="duration">${restDuration} seconds</span>
          `;

        // Adding data-testid for the readonly rest duration
        restDiv.setAttribute('data-testid', `readonly-set-${setId}-rest`);
        readOnlyContainer.appendChild(restDiv);
      }
    });

    // Append the read-only container to the main container
    setsContainer.parentElement.appendChild(readOnlyContainer);

    // Hide the form, Save button, Add Set button, and show Edit button
    setsContainer.style.display = 'none';
    saveBtn.style.display = 'none';
    addSetBtn.style.display = 'none';
    editBtn.style.display = 'block';
    canvasEl.style.display = 'block';

    const compressed = LZString.compressToEncodedURIComponent(serializedData);
    console.log(compressed); // This logs the serialized form data.

    try {
      // Update the URL with the config parameter
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('config', compressed);

      // Check if the URL has exceeded the maximum length (usually around 2000 characters for most browsers)
      if (newUrl.href.length > 2000) {
        throw new Error('URL length exceeded.');
      }

      // If you're okay with updating the URL in the user's browser:
      window.history.pushState({}, '', newUrl.href);

    } catch (error) {
      console.error(error);

      // Display an error message under the save button
      const errorMessage = document.createElement('div');
      errorMessage.classList.add('validation-error');
      errorMessage.textContent = 'The configuration is too long to be stored in the URL. Please reduce the number of sets or intervals.';
      saveBtn.parentElement.insertBefore(errorMessage, saveBtn.nextSibling);
    }
  });


  editBtn.addEventListener('click', () => {
    stopWorkout();
    
    // Convert back to form mode
    const readOnlyContainer = document.getElementById('readOnlyContainer');
    if (readOnlyContainer) {
      readOnlyContainer.remove();
    }

    // Show the form, Save button, Add Set button, and hide Edit button
    setsContainer.style.display = 'block';
    editBtn.style.display = 'none';
    addSetBtn.style.display = 'block';
    saveBtn.style.display = 'block';
    canvasEl.style.display = 'none';
  });

  // Function to load configuration from URL and populate the form
  function loadConfigFromURL() {
    const url = new URL(window.location.href);
    const config = url.searchParams.get('config');

    if (!config) return; // If no config parameter, exit the function

    try {
      // Decompress the config data
      const decompressed = LZString.decompressFromEncodedURIComponent(config);
      const data = JSON.parse(decompressed);

      // Populate the form with the data
      data.forEach(setData => {
        console.log(setData)
        // Click the 'addSetBtn' to add a new WorkoutSet
        addSetBtn.click();

        // Get the last set element (the one we just added)
        const setElement = setsContainer.lastElementChild;

        // Set rounds and rest values
        setElement.querySelector('.rounds-input').value = setData.rounds;
        if (setData.rest) {
          setElement.querySelector('.rest-input').value = setData.rest;
        }

        // Add intervals to the set
        setData.intervals.forEach(intervalData => {
          console.log(intervalData)
          setElement.querySelector('.addIntervalBtn').click();

          // Get the last interval element (the one we just added)
          const intervalElement = setElement.querySelector('.intervalsContainer').lastElementChild;

          intervalElement.querySelector('.name-input').value = intervalData.name;
          intervalElement.querySelector('.duration-input').value = intervalData.duration;
        });
      });

      // Now, simulate the Save button click to convert to read-only mode
      saveBtn.click();
    } catch (error) {
      console.error("Error decoding and populating form with config data: ", error);
    }
  }

  // Call the function to check and load the config from the URL on page load
  loadConfigFromURL();

  // timer stuff
  let isWorkoutRunning = false;
  let currentSet = 0;
  let currentRound = 0;
  let currentInterval = 0;
  let lastTime = 0;
  let countdown = 0;
  let inRestPeriod = false;
  let isInitialCountdown = true;
  let initialCountdown = 10 * 1000; // 10 seconds in milliseconds

  const canvas = document.getElementById("timerCanvas");
  const ctx = canvas.getContext("2d");
  window.devicePixelRatio = 2;
  const scale = window.devicePixelRatio;

  ctx.font = "30px Arial";

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth * scale;
    canvas.height = canvas.offsetHeight * scale;
    ctx.scale(scale, scale);

    // Adjust font size based on canvas height
    const responsiveFontSize = canvas.height * 0.10; // 10% of canvas height
    ctx.font = `${responsiveFontSize}px Arial`;
  }

  resizeCanvas();
  window.addEventListener('resize', () => {
    resizeCanvas();
  });

  function drawCountdown(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    const milliseconds = time % 1000;

    const minutesText = `${minutes.toString().padStart(2, '0')}:`;
    const secondsText = `${seconds.toString().padStart(2, '0')}.`;
    const milliText = milliseconds.toString().slice(0, 2).padStart(2, '0');

    // Adjust font size based on canvas height
    const responsiveFontSize = canvas.height * 0.10 / scale; // Adjusting for canvas scaling
    ctx.font = `${responsiveFontSize}px Arial`;

    const minutesWidth = ctx.measureText(minutesText).width;
    const secondsWidth = ctx.measureText(secondsText).width;
    const milliWidth = ctx.measureText(milliText).width;
    const totalWidth = minutesWidth + secondsWidth + milliWidth;

    const maxMinutesWidth = ctx.measureText("59:").width;
    const maxSecondsWidth = ctx.measureText("59.").width;
    const totalMaxWidth = maxMinutesWidth + maxSecondsWidth + ctx.measureText("99").width;

    let x = (canvas.width - totalMaxWidth * scale) / 2; // Adjusting for canvas scaling
    let y = canvas.height / 2;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    ctx.fillText(minutesText, x / scale, y / scale); // Adjusting for canvas scaling
    x += maxMinutesWidth * scale;  // Increment the x position by the max width of the minutesText
    ctx.fillText(secondsText, x / scale, y / scale); // Adjusting for canvas scaling
    x += maxSecondsWidth * scale;  // Increment the x position by the max width of the secondsText
    ctx.fillText(milliText, x / scale, y / scale); // Adjusting for canvas scaling
  }



  function loop(timestamp) {
    if (!isWorkoutRunning) {
      return;
    }

    if (!lastTime) lastTime = timestamp;
    let deltaTime = timestamp - lastTime;

    // Handle the initial countdown.
    if (isInitialCountdown) {
      initialCountdown -= deltaTime;

      if (initialCountdown <= 0) {
        isInitialCountdown = false;
        drawCountdown(0); // Clear the last countdown value

        // Initialize the timer for the first interval of the main workout.
        countdown = workout[currentSet].intervals[currentInterval].duration * 1000;
      } else {
        drawCountdown(initialCountdown);
        lastTime = timestamp;
        requestAnimationFrame(loop);
        return;
      }
    }

    // Main workout timer logic
    countdown -= deltaTime;

    if (countdown <= 0) {
      // If end of current interval
      currentInterval++;

      // If end of all intervals for this round
      if (currentInterval >= workout[currentSet].intervals.length) {
        currentRound++;

        // If end of all rounds for this set
        if (currentRound >= workout[currentSet].rounds) {
          currentSet++;
          currentRound = 0;

          // If end of all sets
          if (currentSet >= workout.length) {
            console.log("Workout complete!");
            return;
          } else {
            // Initialize rest period between sets
            countdown = workout[currentSet - 1].rest * 1000;
            drawCountdown(countdown);
            lastTime = timestamp;
            requestAnimationFrame(loop);
            return;
          }
        }

        // Initialize next round
        currentInterval = 0;
      }

      // Set the countdown for the next interval
      countdown = workout[currentSet].intervals[currentInterval].duration * 1000;
    }

    drawCountdown(countdown);
    lastTime = timestamp;
    requestAnimationFrame(loop);
  }

  // Call this function to start the countdown and workout.
  function startWorkout() {
    if (isWorkoutRunning) {
      return;
    }

    isWorkoutRunning = true;
    isInitialCountdown = true;
    initialCountdown = 10 * 1000;
    requestAnimationFrame(loop);
  }

  function stopWorkout() {
    isWorkoutRunning = false;
    isInitialCountdown = true;
    currentSet = 0;
    currentRound = 0;
    currentInterval = 0;
    lastTime = 0;
    countdown = 0;

    drawCountdown(0);
  }

  const startBtn = document.getElementById('startTimerBtn');

  startBtn.addEventListener('click', () => {
    console.log('workout', workout)

    startWorkout();
  });

  const stopBtn = document.getElementById('stopTimerBtn');

  stopBtn.addEventListener('click', () => {
    stopWorkout();
  });
});
