const APP_ID = 'monitoring';
const SETTINGS_FILENAME = 'monitoring.data.json';

// Global variables
let acc, bar, hrm, mag;
let isAccMenu = false;
let isBarMenu = false;
let isHrmMenu = false;
let isMagMenu = false;
let isNewAccData = false;
let isNewBarData = false;
let isNewHrmData = false;
let isNewMagData = false;
let settings = require('Storage').readJSON(SETTINGS_FILENAME);


// Menus
let mainMenu = {
  "": { "title": "-- Monitoring --" },
  "Acceleration": function() 
  { 
    E.showMenu(accMenu); 
    isAccMenu = true; 
  },
  "Barometer": function() 
  { 
    E.showMenu(barMenu); 
    isBarMenu = true; 
  },
  "Heart Rate": function() 
  {
    E.showMenu(hrmMenu); 
    isHrmMenu = true; 
  },
  "Magnetometer": function() 
  {
    E.showMenu(magMenu); 
    isMagMenu = true; 
  },
  '< Back': ()=>load(),
};

let accMenu = {
  "": { "title" : "- Acceleration -" },
  "State": { value: "On" },
  "x": { value: null },
  "y": { value: null },
  "z": { value: null },
  "mag": { value: null},
  "< Back": function() 
  {
    E.showMenu(mainMenu);
    isAccMenu = false; 
  },
};

let barMenu = {
  "": { "title" : "-  Barometer   -" },
  "State": {
    value: settings.isBarEnabled,
    format: v => v ? "On" : "Off",
    onchange: v => { 
      updateSetting('isBarEnabled', v);
    }
  },
  "Altitude": { value: null },
  "Press": { value: null },
  "Temp": { value: null },
  "< Back": function() 
  {
    E.showMenu(mainMenu); 
    isBarMenu = false; 
  },
};

let hrmMenu = {
  "": { "title" : "-  Heart Rate  -" },
  "State": {
    value: settings.isHrmEnabled,
    format: v => v ? "On" : "Off",
    onchange: v => { 
      updateSetting('isHrmEnabled', v);
    }
  },
  "BPM": { value: null },
  "< Back": function() 
  {
    E.showMenu(mainMenu);
    isHrmMenu = false; },
};

let magMenu = {
  "": { "title" : "- Magnetometer -" },
  "State": {
    value: settings.isMagEnabled,
    format: v => v ? "On" : "Off",
    onchange: v => { 
      updateSetting('isMagEnabled', v);
    }
  },
  "x": { value: null },
  "y": { value: null },
  "z": { value: null },
   "Heading": { value: null },
  "< Back": function() {
    E.showMenu(mainMenu);
    isMagMenu = false; 
  },
};




// Enable the sensors as per the current settings
function enableSensors() {
  Bangle.setBarometerPower(settings.isBarEnabled, APP_ID);
  Bangle.setHRMPower(settings.isHrmEnabled, APP_ID);
  Bangle.setCompassPower(settings.isMagEnabled, APP_ID);
}


// Update the given setting and write to persistent storage
function updateSetting(name, value) {
  settings[name] = value;
  require('Storage').writeJSON(SETTINGS_FILENAME, settings);
  enableSensors();
}


// Update acceleration
Bangle.on('accel', function(newAcc) {
  acc = newAcc;
  isNewAccData = true;

  if(isAccMenu) {
    accMenu.x.value = acc.x.toFixed(2) + 'g';
    accMenu.y.value = acc.y.toFixed(2) + 'g';
    accMenu.z.value = acc.z.toFixed(2) + 'g';
    accMenu.mag.value = acc.mag.toFixed(2) + 'g';
    E.showMenu(accMenu);
  }
});

// Update barometer
Bangle.on('pressure', function(newBar) {
  bar = newBar;
  isNewBarData = true;

  if(isBarMenu) {
    barMenu.Altitude.value = bar.altitude.toFixed(1) + 'm';
    barMenu.Press.value = bar.pressure.toFixed(1) + 'mbar';
    barMenu.Temp.value = bar.temperature.toFixed(1) + 'C';
    E.showMenu(barMenu);
  }
});


// Update heart rate monitor
Bangle.on('HRM', function(newHrm) {
  hrm = newHrm;
  isNewHrmData = true;

  if(isHrmMenu) {
    hrmMenu.BPM.value = hrm.bpm;
    E.showMenu(hrmMenu);
  }
});

// Update magnetometer
Bangle.on('mag', function(newMag) {
  mag = newMag;
  isNewMagData = true;

  if(isMagMenu) {
    magMenu.x.value = mag.x;
    magMenu.y.value = mag.y;
    magMenu.z.value = mag.z;
    magMenu.Heading.value = mag.heading.toFixed(1) + 'dgs';
    E.showMenu(magMenu);
  }
});


// On start: enable sensors and display main menu
g.clear();
enableSensors();
E.showMenu(mainMenu);
