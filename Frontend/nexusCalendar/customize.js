<!DOCTYPE html>
<html>
<head>
  <title>Settings - Nexus Calendar</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="customize.css">
</head>
<body>
  <header>
    <h1>nexus calendar</h1>
    <h2>settings</h2>
    <div class="settings-container">
      <button id="back-btn" class="settings-btn">
        <img src="settingsBCK.png" class="settings-icon" alt="Back"> Back
      </button>
    </div>
  </header>

  <div class="customize-container">
    
    <div class="customize-section">
      <h3>Account</h3>
<div id="user-info" style="margin: 10px; font-size: 12px;">
      <p><strong>User ID:</strong> <code id="user-id-display">Loading...</code></p>

</div>
      <input type="text" id="display-name-input" placeholder="Enter your display name" style="padding: 8px; width: 100%; max-width: 300px;">


      <br>       <br>


      <button class="control-btn" id="link-google-btn">Link Google Account</button>
      <br>       <br>

      <button class="control-btn" id="pull-google-btn">Pull Events From Google</button>
      <br>       <br>


<input type="file" id="import-ics" accept=".ics" />

      <button id="import-btn">Import ICS File</button>
<br>


      <div id="name-save-status" style="color: green; margin-top: 5px;"></div>


    </div>

    <div class="customize-section">
  <h3>Appearance</h3>

  <label for="custom-primary">Primary Color:</label>
    <input type="color" id="custom-primary" value="#6799b2">

  <p style="margin-top: 15px;">Font:</p>
  <div class="font-options">
    <div class="font-option" data-font="0">Jost (Default)</div>
    <div class="font-option" data-font="1">Arial</div>
    <div class="font-option" data-font="2">Courier New</div>
    <div class="font-option" data-font="3">Times New Roman</div>
  </div>
</div>


    <div class="customize-section">
      <h3>Appearance</h3>
      <button class="control-btn" id="theme-toggle">Toggle Theme</button>
      <button class="control-btn" id="font-toggle">Toggle Font</button>
      <br>      <br>


      <button class="control-btn" id="logout-btn">Log Out</button>

    </div>
  </div>



  <script src="customize.js"></script>


</body>

</html>
