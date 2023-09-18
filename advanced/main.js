document.addEventListener('DOMContentLoaded', () => {

  const setsContainer = document.getElementById('setsContainer');
  const addSetBtn = document.getElementById('addSetBtn');

  function updateSetNumbers() {
    const sets = setsContainer.querySelectorAll('.set');
    sets.forEach((set, index) => {
      const setId = index + 1;
      set.querySelector('.set-number').textContent = setId;
      set.setAttribute('data-id', `set-${setId}`);
      set.querySelector('.rounds-input').setAttribute('data-testid', `set-${setId}-rounds`);
      set.querySelector('.rest-input').setAttribute('data-testid', `set-${setId}-rest`);
      set.querySelector('.addIntervalBtn').setAttribute('data-testid', `set-${setId}-add-interval`);
      set.querySelector('.deleteSetBtn').setAttribute('data-testid', `set-${setId}-delete-set`);
    });
  }

  addSetBtn.addEventListener('click', () => {
    const setTemplate = document.getElementById('setTemplate').content.cloneNode(true);
    const setId = setsContainer.children.length + 1;
    setTemplate.querySelector('.set-number').textContent = setId;
    setTemplate.querySelector('.set').setAttribute('data-id', `set-${setId}`);
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
      intervalDiv.setAttribute('data-id', `set-${setId}-interval-${intervalIndex}`);
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
    });

    setsContainer.appendChild(setTemplate);
  });

  // Buttons
  const saveBtn = document.getElementById('saveBtn');
  const editBtn = document.getElementById('editBtn');

  saveBtn.addEventListener('click', () => {
    // Convert to read-only mode and hide the form

    // Create a container for read-only data
    const readOnlyContainer = document.createElement('div');
    readOnlyContainer.id = 'readOnlyContainer';

    const sets = setsContainer.querySelectorAll('.set');
    sets.forEach((set, index) => {
      // Extract data from the form
      const setId = index + 1;
      const rounds = set.querySelector('.rounds-input').value;

      // Create a Set div
      const setDiv = document.createElement('div');
      setDiv.classList.add('set');
      const setHeader = document.createElement('h2');
      setHeader.textContent = `Set ${setId}`;
      setDiv.appendChild(setHeader);

      const roundDiv = document.createElement('div');
      roundDiv.classList.add('round');
      roundDiv.textContent = `${rounds} Rounds`;

      const intervals = set.querySelectorAll('.interval');
      intervals.forEach(interval => {
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

        roundDiv.appendChild(intervalDiv);
      });

      setDiv.appendChild(roundDiv);
      readOnlyContainer.appendChild(setDiv);

      // Add rest for the set below the set
      const restDuration = set.querySelector('.rest-input').value;
      const restDiv = document.createElement('div');
      restDiv.classList.add('interval');
      restDiv.style = "--bg-color: #333; --highlight: coral;";
      restDiv.innerHTML = `
        <span class="name">Rest</span>
        <span class="duration">${restDuration} seconds</span>
        `;
      readOnlyContainer.appendChild(restDiv);
    });

    // Append the read-only container to the main container
    setsContainer.parentElement.appendChild(readOnlyContainer);

    // Hide the form and Save button, show Edit button
    setsContainer.style.display = 'none';
    saveBtn.style.display = 'none';
    editBtn.style.display = 'block';
  });

  editBtn.addEventListener('click', () => {
    // Convert back to form mode
    const readOnlyContainer = document.getElementById('readOnlyContainer');
    if (readOnlyContainer) {
      readOnlyContainer.remove();
    }

    // Show the form, Save button, and hide Edit button
    setsContainer.style.display = 'block';
    editBtn.style.display = 'none';
    saveBtn.style.display = 'block';
  });

});
