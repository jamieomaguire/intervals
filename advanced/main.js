import { Set } from './set';
import { Interval } from './interval';
import LZString from 'lz-string';

document.addEventListener('DOMContentLoaded', () => {

  const setsContainer = document.getElementById('setsContainer');
  const addSetBtn = document.getElementById('addSetBtn');

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
      const set = new Set(rounds);

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

    const compressed = LZString.compressToEncodedURIComponent(serializedData);
    console.log(compressed); // This logs the serialized form data.
  });


  editBtn.addEventListener('click', () => {
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
  });

});
