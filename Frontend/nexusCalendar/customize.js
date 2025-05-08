
const backBtn = document.getElementById('back-btn');
const colorOptions = document.querySelectorAll('.color-option');
const fontOptions = document.querySelectorAll('.font-option');
const viewOptions = document.querySelectorAll('.view-option');


const display = document.getElementById('user-id-display');
  const userId = localStorage.getItem('nexusUserId');
  display.textContent = userId || 'Not logged in';
const displayElement = document.getElementById("user-id-display");

if (userId && displayElement) {
  fetch(`http://localhost:3001/user/${userId}`)
    .then(res => res.json())
    .then(data => {
      displayElement.textContent = data.name || userId;
    })
    .catch(() => {
      displayElement.textContent = userId;
    });
}

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
document.addEventListener("DOMContentLoaded", () => {
  // BACK
  document.getElementById("back-btn").addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // LOGOUT
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.clear();
    alert("Logged out.");
    window.location.href = "index.html";
  });


  // IMPORT ICS
document.getElementById("import-btn").addEventListener("click", () => {
  const fileInput = document.getElementById("import-ics");
  const file = fileInput.files[0];
  if (!file) return alert("Please select an ICS file.");

  const reader = new FileReader();
  reader.onload = async (e) => {
    const icsContent = e.target.result;

    try {
      const res = await fetch("http://localhost:3001/ics/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: localStorage.getItem("nexusUserId"),
          icsData: icsContent
        })
      });

      const data = await res.json();
      alert(data.message || "Events imported!");
    } catch (err) {
      console.error("ICS import failed:", err);
      alert("Error importing ICS file.");
    }
  };

  reader.readAsText(file);
});


  // THEME TOGGLE
  document.getElementById("theme-toggle").addEventListener("click", () => {
    let current = parseInt(localStorage.getItem('nexusCalendar_theme') || 0);
    current = (current + 1) % 6;
    localStorage.setItem('nexusCalendar_theme', current);
    alert("Theme updated. Return to calendar to view changes.");
  });

  // FONT TOGGLE
  document.getElementById("font-toggle").addEventListener("click", () => {
    let current = parseInt(localStorage.getItem('nexusCalendar_font') || 0);
    current = (current + 1) % 4;
    localStorage.setItem('nexusCalendar_font', current);
    alert("Font updated. Return to calendar to view changes.");
  });
});

const customColorPicker = document.getElementById("custom-primary");

if (customColorPicker) {
  // Set initial value from localStorage, or default to your blue
  const savedCustomColor = localStorage.getItem("nexusCustomPrimary");
  customColorPicker.value = savedCustomColor || "#6799b2";

  // On change, save new color
  customColorPicker.addEventListener("input", () => {
    const newColor = customColorPicker.value;
    localStorage.setItem("nexusCustomPrimary", newColor);
    document.documentElement.style.setProperty('--primary-color', newColor);
    alert("Primary color updated! Return to the calendar to see changes.");
  });
}

document.getElementById("logout-btn").addEventListener("click", () => {
  // Clear saved user info
  localStorage.removeItem('nexusUserId');
  localStorage.removeItem('nexusCalendar_view');
  localStorage.removeItem('nexusCalendar_theme');
  localStorage.removeItem('nexusCalendar_font');
  localStorage.removeItem('nexusNotes');
  

  alert("You have been logged out.");
  window.location.href = "log-in/log-in.html";
});

const nameInput = document.getElementById("display-name-input");
const saveNameBtn = document.getElementById("save-name-btn");
const nameSaveStatus = document.getElementById("name-save-status");

if (nameInput && saveNameBtn && nameSaveStatus && userId) {
  // Load from Firestore
  fetch(`http://localhost:3001/user/${userId}`)
    .then(res => res.json())
    .then(data => {
      if (data.name) {
        nameInput.value = data.name;
        document.getElementById("user-id-display").textContent = data.name;
      } else {
        document.getElementById("user-id-display").textContent = userId;
      }
    })
    .catch(err => {
      console.error("Failed to load name from backend:", err);
      document.getElementById("user-id-display").textContent = userId;
    });

  // Save to backend
  saveNameBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (name.length === 0) {
      nameSaveStatus.textContent = "Name cannot be empty.";
      nameSaveStatus.style.color = "red";
      return;
    }

    fetch(`http://localhost:3001/user/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    })
      .then(res => res.json())
      .then(data => {
        nameSaveStatus.textContent = "Name saved!";
        nameSaveStatus.style.color = "green";
        document.getElementById("user-id-display").textContent = name;

        setTimeout(() => {
          nameSaveStatus.textContent = "";
        }, 2000);
      })
      .catch(err => {
        console.error("Failed to save name:", err);
        nameSaveStatus.textContent = "Failed to save name.";
        nameSaveStatus.style.color = "red";
      });
  });
}


document.getElementById('back-btn').addEventListener('click', () => {
  window.location.href = 'index.html';
});

document.getElementById("link-google-btn").addEventListener("click", () => {
  const authUrl = "https://accounts.google.com/o/oauth2/auth";
  const params = new URLSearchParams({
    client_id: "163745154776-a7rnimll4ohaov0bc5q3peotqnbqkk50.apps.googleusercontent.com",
    redirect_uri: "http://localhost:5500/redirect",
    response_type: "code",
    scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email",
    access_type: "offline",
    prompt: "consent"
  });

  window.location.href = `${authUrl}?${params.toString()}`;
});
