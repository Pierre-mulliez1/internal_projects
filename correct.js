// Code.gs
// --- LECTURE DES DONNÉES ---
function getAgileBoardData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Administratif"); // Cible la feuille spécifique
  
  if (!sheet) throw new Error("La feuille 'Administratif' est introuvable.");

  const data = sheet.getDataRange().getValues();
  const headers = data[0]; // La ligne 1 contient les noms des tâches (Career Plan, EY...)
  
  // Configuration des colonnes à transformer en cartes
  // Basé sur votre tableau : Col 3 (D) à 7 (H)
  // [3="Career Plan", 4="EY", 5="RPFU", 6="Feedback...", 7="Objectives"]
  const taskColIndices = [3, 4, 5, 6, 7]; 

  let board = {
    backlog: [],
    scheduled: [],
    done: []
  };

  
  for (let i = 1; i < data.length; i++) {
    let row = data[i];
    let consultantName = row[0]; // Col A
    let semester = row[1];       // Col B (Tag)
    let cm = row[2];             // Col C (Assignee)

    // Pour ce consultant, on crée une carte pour CHAQUE tâche administrative
    taskColIndices.forEach(colIndex => {
      let taskName = headers[colIndex]; // Ex: "Career Plan"
      let status = String(row[colIndex]).trim(); // Ex: "Done", "TBD"
      let cleanStatus = status.toLowerCase();
      
      let targetColumn = null;

      // 1. Déterminer la colonne Agile
      if (["tbd", "null", "blank", ""].includes(cleanStatus)) {
        targetColumn = "backlog";
      } else if (cleanStatus.includes("scheduled") || cleanStatus.includes("requested")) {
        targetColumn = "scheduled";
      } else if (cleanStatus.includes("done") || cleanStatus.includes("received")) {
        targetColumn = "done";
      }

      // Si le statut est pertinent, on crée la carte
      if (targetColumn) {
        // ID Composite unique : NomConsultant_NomTache (ex: TahaCHACHOUA_CareerPlan)
        // On nettoie les espaces pour que l'ID HTML soit valide
        let uniqueId = (consultantName + "_" + taskName).replace(/[^a-zA-Z0-9]/g, "");

        board[targetColumn].push({
          id: uniqueId,
          consultant: consultantName,
          taskType: taskName, // Important pour savoir quelle colonne Excel modifier
          cm: cm,
          tag: semester,
          displayStatus: status // Le texte original affiché
        });
      }
    });
  }
  
  return board;
}

// --- MISE À JOUR (UPDATE) ---
function updateTaskStatus(consultantName, taskType, newStatus) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Administratif");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  // 1. Trouver l'index de la colonne correspondant au Type de Tâche (ex: "Career Plan")
  let colIndex = headers.indexOf(taskType);
  if (colIndex === -1) return { status: 'error', message: 'Colonne introuvable: ' + taskType };

  // 2. Trouver la ligne du Consultant
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == consultantName) { // Col A = Nom
      rowIndex = i + 1; // +1 pour l'index Sheet (base 1)
      break;
    }
  }

  if (rowIndex > -1) {
    // 3. Mettre à jour la cellule précise
    sheet.getRange(rowIndex, colIndex + 1).setValue(newStatus);
    return { status: 'success', consultant: consultantName, task: taskType, newVal: newStatus };
  }
  
  return { status: 'error', message: 'Consultant introuvable' };
}


function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Devoteam Consultant Manager')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}


function getConsultantData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Staffing");
  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); 
  
  return data.map(row => ({
    name: row[0],
    status: row[1],
    client: row[2], 
    id: row[3],
    // Index 4 is Column E (Skipped)
    description: row[5] || "" // Index 5 is Column F
  }));
}

// --- UPDATED ADD FUNCTION ---
function addConsultantToSheet(name, status, project, description) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Staffing");
  const data = sheet.getDataRange().getValues();
  
  // Appending: [Name(A), Status(B), Project(C), ID(D), Empty(E), Description(F)]
  sheet.appendRow([name, status, project, data.length, "", description]); 
  return true;
}

// Update Status (Drag and Drop Logic)
function updateConsultantStatus(id, newStatus) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Staffing");
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][3].toString() === id) {
      sheet.getRange(i + 1, 2, 1, 2).setValues([[newStatus, null]]);
      return true;
    }
  }
  return false;
}

function updateConsultantDetails(id, newProject, newDescription) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Staffing");
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    // Check Column D (index 3) for ID
    if (String(data[i][3]) === id.toString()) {
      
      // Update Column C (Project) -> Index 3 in getRange (1-based)
      // Update Column F (Description) -> Index 6 in getRange (1-based)
      
      // We can set multiple values if contiguous, but since E is skipped, we do two sets
      sheet.getRange(i + 1, 3).setValue(newProject);
      sheet.getRange(i + 1, 6).setValue(newDescription);
      return true;
    }
  }
  return false;
}



function doGet() {
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Portail Formation')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getDataFromSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Formation");
  // On récupère tout le tableau
  const rawData = sheet.getDataRange().getValues();
  
  // On enlève la première ligne (En-têtes)
  rawData.shift();

  // On enlève la colonne A (Domaine) et on ne garde que [Éditeur, Titre, Desc, URL]
  // Index 1 = Éditeur, Index 2 = Titre, Index 3 = Desc, Index 4 = URL
  const processedData = rawData.map(row => {
    return [row[1], row[2], row[3], row[4]]; 
  });

  return processedData;
}


// --- CRA DATA HANDLER ---
function getCRAData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("CRA"); // Ensure sheet name is "CRA"
  
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  data.shift(); // Remove header row

  // Map and simple server-side filter to reduce payload
  // We assume: Col A = Name [0], Col E = CM [4], Col H = Status [7]
  const processedData = data.map(row => ({
    name: row[4],
    cm: row[6],
    status: String(row[7]) 
  })).filter(item => {
    // LOGIC: Show if Name exists AND Status is NOT "Validated" (or "OK")
    // Adjust 'Validated' to match your exact validation term in Excel
    const s = item.status.toLowerCase();
    return item.name && !s.includes("validated") && !s.includes("ok") && s !== "";
  });

  return processedData;
}
