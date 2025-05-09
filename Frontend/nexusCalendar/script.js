document.addEventListener("DOMContentLoaded", () => {



  const colorThemes = [
    { primary: '#f5f5f0', secondary: '#f0f0f0', text: '#333', bodyBg: '#f5f5f0', name: 'Default' },
    { primary: '#2c3e50', secondary: '#2c3e50', text: 'white', bodyBg: '#000000', name: 'Night Mode' }
  ];
  const fontFamilies = [
  '"Jost", sans-serif',     // Default
  'Arial, sans-serif',
  '"Courier New", monospace',
  '"Times New Roman", serif'
];


// VIEW SWITCHING
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.getAttribute('data-view');
    currentView = view;
    localStorage.setItem('nexusCalendar_view', view);
    setActiveViewButton(btn);

    if (currentView === 'day') {
      renderDayView(currentDay);

    } else if (currentView === 'three-day') {
      renderThreeDayView(currentDay);

    } else {
      renderMonthView();

    }
  });
});

document.getElementById('prev-month').addEventListener('click', () => {
  if (currentView === 'day') {
    const date = new Date(currentYear, currentMonth, currentDay - 1);
    currentYear = date.getFullYear();
    currentMonth = date.getMonth();
    currentDay = date.getDate();
    renderDayView(currentDay);
  } else if (currentView === 'three-day') {
    const date = new Date(currentYear, currentMonth, currentDay - 3);
    currentYear = date.getFullYear();
    currentMonth = date.getMonth();
    currentDay = date.getDate();
    renderThreeDayView(currentDay);
  } else {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    updateMonthDisplay();
    renderMonthView();
  }
});

document.getElementById('next-month').addEventListener('click', () => {
  if (currentView === 'day') {
    const date = new Date(currentYear, currentMonth, currentDay + 1);
    currentYear = date.getFullYear();
    currentMonth = date.getMonth();
    currentDay = date.getDate();
    renderDayView(currentDay);
  } else if (currentView === 'three-day') {
    const date = new Date(currentYear, currentMonth, currentDay + 3);
    currentYear = date.getFullYear();
    currentMonth = date.getMonth();
    currentDay = date.getDate();
    renderThreeDayView(currentDay);
  } else {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    updateMonthDisplay();
    renderMonthView();
    renderEvents();
  }
});


// SETTINGS PANEL TOGGLE
document.getElementById('settings-btn').addEventListener('click', () => {
  const panel = document.getElementById('control-panel');
  panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
});

// THEME TOGGLING
document.getElementById('color-theme').addEventListener('click', () => {
  let current = parseInt(localStorage.getItem('nexusCalendar_theme') || 0);
  current = (current + 1) % colorThemes.length;
  localStorage.setItem('nexusCalendar_theme', current);
  applyTheme(current);
});



// GROUP SETTINGS BUTTON 
document.getElementById('group-settings').addEventListener('click', () => {
  window.location.href = 'group-settings.html';
});


// SETTINGS PAGE BUTTON 
document.getElementById('settings-change').addEventListener('click', () => {
  window.location.href = 'customize.html';
});

// NOTES PANEL TOGGLE
const notesTextarea = document.getElementById('notes-textarea');
const saveStatus = document.getElementById('notes-save-status');

// Load saved notes on page load
notesTextarea.value = localStorage.getItem('nexusNotes') || '';

document.getElementById('notes-tab').addEventListener('click', () => {
  document.getElementById('notes-panel').classList.toggle('open');
});

document.addEventListener('click', (e) => {
  const panel = document.getElementById('notes-panel');
  const tab = document.getElementById('notes-tab');
  if (!panel.contains(e.target) && !tab.contains(e.target)) {
    panel.classList.remove('open');
  }
});


document.getElementById('close-notes').addEventListener('click', () => {
  document.getElementById('notes-panel').classList.remove('open');
});

// Save notes
document.getElementById('save-notes').addEventListener('click', () => {
  const notes = notesTextarea.value;
  localStorage.setItem('nexusNotes', notes);
  saveStatus.textContent = "Saved!";
  setTimeout(() => (saveStatus.textContent = ''), 2000);
});


