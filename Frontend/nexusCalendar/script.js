// DOM Elements
const settingsBtn = document.getElementById('settings-btn');
const controlPanel = document.getElementById('control-panel');
const colorThemeBtn = document.getElementById('color-theme');
const fontChangeBtn = document.getElementById('font-change');
const viewMonthBtn = document.getElementById('view-month');
const viewDayBtn = document.getElementById('view-day');
const viewThreeDayBtn = document.getElementById('view-three-day');
const calendarEl = document.querySelector('.calendar');
const daysEl = document.querySelector('.days');
const weekdaysEl = document.querySelector('.weekdays');

// Color themes
const colorThemes = [
  { primary: '#f5f5f0', secondary: '#f0f0f0', text: '#333', bodyBg: '#f5f5f0', name: 'Default' },
  { primary: '#e74c3c', secondary: '#f9e7e7', text: '#444', bodyBg: '#f5f5f0', name: 'Red' },
  { primary: '#2ecc71', secondary: '#e8f5e8', text: '#333', bodyBg: '#f5f5f0', name: 'Green' },
  { primary: '#9b59b6', secondary: '#f4e8f9', text: '#444', bodyBg: '#f5f5f0', name: 'Purple' },
  { primary: '#f39c12', secondary: '#fef5e7', text: '#333', bodyBg: '#f5f5f0', name: 'Orange' },
  { primary: '#2c3e50', secondary: '#2c3e50', text: '#ffffff', bodyBg: '#000000', name: 'Night Mode' }
];

// Font families
const fontFamilies = [
  '"Jost", sans-serif',
  'Arial, sans-serif',
  'Courier New, monospace',
  'Times New Roman, serif',
];

// Current state - load from localStorage if available
let currentTheme = parseInt(localStorage.getItem('nexusCalendar_theme') || 0);
let currentFont = parseInt(localStorage.getItem('nexusCalendar_font') || 0);
let currentView = localStorage.getItem('nexusCalendar_view') || 'month';

// Get current date information
const today = new Date();
let currentDay = today.getDate();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();

// Month names for display
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Check login status
if (!localStorage.getItem('nexusCalendar_user')) {
  window.location.href = '/log%20in/login.html';
} else {
  init();
}

function init() {
  // Apply saved theme

  // Update night mode button text based on current theme
  if (colorThemeBtn) {
    colorThemeBtn.textContent = currentTheme === 5 ? 'Light Mode' : 'Night Mode';
  }

  // Apply saved font
  if (currentFont > 0) {
    document.body.style.fontFamily = fontFamilies[currentFont];
  }

  // Update month header
  updateMonthDisplay();


  const initialViewButton = document.querySelector(`[data-view="${currentView}"]`);
  if (initialViewButton) {
      setActiveViewButton(initialViewButton);
  } else {
      setActiveViewButton(viewMonthBtn);
      currentView = 'month';
      localStorage.setItem('nexusCalendar_view', 'month');
  }

  setActiveViewButton(document.querySelector(`[data-view="${currentView}"]`));
  switch (currentView) {
      case 'day':
          renderDayView(currentDay);
          break;
      case 'three-day':
          renderThreeDayView(currentDay);
          break;
      default:
          renderMonthView();
          break;
  }


}

// Function to apply theme
function applyTheme(themeIndex) {
  const theme = colorThemes[themeIndex];
  document.documentElement.style.setProperty('--primary-color', theme.primary);
  document.documentElement.style.setProperty('--secondary-color', theme.secondary);
  document.documentElement.style.setProperty('--text-color', theme.text);
  document.body.style.backgroundColor = theme.bodyBg;

  // Update weekdays background
  if (weekdaysEl) {
    weekdaysEl.style.backgroundColor = theme.primary;
  }

  // Handle night mode specific changes
  const settingsIcon = document.querySelector('.settings-icon');
  if (settingsIcon) {
    if (themeIndex === 5) { // Night Mode
      settingsIcon.src = 'settingsWHT.png';
      document.documentElement.classList.add('night-mode');
    } else {
      settingsIcon.src = 'settingsBCK.png';
      document.documentElement.classList.remove('night-mode');
    }
  }
}


