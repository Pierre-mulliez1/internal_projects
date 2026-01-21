function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Devoteam | Internal Portal')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Main API called by the frontend.
 * Connects to the Google Sheet and formats all data.
 */
function getPortalData() {
  // !!! IMPORTANT: Replace this with your actual Spreadsheet ID !!!
  // You can find the ID in your Google Sheet URL: /spreadsheets/d/[ID_IS_HERE]/edit
  var SPREADSHEET_ID = '1THHs9luEROjHW0fgVSAwwD7gOJly6nZY49YwQ2ZZs8w'; 

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  return {
    projects: getProjectsFromSheet(ss),
    jobs: getJobsFromSheet(ss),
    engagement: getEngagementFromSheet(ss)
  };
}

/**
 * Reads the "Projects" sheet.
 * Assumes Column Order from CSV: 
 * [0]id, [1]title, [2]category, [3]entity, [4]subtitle, [5]Demo Link, [6]Doc Link, 
 * [7]Image 1, [8]Image 2, [9]Feat Heading, [10]Feat Subheading, 
 * [11]Feat 1 Title, [12]Feat 1 Desc, [13]Feat 2 Title, [14]Feat 2 Desc...
 */
function getProjectsFromSheet(ss) {
  var sheet = ss.getSheetByName("Projects");
  var data = sheet.getDataRange().getValues();
  var headers = data.shift(); // Remove header row

  return data.map(function(row) {
    // extract features dynamically (pairs of Title/Desc starting at col 12 now, due to column shift)
    var features = [];
    // We check up to 6 features (columns 12 to 24)
    for (var i = 12; i < 24; i += 2) {
      if (row[i] && row[i+1]) {
        features.push({
          title: row[i].toString(),
          desc: row[i+1].toString()
        });
      }
    }

    return {
      id: row[0],
      title: row[1],
      category: row[2],
      entity: row[3],
      entity2: row[4], // <--- NEW COLUMN E
      subtitle: row[5], // Shifted +1
      demoLink: row[6] || "#", // Shifted +1
      docLink: row[7] || "#", // Shifted +1
      img1: row[8], // Shifted +1
      // features array processed above
      features: features 
    };
  });
}

/**
 * Reads the "Jobs" sheet.
 * Assumes Column Order from CSV: 
 * [0]title, [1]Specification, [2]Project, [3]imageUrl, [4]description, [5]applyEmail
 */
function getJobsFromSheet(ss) {
  var sheet = ss.getSheetByName("Jobs");
  var data = sheet.getDataRange().getValues();
  data.shift(); // Remove header row

  return data.map(function(row) {
    return {
      title: row[0],
      spec: row[1],
      project: row[2],
      img: row[3],
      desc: row[4],
      email: row[5]
    };
  });
}

/**
 * Reads the "Engagement" sheet.
 * Assumes Column Order from CSV:
 * [0]title, [1]subtitle, [2]label, [3]labelLink, [4]infoText, [5]backgroundImage, [6]infoIcon_svg
 */
function getEngagementFromSheet(ss) {
  var sheet = ss.getSheetByName("Engagement");
  var data = sheet.getDataRange().getValues();
  data.shift(); // Remove header row

  return data.map(function(row) {
    return {
      title: row[0],
      subtitle: row[1],
      link: row[3],
      // We only map the image and titles as the previous JSON design didn't use the SVG/Label
      // If you need them later, add: label: row[2], svg: row[6]
      img: row[5]
    };
  });
}

/**
 * Existing code above... (doGet, getPortalData, etc.)
 */

// --- NEW WRITE FUNCTIONS ---

/**
 * Adds a new Job to the 'Jobs' sheet.
 * Checks for duplicates based on Title + Project Name.
 */
function addJobToSheet(formObject) {
  var ss = SpreadsheetApp.openById('1THHs9luEROjHW0fgVSAwwD7gOJly6nZY49YwQ2ZZs8w'); // Your ID
  var sheet = ss.getSheetByName("Request_Jobs");
  
  // 1. Validation: Check if exists
  var data = sheet.getDataRange().getValues();
  // Skip header
  for (var i = 1; i < data.length; i++) {
    if (data[i][0].toString().toLowerCase() === formObject.title.toLowerCase() && 
        data[i][2].toString().toLowerCase() === formObject.project.toLowerCase()) {
      throw new Error("A role with this Title in this Project already exists.");
    }
  }

  // 2. Append Data
  // CSV Order: [0]title, [1]Specification, [2]Project, [3]imageUrl, [4]description, [5]applyEmail
  sheet.appendRow([
    formObject.title,
    formObject.spec,
    formObject.project,
    formObject.img,
    formObject.desc,
    formObject.email
  ]);

  return "Success! Role added.";
}

/**
 * Adds a new Project to the 'Projects request' sheet.
 * Checks for duplicates based on Project Title.
 */
function addProjectToSheet(formObject) {
  var ss = SpreadsheetApp.openById('1THHs9luEROjHW0fgVSAwwD7gOJly6nZY49YwQ2ZZs8w'); // Your ID
  var sheet = ss.getSheetByName("Request_Projects");

  // 1. Validation
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][1].toString().toLowerCase() === formObject.title.toLowerCase()) {
      throw new Error("A project with this title already exists.");
    }
  }

  // 2. Generate Simple ID (count + 1)
  var newId = data.length; 

  // 3. Prepare Row Data based on your specific column structure
  // [0]id, [1]title, [2]category, [3]entity, [4]entity2, [5]subtitle, [6]Demo, [7]Doc, [8]Img1, [9]Img2(unused), [10]FeatHead, [11]FeatSub, [12]F1T, [13]F1D...
  
  var rowData = [
    newId,
    formObject.title,
    formObject.category,
    formObject.entity,
    formObject.entity2,
    formObject.subtitle,
    formObject.demoLink || "#",
    formObject.docLink || "#",
    formObject.img1,
    "", // Placeholder for Img2 if unused
    "Key Features", // Default Feature Heading
    "What makes this project unique", // Default Feature Subheading
    formObject.f1Title, formObject.f1Desc, // Feature 1
    formObject.f2Title, formObject.f2Desc,  // Feature 2
    formObject.f3Title || "", formObject.f3Desc || "",
    formObject.f4Title || "", formObject.f4Desc || "",
    formObject.f5Title || "", formObject.f5Desc || "",
    formObject.f6Title || "", formObject.f6Desc || ""
  ];

  sheet.appendRow(rowData);
  return "Success! Project added.";
}