// Delete note for user only
document.getElementById('delete-note-user').addEventListener('click', () => {
  notesTextarea.value = '';

  localStorage.removeItem('nexusNotes');
});

// Placeholder for delete note for everyone
document.getElementById('delete-note-everyone').addEventListener('click', () => {
  alert("Delete for everyone triggered (placeholder logic).");
});

// EVENT MODAL BUTTONS
document.getElementById('cancel-event').addEventListener('click', () => {
document.getElementById('event-maker').style.display = 'none';
});

document.getElementById('delete-event-btn').addEventListener('click', async (e) => {
  e.preventDefault(); 
  e.stopPropagation(); 

  const userId = localStorage.getItem('nexusUserId');
  const editingId = document.getElementById('event-maker').dataset.editing;


console.log("User ID:", userId);
console.log("Event ID:", editingId);


try {
  const res = await fetch(`http://localhost:3001/events/${userId}/${editingId}`, {
    method: 'DELETE'
  });

  const result = await res.json();
  if (res.ok) {
    document.getElementById('event-maker').style.display = 'none';
    document.getElementById('event-maker').dataset.editing = '';

    if (currentView === 'day')       renderDayView(currentDay);
    else if (currentView === 'three-day') renderThreeDayView(currentDay);
    else renderMonthView();

  } else {
    alert(result.error);
  }
} catch (err) {
  console.error("Delete failed:", err);
  alert("Error deleting event.");
}

});




document.getElementById('event-form').addEventListener('submit', createEvent);




  const monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
  const today = new Date();
  let currentDay = today.getDate();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  const display = document.getElementById('user-id-display');
  const userId = localStorage.getItem('nexusUserId');
  display.textContent = userId || 'Not logged in';

if (!userId) {
  alert("Please log in.");
  window.location.href = "log-in/login.html";
}


  let currentView = localStorage.getItem('nexusCalendar_view') || 'month';

  const viewMonthBtn = document.getElementById('view-month');
  const weekdaysEl = document.querySelector('.weekdays');
  const daysEl = document.querySelector('.days');

function hideEventMaker() {
  document.getElementById('event-maker').style.display = 'none';
  document.getElementById('event-maker').removeAttribute('data-editing');
  }


  function updateMonthDisplay() {
    const header = document.querySelector('h2');
    header.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  }

  function init() {
if (currentView === 'day') {
      renderEventsForDay(currentDay);

    } else if (currentView === 'three-day') {
      renderEventsForThreeDays();

    } else {
      renderEvents();

    }
    applyTheme(parseInt(localStorage.getItem('nexusCalendar_theme') || 0));
    applyFont(parseInt(localStorage.getItem('nexusCalendar_font') || 0));
    updateMonthDisplay();

    const initialViewButton = document.querySelector(`[data-view="${currentView}"]`);
    if (initialViewButton) {
      setActiveViewButton(initialViewButton);
    } else {
      setActiveViewButton(viewMonthBtn);
      currentView = 'month';
      localStorage.setItem('nexusCalendar_view', 'month');
    }
    populateGroupDropdown();
    populateCalendarToggle();


    switch (currentView) {
      case 'day':
        renderDayView(currentDay);
        break;
      case 'three-day':
        renderThreeDayView(currentDay);
        break;
      default:
        renderMonthView();
        renderEvents;
        break;
    }

document.getElementById('calendar-toggle').addEventListener('change', () => {
  const selected = document.getElementById('calendar-toggle').value;
  localStorage.setItem('nexusCalendar_selectedView', selected);

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
});


  }

  init();