// Function to toggle settings dropdown
function toggleSettings(event) {
  event.stopPropagation();
  controlPanel.classList.toggle('show');
}

// Open customization page
function openCustomizePage() {
  window.location.href = 'customize.html';
}

// Month Navigation
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

function navigateMonth(direction) {
  if (direction === 'prev') {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
  } else {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }
  updateMonthDisplay();
  renderMonthView();
}

// Event Listeners
if (settingsBtn) {
  settingsBtn.addEventListener('click', toggleSettings);
}

if (prevMonthBtn) {
  prevMonthBtn.addEventListener('click', () => navigateMonth('prev'));
}

if (nextMonthBtn) {
  nextMonthBtn.addEventListener('click', () => navigateMonth('next'));
}

if (colorThemeBtn) {
  colorThemeBtn.addEventListener('click', () => {
    // Toggle between default (0) and night mode (5)
    currentTheme = currentTheme === 5 ? 0 : 5;
    applyTheme(currentTheme);
    localStorage.setItem('nexusCalendar_theme', currentTheme);
    // Update button text based on current theme
    colorThemeBtn.textContent = currentTheme === 5 ? 'Light Mode' : 'Night Mode';
  });
}

if (fontChangeBtn) {
  fontChangeBtn.addEventListener('click', openCustomizePage);
}

if (viewMonthBtn) {
  viewMonthBtn.addEventListener('click', () => changeView('month'));
}

if (viewDayBtn) {
  viewDayBtn.addEventListener('click', () => changeView('day'));
}

if (viewThreeDayBtn) {
  viewThreeDayBtn.addEventListener('click', () => changeView('three-day'));
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
  if (!controlPanel.contains(event.target) && !settingsBtn.contains(event.target)) {
    controlPanel.classList.remove('show');
  }
});

// Notes functionality
const notesTab = document.getElementById('notes-tab');
const notesPanel = document.getElementById('notes-panel');
const closeNotes = document.getElementById('close-notes');
const notesTextarea = document.getElementById('notes-textarea');
const saveNotesBtn = document.getElementById('save-notes');
const notesAttribution = document.getElementById('notes-attribution');
const notesInfo = document.querySelector('.notes-info');
const deleteNoteUser = document.getElementById('delete-note-user');
const deleteNoteEveryone = document.getElementById('delete-note-everyone');

// Load saved notes and metadata from localStorage
if (notesTextarea) {
  const savedNotes = localStorage.getItem('nexusCalendar_notes') || '';
  const noteMetadata = JSON.parse(localStorage.getItem('nexusCalendar_noteMetadata') || '{}');

  notesTextarea.value = savedNotes;

  // Display attribution if notes exist
  if (savedNotes.trim() !== '' && noteMetadata.user) {
    notesAttribution.style.display = 'flex';
    notesInfo.textContent = `Note by: ${noteMetadata.user} • ${noteMetadata.time}`;
  }
}

// Open notes panel
if (notesTab) {
  notesTab.addEventListener('click', () => {
    notesPanel.classList.add('open');
  });
}

// Close notes panel
if (closeNotes) {
  closeNotes.addEventListener('click', () => {
    notesPanel.classList.remove('open');
  });
}

// Save notes to localStorage with metadata
if (saveNotesBtn) {
  saveNotesBtn.addEventListener('click', () => {
    const noteText = notesTextarea.value;
    localStorage.setItem('nexusCalendar_notes', noteText);

    // Only create metadata if there's text
    if (noteText.trim() !== '') {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
                        ' on ' + now.toLocaleDateString();

      const metadata = {
        user: 'User', // This would be replaced with the actual username in the future
        time: timeString,
        timestamp: now.getTime()
      };

      localStorage.setItem('nexusCalendar_noteMetadata', JSON.stringify(metadata));

      // Display attribution
      notesAttribution.style.display = 'flex';
      notesInfo.textContent = `Note by: ${metadata.user} • ${metadata.time}`;
    }

    alert('Notes saved!');
  });
}

