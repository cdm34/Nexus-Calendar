
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