function renderThreeDayView(startDay) {
  weekdaysEl.style.display = 'none';
  daysEl.innerHTML = '';
  daysEl.className = 'days three-day-view';
  daysEl.style.display = 'flex';
  daysEl.style.flexDirection = 'row';
  daysEl.style.justifyContent = 'space-between';

  const container = document.createElement('div');
  container.className = 'three-day-container';
  container.style.display = 'flex';
  container.style.width = '100%';

  const baseDate = new Date(currentYear, currentMonth, startDay);

  for (let offset = 0; offset < 3; offset++) {
    const dayDate = new Date(baseDate);
    dayDate.setDate(baseDate.getDate() + offset);

    const dayColumn = document.createElement('div');
    dayColumn.className = 'three-day-column';
    dayColumn.style.flex = '1';
    dayColumn.style.borderLeft = '1px solid #ccc';
    dayColumn.style.padding = '0 5px';

    const label = document.createElement('div');
    label.className = 'three-day-label';
    label.textContent = dayDate.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    label.style.textAlign = 'center';
    label.style.marginBottom = '8px';
    label.style.fontWeight = 'normal';

    const hourSlots = document.createElement('div');
    hourSlots.className = 'hour-slots';

    for (let hour = 0; hour < 24; hour++) {
      const slot = document.createElement('div');
      slot.className = 'hour-slot';

      const hourLabel = document.createElement('div');
      hourLabel.className = 'hour-label';
      hourLabel.textContent = new Date(0, 0, 0, hour).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
      });

      const eventSpace = document.createElement('div');
      eventSpace.className = 'event-space';

      eventSpace.addEventListener('click', (e) => {
        e.stopPropagation();
        const hourStr = hour.toString().padStart(2, '0');
        const isoDate = dayDate.toISOString().split('T')[0];

        document.getElementById('event-date').value = isoDate;
        document.getElementById('event-start').value = `${hourStr}:00`;
        document.getElementById('event-end').value = `${hourStr}:30`;

        const eventMaker = document.getElementById('event-maker');
        eventMaker.style.display = 'block';
        eventMaker.dataset.editing = '';
      });

      slot.appendChild(hourLabel);
      slot.appendChild(eventSpace);
      hourSlots.appendChild(slot);
    }

    dayColumn.appendChild(label);
    dayColumn.appendChild(hourSlots);
    container.appendChild(dayColumn);
  }

  daysEl.appendChild(container);

  renderEventsForThreeDays(startDay);
}


async function renderEventsForThreeDays(startDay) {
const selectedView = localStorage.getItem('nexusCalendar_selectedView') || 'personal';

let allEvents = [];

if (selectedView === 'personal') {
  const res = await fetch(`http://localhost:3001/events?userId=${userId}&month=${currentMonth + 1}&year=${currentYear}`);
  const data = await res.json();
  if (Array.isArray(data.events)) allEvents = data.events;
} else if (selectedView === 'all') {
  // Get personal events
  const personalRes = await fetch(`http://localhost:3001/events?userId=${userId}&month=${currentMonth + 1}&year=${currentYear}`);
  const personalData = await personalRes.json();
  if (Array.isArray(personalData.events)) allEvents = allEvents.concat(personalData.events);

  // Get group events
  const groupRes = await fetch(`http://localhost:3001/users/${userId}/groups`);
  const groupData = await groupRes.json();
  if (Array.isArray(groupData.groups)) {
    for (const group of groupData.groups) {
      const res = await fetch(`http://localhost:3001/groups/${group.groupId}/events?month=${currentMonth + 1}&year=${currentYear}`);
      const groupEventsData = await res.json();
      if (Array.isArray(groupEventsData.events)) {
        allEvents = allEvents.concat(groupEventsData.events);
      }
    }
  }
} else {
  // Specific group
  const res = await fetch(`http://localhost:3001/groups/${selectedView}/events?month=${currentMonth + 1}&year=${currentYear}`);
  const data = await res.json();
  if (Array.isArray(data.events)) allEvents = data.events;
}
  const data = await res.json();
  if (!Array.isArray(data.events)) return;

  const slots = document.querySelectorAll('.three-day-column');
  const baseDate = new Date(currentYear, currentMonth, startDay);

  for (let offset = 0; offset < 3; offset++) {
    const dayDate = new Date(baseDate);
    dayDate.setDate(baseDate.getDate() + offset);
    const selectedDate = dayDate.toISOString().split('T')[0];

    const matchingEvents = data.events.filter(evt => evt.date === selectedDate);

    const hourSlots = slots[offset].querySelectorAll('.event-space');

    matchingEvents.forEach(evt => {
      const startHour = new Date(evt.startTime).getHours();
      const marker = document.createElement('div');
      marker.className = 'event-marker';
      marker.textContent = `${evt.title} (${new Date(evt.startTime).toLocaleTimeString([], {
        hour: 'numeric', minute: '2-digit'
      })})`;
      marker.style.backgroundColor = evt.color || '#444';

      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        openEventEditor(evt);
      });


      const duration = (new Date(evt.endTime) - new Date(evt.startTime)) / (1000 * 60); // in minutes
      marker.style.height = `${(duration / 60) * 10}%`;
      marker.addEventListener('click', () => openEventEditor(evt));

      hourSlots[startHour]?.appendChild(marker);
    });
  }
}