// Delete note handlers
if (deleteNoteUser) {
  deleteNoteUser.addEventListener('click', () => {
    if (confirm('Delete this note for you?')) {
      localStorage.removeItem('nexusCalendar_notes');
      localStorage.removeItem('nexusCalendar_noteMetadata');
      notesTextarea.value = '';
      notesAttribution.style.display = 'none';
    }
  });
}

if (deleteNoteEveryone) {
  deleteNoteEveryone.addEventListener('click', () => {
    if (confirm('Delete this note for everyone?')) {
      localStorage.removeItem('nexusCalendar_notes');
      localStorage.removeItem('nexusCalendar_noteMetadata');
      notesTextarea.value = '';
      notesAttribution.style.display = 'none';
    }
  });
}

// Function to change the color theme
function changeColorTheme() {
  currentTheme = (currentTheme + 1) % colorThemes.length;
  const theme = colorThemes[currentTheme];

  document.documentElement.style.setProperty('--primary-color', theme.primary);
  document.documentElement.style.setProperty('--secondary-color', theme.secondary);
  document.documentElement.style.setProperty('--text-color', theme.text);
  document.body.style.backgroundColor = theme.bodyBg; // added line for body background

  // Update styles
  weekdaysEl.style.backgroundColor = theme.primary;
  document.querySelectorAll('.control-btn').forEach(btn => {
    if (!btn.classList.contains('active')) {
      btn.style.backgroundColor = theme.primary;
    }
  });
}

// Function to change the font family
function changeFontFamily() {
  currentFont = (currentFont + 1) % fontFamilies.length;
  document.body.style.fontFamily = fontFamilies[currentFont];
}

// Function to change the view
function changeView(view) {
  currentView = view;

  // Save to localStorage
  localStorage.setItem('nexusCalendar_view', view);

  // Add active class to the selected view button
  const viewBtns = {
    'month': viewMonthBtn,
    'day': viewDayBtn,
    'three-day': viewThreeDayBtn
  };

  if (viewBtns[view]) {
    setActiveViewButton(viewBtns[view]);
  }

  // Update the header based on the new view
  updateMonthDisplay();

  // Render the selected view
  switch(view) {
    case 'month':
      renderMonthView();
      break;
    case 'day':
      renderDayView(currentDay);
      break;
    case 'three-day':
      renderThreeDayView(currentDay);
      break;
  }
}

// Set active view button
function setActiveViewButton(button) {
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  if (button) {
    button.classList.add('active');
  }
}

// Function to update header display based on current view
function updateMonthDisplay() {
  const monthHeader = document.querySelector('header h2');
  if (monthHeader) {
    if (currentView === 'month') {
      monthHeader.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    } else if (currentView === 'day') {
      monthHeader.textContent = `${monthNames[currentMonth]} ${currentDay}, ${currentYear}`;
    } else if (currentView === 'three-day') {
      monthHeader.textContent = `${monthNames[currentMonth]} ${currentDay}-${currentDay+2}, ${currentYear}`;
    }
  }
}

// Render month view
function renderMonthView() {
  // Show weekdays for month view
  weekdaysEl.style.display = 'grid';
  daysEl.innerHTML = '';
  daysEl.style.gridTemplateColumns = 'repeat(7, 1fr)'; // Reset to 7 columns

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  // Get days from previous month
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  // Add days from previous month
  for (let i = 0; i < firstDay; i++) {
    const dayNum = prevMonthDays - firstDay + i + 1;
    const dayDiv = document.createElement('div');
    dayDiv.textContent = dayNum;
    dayDiv.classList.add('other-month');
    daysEl.appendChild(dayDiv);
  }

  // Add days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    const dayDiv = document.createElement('div');
    dayDiv.textContent = i;

    // Highlight today
    if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
      dayDiv.classList.add('today');
    }

    dayDiv.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.target === dayDiv) {
        const date = new Date(currentYear, currentMonth, i);
        showEventMaker(date.toISOString());
      }
    });

    daysEl.appendChild(dayDiv);
  }

  // Calculate how many days from next month to add
  const totalCells = 42; // 6 rows × 7 days
  const nextMonthDays = totalCells - daysInMonth - firstDay;

  // Add days from next month
  for (let i = 1; i <= nextMonthDays; i++) {
    const dayDiv = document.createElement('div');
    dayDiv.textContent = i;
    dayDiv.classList.add('other-month');
    daysEl.appendChild(dayDiv);
  }

  renderEvents();
}

