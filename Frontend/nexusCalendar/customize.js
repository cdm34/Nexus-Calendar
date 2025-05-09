
// DOM Elements
const backBtn = document.getElementById('back-btn');
const colorOptions = document.querySelectorAll('.color-option');
const fontOptions = document.querySelectorAll('.font-option');
const viewOptions = document.querySelectorAll('.view-option');

// Color themes
const colorThemes = [
  { primary: '#f5f5f0', secondary: '#f0f0f0', text: '#333', bodyBg: '#f5f5f0', name: 'Default' },
  { primary: '#e74c3c', secondary: '#f9e7e7', text: '#444', bodyBg: '#f5f5f0', name: 'Red' },
  { primary: '#2ecc71', secondary: '#e8f5e8', text: '#333', bodyBg: '#f5f5f0', name: 'Green' },
  { primary: '#9b59b6', secondary: '#f4e8f9', text: '#444', bodyBg: '#f5f5f0', name: 'Purple' },
  { primary: '#f39c12', secondary: '#fef5e7', text: '#333', bodyBg: '#f5f5f0', name: 'Orange' },
  { primary: '#2c3e50', secondary: '#2c3e50', text: '#ffffff', bodyBg: '#000000', name: 'Night Mode' }
];

const fontFamilies = [
  '"Jost", sans-serif',
  'Arial, sans-serif',
  'Courier New, monospace',
  'Times New Roman, serif',
];

// Load current settings from localStorage
let currentTheme = parseInt(localStorage.getItem('nexusCalendar_theme') || 0);
let currentFont = parseInt(localStorage.getItem('nexusCalendar_font') || 0);
let currentView = localStorage.getItem('nexusCalendar_view') || 'month';

// Initialize the page
function initCustomizePage() {
  applyTheme(currentTheme);
  document.body.style.fontFamily = fontFamilies[currentFont];
  updateSelectedOptions();
}

// Function to update selected options
function updateSelectedOptions() {
  // Update color options
  colorOptions.forEach(option => {
    const themeIndex = parseInt(option.dataset.theme);
    if (themeIndex === currentTheme) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });

  // Update font options
  fontOptions.forEach(option => {
    const fontIndex = parseInt(option.dataset.font);
    if (fontIndex === currentFont) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });

  // Update view options
  viewOptions.forEach(option => {
    const view = option.dataset.view;
    if (view === currentView) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });
}

// Function to apply theme
function applyTheme(themeIndex) {
  const theme = colorThemes[themeIndex];
  document.documentElement.style.setProperty('--primary-color', theme.primary);
  document.documentElement.style.setProperty('--secondary-color', theme.secondary);
  document.documentElement.style.setProperty('--text-color', theme.text);
  document.body.style.backgroundColor = theme.bodyBg;
  
  // Update theme option highlighting
  colorOptions.forEach(option => {
    const optionThemeIndex = parseInt(option.dataset.theme);
    if (optionThemeIndex === themeIndex) {
      option.classList.add('selected');
    } else {
      option.classList.remove('selected');
    }
  });
}

function setTheme(themeIndex) {
  currentTheme = themeIndex;
  applyTheme(themeIndex);
  
  // Save to localStorage
  localStorage.setItem('nexusCalendar_theme', themeIndex);
}

function setFont(fontIndex) {
  currentFont = fontIndex;
  document.body.style.fontFamily = fontFamilies[fontIndex];
  
  // Save to localStorage
  localStorage.setItem('nexusCalendar_font', fontIndex);
}

function setView(view) {
  currentView = view;
  
  // Save to localStorage
  localStorage.setItem('nexusCalendar_view', view);
}

// Initialize the page on load
initCustomizePage();

// Event Listeners
if (backBtn) {
  backBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
}

colorOptions.forEach(option => {
  option.addEventListener('click', () => {
    const themeIndex = parseInt(option.dataset.theme);
    setTheme(themeIndex);
    updateSelectedOptions();
  });
});

fontOptions.forEach(option => {
  option.addEventListener('click', () => {
    const fontIndex = parseInt(option.dataset.font);
    setFont(fontIndex);
    updateSelectedOptions();
  });
});

viewOptions.forEach(option => {
  option.addEventListener('click', () => {
    const view = option.dataset.view;
    setView(view);
    updateSelectedOptions();
  });
});

// Google Account Authorization
function authorizeGoogle() {
  window.location.href = 'http://localhost:3001/';
}

async function loadGoogleEvents() {
  const userId = localStorage.getItem('nexusUserId');
  if (!userId) {
    alert("Please log in to Nexus Calendar first.");
    window.location.href = './log in/login.html';
    return;
  }

  try {
    const response = await fetch(`http://localhost:3001/sync-events?userId=${userId}`);
    if (response.ok) {
      alert("Google events synced! Loading...");
    } else {
      const data = await response.json();
      alert(data.message || "Failed to sync events");
    }
  } catch (err) {
    console.error("Error syncing events:", err);
    alert("Something went wrong.");
  }
}

// Button Event Listeners
const linkGoogleBtn = document.getElementById('link-google-btn');
const pullGoogleBtn = document.getElementById('pull-google-btn');

if (linkGoogleBtn) {
  linkGoogleBtn.addEventListener('click', authorizeGoogle);
}

if (pullGoogleBtn) {
  pullGoogleBtn.addEventListener('click', loadGoogleEvents);
}

const importBtn = document.getElementById('import-btn');
const importInput = document.getElementById('import-ics');

if (importBtn && importInput) {
  importBtn.addEventListener('click', async () => {
    const file = importInput.files[0];
    const nexusUserId = localStorage.getItem('nexusUserId');

    if (!file || !nexusUserId) {
      alert('Missing file or not logged in');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('nexusUserId', nexusUserId);

    try {
      const response = await fetch('http://localhost:4001/import-ics', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log(result); // <--- add this

      if (response.ok) {
        alert(result.message);
      } else {
        alert(result.error || 'Import failed.');
      }
    } catch (err) {
      console.error('Import error:', err);
      alert('Error uploading ICS file.');
    }
  });
}