async function createEvent(event) {

  event.preventDefault();

  const title = document.getElementById('event-title').value;
  const date = document.getElementById('event-date').value;
  const start = document.getElementById('event-start').value;
  const end = document.getElementById('event-end').value;
  const color = document.getElementById('event-color').value;

  const userId = localStorage.getItem('nexusUserId');
  const editingId = document.getElementById('event-maker').dataset.editing;

  const eventData = {
    title,
    startTime: `${date}T${start}`,
    endTime: `${date}T${end}`,
    color,
    date,
    creator: userId,
    isEditable: true
  };

  const url = editingId
    ? `http://localhost:3001/events/${userId}/${editingId}`
    : 'http://localhost:3001/events';

  const method = editingId ? 'PUT' : 'POST';
  const body = editingId
    ? JSON.stringify(eventData)
    : JSON.stringify({ userId, event: eventData });

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body
    });

    const data = await res.json();
    if (res.ok) {
      console.log(editingId ? 'Event updated' : 'Event created', data);
      if (!editingId && data.eventId) {
        document.getElementById('event-maker').dataset.editing = data.eventId;
      }
    } else {
      alert(`Error: ${data.error}`);
    }

  } catch (err) {
    console.error('Network error saving event:', err);
    alert('Network error saving event.');
  }

  document.getElementById('event-maker').style.display = 'none';
  document.getElementById('event-maker').dataset.editing = ''; // Clear edit mode
  console.log("Rendering after deletion...");


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
    }}


function renderMonthView() {
  weekdaysEl.style.display = 'grid';

  daysEl.innerHTML = '';
  daysEl.className = 'days';
  daysEl.style.display = 'grid';
  daysEl.style.gridTemplateColumns = 'repeat(7, 1fr)';
  daysEl.style.gridTemplateRows = '';
  daysEl.style.overflowY = 'auto'; // allow scroll if needed

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const dayNum = prevMonthDays - firstDay + i + 1;
    const div = document.createElement('div');
    div.textContent = dayNum;
    div.classList.add('other-month');
    daysEl.appendChild(div);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    const div = document.createElement('div');
    div.textContent = i;
    if (
      i === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    ) {
      div.classList.add('today');
    }
    div.addEventListener('click', () =>
      showEventMaker(new Date(currentYear, currentMonth, i).toISOString())
    );
    daysEl.appendChild(div);
  }

  const totalCells = 42;
  for (let i = 1; i <= totalCells - daysInMonth - firstDay; i++) {
    const div = document.createElement('div');
    div.textContent = i;
    div.classList.add('other-month');
    daysEl.appendChild(div);
  }
  renderEvents(); // Refresh calendar


}



async function renderEvents() {
  const res = await fetch(`http://localhost:3001/events?userId=${userId}&month=${currentMonth + 1}&year=${currentYear}`);
 
  const data = await res.json();
  if (!Array.isArray(data.events)) return;

  document.querySelectorAll('.event-marker').forEach(e => e.remove());
  const dayDivs = document.querySelectorAll('.days div:not(.other-month)');

  dayDivs.forEach(div => {
    const dateNum = parseInt(div.textContent);
    const matchingEvents = data.events.filter(evt => {
      const evtDate = new Date(evt.startTime);
      return evtDate.getDate() === dateNum && evtDate.getMonth() === currentMonth && evtDate.getFullYear() === currentYear;
    });
matchingEvents
  .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  .forEach(evt => {
    const marker = document.createElement('div');
    marker.className = 'event-marker';
    marker.style.backgroundColor = evt.color || '#444';
    marker.textContent = `${evt.title} (${new Date(evt.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })})`;

    marker.addEventListener('click', () => openEventEditor(evt));

    div.appendChild(marker);
  });

  });
}