// Render day view
function renderDayView(day) {
  if (!daysEl) return;

  weekdaysEl.style.display = 'none';
  daysEl.innerHTML = '';
  daysEl.style.gridTemplateColumns = '1fr'; // Full width

  const dayDiv = document.createElement('div');
  dayDiv.classList.add('day-view');
  dayDiv.innerHTML = `
    <h3>${monthNames[currentMonth]} ${day}, ${currentYear}</h3>
    <div class="hour-slots">
      ${generateHourSlots()}
    </div>
  `;
  daysEl.appendChild(dayDiv);
}

// Render three-day view
function renderThreeDayView(startDay) {
  if (!daysEl) return;

  weekdaysEl.style.display = 'none';
  daysEl.innerHTML = '';
  daysEl.style.gridTemplateColumns = '1fr'; // Full width for the container

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Calculate the three days (current and next two)
  let currentDayToShow = startDay;
  let nextDay = startDay + 1;
  let thirdDay = startDay + 2;

  // Handle month boundaries
  if (nextDay > daysInMonth) {
    nextDay = 1;
    // If crossing to next month
    if (currentMonth === 11) {
      // December to January
      nextDay = 1;
    }
  }

  if (thirdDay > daysInMonth) {
    thirdDay = thirdDay - daysInMonth;
    // If crossing to next month
    if (currentMonth === 11) {
      // December to January
      thirdDay = thirdDay - daysInMonth;
    }
  }

  const threeDayDiv = document.createElement('div');
  threeDayDiv.classList.add('three-day-view');

  // Create container for the three days
  const daysContainer = document.createElement('div');
  daysContainer.classList.add('three-days-container');

  // Add each day
  [currentDayToShow, nextDay, thirdDay].forEach(day => {
    const dayColumn = document.createElement('div');
    dayColumn.classList.add('day-column');
    dayColumn.innerHTML = `
      <h3>${monthNames[currentMonth]} ${day}</h3>
      <div class="hour-slots">
        ${generateHourSlots(true)}
      </div>
    `;
    daysContainer.appendChild(dayColumn);
  });

  threeDayDiv.appendChild(daysContainer);
  daysEl.appendChild(threeDayDiv);
}

// Generate hour slots for day views
// Event handling
const eventMaker = document.getElementById('event-maker');
const eventForm = document.getElementById('event-form');
const cancelEventBtn = document.getElementById('cancel-event');
let selectedDate = null;

function showEventMaker(date) {
  selectedDate = date;
  eventMaker.style.display = 'block';
  const dateObj = new Date(date);
  document.getElementById('event-date').value = dateObj.toISOString().split('T')[0];
  document.getElementById('event-start').value = '09:00';
  document.getElementById('event-end').value = '10:00';
}

function hideEventMaker() {
  eventMaker.style.display = 'none';
  eventForm.reset();
  selectedDate = null;
}

function createEvent(event) {
  event.preventDefault();
  const title = document.getElementById('event-title').value;
  const date = document.getElementById('event-date').value;
  const start = document.getElementById('event-start').value;
  const end = document.getElementById('event-end').value;
  const color = document.getElementById('event-color').value;
  const creator = localStorage.getItem('nexusCalendar_user') || 'Anonymous';

  const eventData = {
    title,
    start,
    end,
    color,
    date,
    creator,
    createdAt: new Date().toISOString(),
    isEditable: true
  };

  const eventDateObj = new Date(eventData.date);
  const eventYear = eventDateObj.getFullYear();
  const eventMonth = eventDateObj.getMonth();

  // Store event in month-specific storage
  const storageKey = `nexusCalendar_events_${eventYear}_${eventMonth}`;
  const events = JSON.parse(localStorage.getItem(storageKey) || '[]');
  events.push(eventData);
  localStorage.setItem(storageKey, JSON.stringify(events));

  hideEventMaker();
  renderEvents();
}

