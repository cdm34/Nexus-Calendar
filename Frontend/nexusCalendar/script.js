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

// Initialize calendar
init();

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

// Event Listeners
if (settingsBtn) {
  settingsBtn.addEventListener('click', toggleSettings);
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
    
    dayDiv.addEventListener('click', () => {
      currentDay = i;
      changeView('day');
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
}

// Render day view
function renderDayView(day) {
  if (!daysEl) return;
  
  weekdaysEl.style.display = 'none';
  daysEl.innerHTML = '';
  
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

  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Calculate the three days (current and next two)
  let currentDayToShow = startDay;
  let nextDay = startDay + 1;
  let thirdDay = startDay + 2;

  // Handle month boundaries
  if (nextDay > daysInMonth) nextDay = 1;
  if (thirdDay > daysInMonth) thirdDay = thirdDay - daysInMonth;

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