function renderDayView(day) {
  weekdaysEl.style.display = 'none';
  daysEl.innerHTML = '';
  daysEl.className = 'days day-view';
  daysEl.style.display = 'block';

  const container = document.createElement('div');
  container.className = 'hour-slots';

  const dateLabel = document.createElement('div');
  const dateObj = new Date(currentYear, currentMonth, day);
  dateLabel.textContent = dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });
  dateLabel.style.textAlign = 'center';
  dateLabel.style.margin = '10px 0';
  dateLabel.style.fontWeight = 'normal'; 
  dateLabel.style.fontSize = '1.1rem';

  daysEl.appendChild(dateLabel);

  for (let hour = 0; hour < 24; hour++) {
    const slot = document.createElement('div');
    slot.className = 'hour-slot';
  slot.addEventListener('click', () => {
    const hourStr = hour.toString().padStart(2, '0');
    const date = new Date(currentYear, currentMonth, day);
    const isoDate = date.toISOString().split('T')[0];

    document.getElementById('event-date').value = isoDate;
    document.getElementById('event-start').value = `${hourStr}:00`;
    document.getElementById('event-end').value = `${hourStr}:30`;

    const eventMaker = document.getElementById('event-maker');
    eventMaker.style.display = 'block';
  });


    const label = document.createElement('div');
    label.className = 'hour-label';
    label.textContent = new Date(0, 0, 0, hour).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    const eventSpace = document.createElement('div');
    eventSpace.className = 'event-space';

    slot.appendChild(label);
    slot.appendChild(eventSpace);
    container.appendChild(slot);
  }

  daysEl.appendChild(container);
  renderEventsForDay(day);
}


async function renderEventsForDay(day) {
  const res = await fetch(`http://localhost:3001/events?userId=${userId}&month=${currentMonth + 1}&year=${currentYear}`);
  const data = await res.json();


  if (!Array.isArray(data.events)) return;

  const slots = document.querySelectorAll('.event-space');
  slots.forEach(slot => slot.innerHTML = '');

  const selectedDate = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];

  const dayEvents = data.events.filter(evt => evt.date === selectedDate);

  dayEvents.forEach(evt => {
  const startHour = new Date(evt.startTime).getHours();

  const marker = document.createElement('div');
  marker.className = 'event-marker';
  marker.textContent = `${evt.title} (${new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
  marker.style.backgroundColor = evt.color || '#444';

  if (!evt.id) {
    console.warn("Event missing ID:", evt);
    return;  // skip if no ID
  }

  marker.addEventListener('click', () => openEventEditor(evt));

  const duration = (new Date(evt.endTime) - new Date(evt.startTime)) / (1000 * 60);
  marker.style.height = `${(duration / 60) * 10}%`;

  slots[startHour]?.appendChild(marker);
});

}


function openEventEditor(event) {
  const eventMaker = document.getElementById('event-maker');
  eventMaker.style.display = 'block';

  document.getElementById('event-title').value = event.title;
  document.getElementById('event-date').value = event.date;
  document.getElementById('event-start').value = event.startTime.split('T')[1];
  document.getElementById('event-end').value = event.endTime.split('T')[1];
  document.getElementById('event-color').value = event.color || '#6799b2';

  console.log("Setting dataset.editing to:", event.id);  
  eventMaker.dataset.editing = event.id;
}


// Utility for applying theme and font
function applyTheme(index) {
  const theme = colorThemes[index];
  const customPrimary = localStorage.getItem("nexusCustomPrimary") || "#6799b2";

  document.documentElement.style.setProperty('--primary-color', customPrimary);
  document.documentElement.style.setProperty('--secondary-color', theme.secondary);
  document.documentElement.style.setProperty('--text-color', theme.text);
  document.body.style.backgroundColor = theme.bodyBg;
}

function applyFont(index) {
  if (index > 0) document.body.style.fontFamily = fontFamilies[index];
}

function setActiveViewButton(button) {
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  button.classList.add('active');
}

function showEventMaker(dateString) {
  const eventMaker = document.getElementById('event-maker');
  eventMaker.style.display = 'block';
  const date = new Date(dateString);
  document.getElementById('event-date').value = date.toISOString().split('T')[0];

  if (!eventMaker.dataset.editing) {
    document.getElementById('event-start').value = '';
    document.getElementById('event-end').value = '';
  }
}

async function populateGroupDropdown() {
  const userId = localStorage.getItem('nexusUserId');
  const groupSelect = document.getElementById('event-group');
  if (!groupSelect) return;
  groupSelect.innerHTML = '<option value="">None</option>';

  try {
    const res = await fetch(`http://localhost:3001/users/${userId}/groups`);
    const data = await res.json();

    if (Array.isArray(data.groups)) {
      data.groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group.groupId;
        option.textContent = group.name;
        option.dataset.color = group.color || '#6799b2';
        groupSelect.appendChild(option);
      });
    }
  } catch (err) {
    console.error("Error loading groups:", err);
  }
}