function renderEvents() {
  // Get events from current, previous and next month
  const currentEvents = JSON.parse(localStorage.getItem(`nexusCalendar_events_${currentYear}_${currentMonth}`) || '[]');
  const prevEvents = currentMonth === 0 
    ? JSON.parse(localStorage.getItem(`nexusCalendar_events_${currentYear-1}_11`) || '[]')
    : JSON.parse(localStorage.getItem(`nexusCalendar_events_${currentYear}_${currentMonth-1}`) || '[]');
  const nextEvents = currentMonth === 11
    ? JSON.parse(localStorage.getItem(`nexusCalendar_events_${currentYear+1}_0`) || '[]')
    : JSON.parse(localStorage.getItem(`nexusCalendar_events_${currentYear}_${currentMonth+1}`) || '[]');
  
  const events = [...currentEvents, ...prevEvents, ...nextEvents];
  const dayDivs = document.querySelectorAll('.days div');

  document.querySelectorAll('.event-marker').forEach(marker => marker.remove());

  dayDivs.forEach(div => {
    if (div.classList.contains('other-month')) return;
    const currentDate = new Date(currentYear, currentMonth, parseInt(div.textContent));
    const dayEvents = events.filter(event => {
      const evtDate = new Date(event.date + 'T00:00:00'); // Force local midnight
      return evtDate.toLocaleDateString() === currentDate.toLocaleDateString();
    });


    if (dayEvents.length > 0) {
      dayEvents.forEach(event => {
        const marker = document.createElement('div');
        marker.className = 'event-marker';
        marker.style.backgroundColor = event.color;
        marker.textContent = `${event.title} (${event.start})`;
        marker.setAttribute('data-details', 
          `Created by: ${event.creator}\nTime: ${event.start}-${event.end}\nDetails: ${event.title}`);
        if(event.isEditable) {
          marker.onclick = (e) => {
            e.stopPropagation();
            eventMaker.style.display = 'block';
            document.getElementById('event-title').value = event.title;
            document.getElementById('event-date').value = event.date;
            document.getElementById('event-start').value = event.start;
            document.getElementById('event-end').value = event.end;
            document.getElementById('event-color').value = event.color;
            
            const eventActions = document.querySelector('.event-actions');
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'delete-event';
            deleteBtn.textContent = 'Delete';
            
            // Remove any existing delete button
            const existingDelete = eventActions.querySelector('.delete-event');
            if (existingDelete) {
              existingDelete.remove();
            }
            
            eventActions.insertBefore(deleteBtn, eventActions.firstChild);
            
            deleteBtn.onclick = () => {
              const storageKey = `nexusCalendar_events_${currentYear}_${currentMonth}`;
              const events = JSON.parse(localStorage.getItem(storageKey) || '[]');
              const updatedEvents = events.filter(evt => evt.createdAt !== event.createdAt);

              localStorage.setItem(storageKey, JSON.stringify(updatedEvents));
              hideEventMaker();
              renderEvents();
            };
          };
        }
        div.appendChild(marker);
      });

      div.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target === div) {
          showEventMaker(currentDate.toISOString());
        }
      });
    }
  });
}

function generateHourSlots(isCompact = false) {
  let slots = '';
  for (let i = 8; i <= 20; i++) {
    const hour = i > 12 ? i - 12 : i;
    const ampm = i >= 12 ? 'PM' : 'AM';
    slots += `<div class="hour-slot ${isCompact ? 'compact' : ''}">
                <div class="hour-label">${hour} ${ampm}</div>
                <div class="event-space"></div>
              </div>`;
  }
  return slots;
}

// Event listeners
cancelEventBtn.addEventListener('click', hideEventMaker);
eventForm.addEventListener('submit', createEvent);
