document.addEventListener("DOMContentLoaded", () => {


// VIEW SWITCHING
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.getAttribute('data-view');
    currentView = view;
    localStorage.setItem('nexusCalendar_view', view);
    setActiveViewButton(btn);

    if (view === 'day') {
      renderDayView(currentDay);
    } else if (view === 'three-day') {
      renderThreeDayView(currentDay);
    } else {
      renderMonthView();
    }
  });
});

// MONTH NAVIGATION
document.getElementById('prev-month').addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  updateMonthDisplay();
  renderMonthView();
});

document.getElementById('next-month').addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  updateMonthDisplay();
  renderMonthView();
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

// FONT SWITCHING
const fontFamilies = ['"Jost", sans-serif', '"Comfortaa", sans-serif', '"Sora", sans-serif'];
document.getElementById('font-change').addEventListener('click', () => {
  let current = parseInt(localStorage.getItem('nexusCalendar_font') || 0);
  current = (current + 1) % fontFamilies.length;
  localStorage.setItem('nexusCalendar_font', current);
  applyFont(current);
});

// GROUP SETTINGS BUTTON (you can link this to a real settings page or modal later)
document.getElementById('group-settings').addEventListener('click', () => {
  window.location.href = 'group-settings.html';
});

// NOTES PANEL TOGGLE
document.getElementById('notes-tab').addEventListener('click', () => {
  document.getElementById('notes-panel').style.display = 'block';
});
document.getElementById('close-notes').addEventListener('click', () => {
  document.getElementById('notes-panel').style.display = 'none';
});

// EVENT MODAL BUTTONS
document.getElementById('cancel-event').addEventListener('click', () => {
document.getElementById('event-maker').style.display = 'none';
});

document.getElementById('delete-event-btn').addEventListener('click', async () => {
  const eventId = document.getElementById('event-maker').dataset.editing;
  const userId = localStorage.getItem('nexusUserId');

  if (!eventId || !userId) {
    alert("Missing event ID or user ID.");
    return;
  }

  const confirmDelete = confirm("Are you sure you want to delete this event?");
  if (!confirmDelete) return;

  try {
    const res = await fetch(`http://localhost:3001/events/${userId}/${eventId}`, {
      method: 'DELETE'
    });

    const result = await res.json();
    if (res.ok) {
      alert(result.message);
      document.getElementById('event-maker').style.display = 'none';
      document.getElementById('event-maker').dataset.editing = ''; // Clear edit mode

      // Properly re-render based on current view
      if (currentView === 'day') {
        renderDayView(currentDay);
      } else if (currentView === 'three-day') {
        renderThreeDayView(currentDay);
      } else {
        renderMonthView();
      }
    } else {
      alert(result.error);
    }
  } catch (err) {
    console.error("Delete failed:", err);
    alert("Error deleting event.");
  }
});



document.getElementById('event-form').addEventListener('submit', createEvent);

// NOTES SAVE
document.getElementById('save-notes').addEventListener('click', () => {
  const notes = document.getElementById('notes-textarea').value;
  localStorage.setItem('nexusNotes', notes);
  document.getElementById('notes-save-status').textContent = "Saved!";
  setTimeout(() => document.getElementById('notes-save-status').textContent = '', 2000);
});

// DELETE NOTES (placeholders – add real logic later)
document.getElementById('delete-note-user').addEventListener('click', () => {
  document.getElementById('notes-textarea').value = '';
});
document.getElementById('delete-note-everyone').addEventListener('click', () => {
  alert("Delete for everyone triggered.");
});


  const colorThemes = [
    { primary: '#f5f5f0', secondary: '#f0f0f0', text: '#333', bodyBg: '#f5f5f0', name: 'Default' },
    { primary: '#e74c3c', secondary: '#f9e7e7', text: '#444', bodyBg: '#f5f5f0', name: 'Red' },
    { primary: '#2ecc71', secondary: '#e8f5e8', text: '#333', bodyBg: '#f5f5f0', name: 'Green' },
    { primary: '#9b59b6', secondary: '#f4e8f9', text: '#444', bodyBg: '#f5f5f0', name: 'Purple' },
    { primary: '#f39c12', secondary: '#fef5e7', text: '#333', bodyBg: '#f5f5f0', name: 'Orange' },
    { primary: '#2c3e50', secondary: '#2c3e50', text: '#ffffff', bodyBg: '#000000', name: 'Night Mode' }
  ];


  const monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
  const today = new Date();
  let currentDay = today.getDate();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

 const display = document.getElementById('user-id-display');
  const userId = localStorage.getItem('nexusUserId');
  display.textContent = userId || 'Not logged in';

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

  init();


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
    } else {
      alert(`Error: ${data.error}`);
    }
  } catch (err) {
    console.error('Network error saving event:', err);
    alert('Network error saving event.');
  }

  document.getElementById('event-maker').style.display = 'none';
  document.getElementById('event-maker').dataset.editing = ''; // Clear edit mode
  renderEvents(); // Refresh calendar
}


document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.getAttribute('data-view');
    currentView = view;
    localStorage.setItem('nexusCalendar_view', view);
    setActiveViewButton(btn);

    if (view === 'day') {
      renderDayView(currentDay);
    } else if (view === 'three-day') {
      renderThreeDayView(currentDay);
    } else {
      renderMonthView();
    }
  });
});




function renderMonthView() {
  weekdaysEl.style.display = 'grid';
  daysEl.innerHTML = '';
  daysEl.style.gridTemplateColumns = 'repeat(7, 1fr)';

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
    if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
      div.classList.add('today');
    }
    div.addEventListener('click', () => showEventMaker(new Date(currentYear, currentMonth, i).toISOString()));
    daysEl.appendChild(div);
  }


  const totalCells = 42;
  for (let i = 1; i <= totalCells - daysInMonth - firstDay; i++) {
    const div = document.createElement('div');
    div.textContent = i;
    div.classList.add('other-month');
    daysEl.appendChild(div);
  }

  renderEvents();
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

    matchingEvents.forEach(evt => {
      const marker = document.createElement('div');
      marker.className = 'event-marker';
      marker.style.backgroundColor = evt.color || '#444';
      marker.textContent = `${evt.title} (${new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
  
      marker.addEventListener('click', () => openEventEditor(evt));

      div.appendChild(marker);
});
  });
}
function openEventEditor(event) {
  const eventMaker = document.getElementById('event-maker');
  eventMaker.style.display = 'block';

  // Populate the form fields with the event data
  document.getElementById('event-title').value = event.title;
  document.getElementById('event-date').value = event.date;
  document.getElementById('event-start').value = event.startTime.split('T')[1];
  document.getElementById('event-end').value = event.endTime.split('T')[1];
  document.getElementById('event-color').value = event.color || '#6799b2';

  // Save the event ID for later (deletion)
  eventMaker.dataset.editing = event.id;
}

// Utility for applying theme and font
function applyTheme(index) {
  const t = colorThemes[index];
  document.documentElement.style.setProperty('--primary-color', t.primary);
  document.documentElement.style.setProperty('--secondary-color', t.secondary);
  document.documentElement.style.setProperty('--text-color', t.text);
  document.body.style.backgroundColor = t.bodyBg;
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
  document.getElementById('event-start').value = '09:00';
  document.getElementById('event-end').value = '10:00';
}
});