document.getElementById('event-group').addEventListener('change', function () {
  const selected = this.options[this.selectedIndex];
  const color = selected.dataset.color || '#6799b2';
  const name = selected.textContent;
  document.getElementById('event-color').value = color;
  this.dataset.groupName = name;
});

async function createEvent(event) {
  event.preventDefault();

  const title = document.getElementById('event-title').value;
  const date = document.getElementById('event-date').value;
  const start = document.getElementById('event-start').value;
  const end = document.getElementById('event-end').value;
  const color = document.getElementById('event-color').value;
  const userId = localStorage.getItem('nexusUserId');
  const editingId = document.getElementById('event-maker').dataset.editing;

  const groupDropdown = document.getElementById('event-group');
const selectedOption = groupDropdown.options[groupDropdown.selectedIndex];
const selectedGroupId = selectedOption.value || null;
const selectedGroupName = selectedOption.textContent || '';
const selectedGroupColor = selectedOption.dataset.color || '#6799b2';
  const creatorName = localStorage.getItem('nexusName') || '';

  const eventData = {
    title,
    startTime: `${date}T${start}`,
    endTime: `${date}T${end}`,
    color: selectedGroupId ? selectedGroupColor : color,
    date,
    creator: userId,
    creatorName: creatorName || '',
    isEditable: true,
    groupId: selectedGroupId,
    groupName: selectedGroupId ? selectedGroupName : ''
};

  const url = editingId
    ? `http://localhost:3001/events/${userId}/${editingId}`
    : 'http://localhost:3001/events';

  const method = editingId ? 'PUT' : 'POST';
  const body = editingId
    ? JSON.stringify(eventData)
    : JSON.stringify({ userId, event: eventData });

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body
    });

    const data = await res.json();
    if (res.ok) {
      if (!editingId && data.eventId) {
        document.getElementById('event-maker').dataset.editing = data.eventId;
      }
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (err) {
    console.error('Network error saving event:', err);
    alert('Network error saving event.');
  }

  document.getElementById('event-maker').style.display = 'none';
  document.getElementById('event-maker').dataset.editing = '';
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

async function fetchUserGroups(userId) {
  const res = await fetch(`http://localhost:3001/users/${userId}/groups`);
  const data = await res.json();
  if (res.ok && Array.isArray(data.groups)) {
    localStorage.setItem('nexusGroupList', JSON.stringify(data.groups));
    return data.groups;
  } else {
    console.error("Error fetching groups:", data.error);
    return [];
  }
}

async function populateCalendarToggle() {
  const userId = localStorage.getItem('nexusUserId');
  const toggle = document.getElementById('calendar-toggle');
  if (!toggle) return;

  toggle.innerHTML = '<option value="personal">My Calendar</option>'; // Reset

  try {
    const res = await fetch(`http://localhost:3001/users/${userId}/groups`);
    const data = await res.json();
    if (Array.isArray(data.groups)) {
      data.groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group.groupId;
        option.textContent = group.name;
        toggle.appendChild(option);
      });
    }

    // Always include "All Calendars"
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All Calendars';
    toggle.appendChild(allOption);
  } catch (err) {
    console.error("Error loading groups for toggle:", err);
  }
}


});


