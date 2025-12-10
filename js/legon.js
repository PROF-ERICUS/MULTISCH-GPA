// ==========================================================
// PERSISTENCE HELPERS
// ==========================================================

// Helper to create a user-specific key for localStorage
function getIndexKey(key) {
    // Uses the logged-in user's index number for uniqueness
    // Defaults to 'DEFAULT_USER' if index is not set
    const indexNumber = localStorage.getItem('userIndexNumber') || 'DEFAULT_USER';
    return `${key}_${indexNumber}`;
}

// Helper to save data and trigger recalculation on input change
function saveAndRecalculate(inputElement) {
    // 1. Find the parent semester section
    const semesterSection = inputElement.closest('.semesterSection');
    
    // 2. Find the Calculate Semester GPA button within that section
    const calculateButton = semesterSection.querySelector('button[onclick*="calculateSemesterGPA"]');
    
    // 3. Trigger the calculation (which handles saving and updating all results)
    if (calculateButton) {
        calculateSemesterGPA(calculateButton);
    } else {
        // Fallback save just in case
        saveGPAData(); 
        updateMainCGPA();
    }
}

// Helper to create a new course row with saved data and listeners attached
function createCourseRow(courseName = '', creditHours = '', marks = '') {
    const row = document.createElement('div');
    row.className = 'courseRow';
    // Use value attribute to set content from parameters
    row.innerHTML = `
      <input type="text" placeholder="Course Name" required value="${courseName}">
      <input type="number" placeholder="Credit Hours" min="1" required value="${creditHours}">
      <input type="number" placeholder="Marks (0-100)" min="0" max="100" required value="${marks}">
      <span class="grade-box"></span>
      <button type="button" class="remove-btn" onclick="removeCourse(this)">×</button>
    `;

    // Manually attach the input event listener for persistence and calculation
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => saveAndRecalculate(input));
    });

    return row;
}

// ==========================================================
// GRADING & CLASSIFICATION LOGIC (Preserved from user code)
// ==========================================================

function getGrade(marks) {
  if (marks >= 80) return 'A';
  if (marks >= 75) return 'B+';
  if (marks >= 70) return 'B';
  if (marks >= 65) return 'C+';
  if (marks >= 60) return 'C';
  if (marks >= 55) return 'D+';
  if (marks >= 50) return 'D';
  if (marks >= 45) return 'E';
  return 'F';
}

function classifyGPA(gpa) {
  if (gpa >= 3.60) return 'First Class';
  if (gpa >= 3.00) return 'Second Class Upper Division';
  if (gpa >= 2.00) return 'Second Class Lower Division';
  if (gpa >= 1.50) return 'Third Class';
  if (gpa >= 1.00) return 'Pass';
  return 'Fail';
}

// ==========================================================
// COURSE MANAGEMENT FUNCTIONS (Updated for Persistence)
// ==========================================================

function addCourse(button) {
  const courseInputs = button.previousElementSibling;
  
  // Use the new helper function to create the row and attach listeners
  const row = createCourseRow(); 
  courseInputs.appendChild(row);

  // Trigger save/recalculation after adding a course
  saveAndRecalculate(row.querySelector('input'));
}

function removeCourse(button) {
  const row = button.parentElement;
  const semesterSection = row.closest('.semesterSection');
  row.remove();
  
  // Recalculate and save after removal
  const calculateButton = semesterSection.querySelector('button[onclick*="calculateSemesterGPA"]');
  if (calculateButton) {
      calculateSemesterGPA(calculateButton);
  }
}

function calculateSemesterGPA(button) {
  const semesterSection = button.closest('.semesterSection');
  const semesterIndex = Array.from(document.querySelectorAll('.semesterSection')).indexOf(semesterSection) + 1;
  const courseRows = semesterSection.querySelectorAll('.courseRow');

  let semesterPoints = 0;
  let semesterCredits = 0;
  let incompleteCourses = 0;

  courseRows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const courseName = inputs[0].value.trim(); // Check course name too
    const credit = parseFloat(inputs[1].value);
    const marks = parseFloat(inputs[2].value);

    // Check for incomplete/invalid courses
    if (courseName === '' || isNaN(credit) || isNaN(marks) || credit <= 0 || marks < 0 || marks > 100) {
      incompleteCourses++;
       // Clear grade box if incomplete/invalid
      const gradeBox = row.querySelector('.grade-box');
      gradeBox.innerText = '';
      gradeBox.style.background = 'none';
      return;
    }
    
    const grade = getGrade(marks);
    const point = {
      'A': 4.00,
      'B+': 3.50,
      'B': 3.00,
      'C+': 2.50,
      'C': 2.00,
      'D+': 1.50,
      'D': 1.00,
      'E': 0.50,
      'F': 0.00
    }[grade];

    const gradeBox = row.querySelector('.grade-box');
    gradeBox.innerText = grade;
    gradeBox.style.background = point >= 3.0 ? '#d4edda' : point >= 2.0 ? '#fff3cd' : '#f8d7da';
    gradeBox.style.color = '#333';

    semesterPoints += point * credit;
    semesterCredits += credit;
  });

  const semesterResult = semesterSection.querySelector('.semesterResult');

  if (semesterCredits > 0) {
    const gpa = (semesterPoints / semesterCredits).toFixed(2);
    const classLabel = classifyGPA(gpa);

    // Calculate overall CGPA/FGPA
    let overallPoints = 0;
    let overallCredits = 0;
    const allSemesterSections = document.querySelectorAll('.semesterSection');

    allSemesterSections.forEach(section => {
      const rows = section.querySelectorAll('.courseRow');
      rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const courseName = inputs[0].value.trim();
        const credit = parseFloat(inputs[1].value);
        const marks = parseFloat(inputs[2].value);
        if (courseName === '' || isNaN(credit) || isNaN(marks) || credit <= 0 || marks < 0 || marks > 100) return;

        const grade = getGrade(marks);
        const point = {
          'A': 4.00, 'B+': 3.50, 'B': 3.00, 'C+': 2.50,
          'C': 2.00, 'D+': 1.50, 'D': 1.00, 'E': 0.50, 'F': 0.00
        }[grade];

        overallPoints += point * credit;
        overallCredits += credit;
      });
    });

    const cgpa = (overallCredits > 0 ? overallPoints / overallCredits : 0).toFixed(2);
    const cgpaClassLabel = classifyGPA(cgpa);

    let resultHTML = `
      <strong>Semester GPA:</strong> ${gpa} (Credits: ${semesterCredits}) - Class: ${classLabel}
    `;
    
    // The original logic shows CGPA in the semester result only from Semester 2 onwards.
    if (semesterIndex >= 1 && overallCredits > 0) { 
      resultHTML += `<br/><strong>CGPA:</strong> ${cgpa} (Total Credits: ${overallCredits}) - Class: ${cgpaClassLabel}`;
    }

    semesterResult.innerHTML = resultHTML;

    // Update global CGPA display
    document.getElementById('cgpaResult').innerText = `CGPA: ${cgpa} (Total Credits: ${overallCredits}) - Class: ${cgpaClassLabel}`;

    // FGPA Calculation based on academic levels (100:1, 200:1, 300:2, 400:2)
    const levelCGPA = { 100: { points: 0, credits: 0 }, 200: { points: 0, credits: 0 }, 300: { points: 0, credits: 0 }, 400: { points: 0, credits: 0 } };

    allSemesterSections.forEach((section, idx) => {
      const level = (Math.floor(idx / 2) + 1) * 100; // Sem 1&2 -> 100, 3&4 -> 200, etc.
      // Cap the level at 400
      const currentLevel = Math.min(level, 400);

      const rows = section.querySelectorAll('.courseRow');
      rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const courseName = inputs[0].value.trim();
        const credit = parseFloat(inputs[1].value);
        const marks = parseFloat(inputs[2].value);
        if (courseName === '' || isNaN(credit) || isNaN(marks) || credit <= 0 || marks < 0 || marks > 100) return;

        const grade = getGrade(marks);
        const point = {
          'A': 4.00, 'B+': 3.50, 'B': 3.00, 'C+': 2.50,
          'C': 2.00, 'D+': 1.50, 'D': 1.00, 'E': 0.50, 'F': 0.00
        }[grade];

        levelCGPA[currentLevel].points += point * credit;
        levelCGPA[currentLevel].credits += credit;
      });
    });

    // Calculate level GPAs, defaulting to 0 if no credits
    const gpa100 = levelCGPA[100].credits > 0 ? levelCGPA[100].points / levelCGPA[100].credits : 0;
    const gpa200 = levelCGPA[200].credits > 0 ? levelCGPA[200].points / levelCGPA[200].credits : 0;
    const gpa300 = levelCGPA[300].credits > 0 ? levelCGPA[300].points / levelCGPA[300].credits : 0;
    const gpa400 = levelCGPA[400].credits > 0 ? levelCGPA[400].points / levelCGPA[400].credits : 0;
    
    // Apply weights (1:1:2:2)
    const weightedTotal = 
      (gpa100 * 1) +
      (gpa200 * 1) +
      (gpa300 * 2) +
      (gpa400 * 2);

    const FGPA = (weightedTotal / 6).toFixed(2);
    const finalClass = classifyGPA(FGPA);
    
    // Ensure the FGPA element exists (it should be in the main HTML)
    const fgpaResultDiv = document.getElementById('fgpaResult');

    // Only show FGPA if at least one semester is calculated
    if (allSemesterSections.length >= 1 && fgpaResultDiv) {
      fgpaResultDiv.innerText = `FGPA: ${FGPA} - Class: ${finalClass}`;
    } else if (fgpaResultDiv) {
      fgpaResultDiv.innerText = '';
    }
    
    // Save data after calculation
    saveGPAData();

  } else {
    semesterResult.innerText = 'Please enter at least one valid course with credit hours and marks.';
    document.getElementById('cgpaResult').innerText = '';
    const fgpaDiv = document.getElementById('fgpaResult');
    if (fgpaDiv) fgpaDiv.innerText = '';
    saveGPAData();
  }
}

function updateMainCGPA() {
    // The main CGPA calculation is handled within calculateSemesterGPA, 
    // but this function is kept to ensure button handlers work and it triggers a save.
    
    // Find any calculate button and trigger it to ensure global results are refreshed and saved.
    const firstCalculateButton = document.querySelector('.semesterSection button[onclick*="calculateSemesterGPA"]');
    if (firstCalculateButton) {
        calculateSemesterGPA(firstCalculateButton);
    } else {
        // If no semesters exist, clear results
        document.getElementById('cgpaResult').innerText = '';
        const fgpaDiv = document.getElementById('fgpaResult');
        if (fgpaDiv) fgpaDiv.innerText = '';
        saveGPAData();
    }
}

function addSemester() {
  const semesterInputs = document.getElementById('semesterInputs');
  const semesterCount = semesterInputs.getElementsByClassName('semesterSection').length + 1;

  const semesterSection = document.createElement('div');
  semesterSection.className = 'semesterSection';
  semesterSection.innerHTML = `
    <h4>Semester ${semesterCount}</h4>
    <div class="courseInputs">
    </div>
    <button type="button" onclick="addCourse(this)">Add Course</button>
    <button type="button" onclick="calculateSemesterGPA(this)">Calculate Semester GPA</button>
    <div class="semesterResult"></div>
    <div class="cumulativeCGPA"></div>
  `;
  
  // Add an initial course row using the helper and attach listeners
  const courseInputsDiv = semesterSection.querySelector('.courseInputs');
  courseInputsDiv.appendChild(createCourseRow()); 

  semesterInputs.appendChild(semesterSection);
  
  // Save data after adding a new semester
  saveGPAData();
}

function calculateCGPA() {
    // This function is often attached to a final button, so we ensure the results are updated and saved.
    updateMainCGPA();
}


function resetForm() {
  // Clear saved data for the current user
  clearSavedGPAData();

  document.getElementById('semesterInputs').innerHTML = '';
  document.getElementById('cgpaResult').innerText = '';
  const fgpaDiv = document.getElementById('fgpaResult');
  if (fgpaDiv) fgpaDiv.innerText = '';
  
  addSemester(); // Start with a fresh semester
}


function closePopup() {
  document.getElementById('popup').style.display = 'none';
}

window.onload = function () {
  setTimeout(() => {
    document.getElementById('popup').style.display = 'flex';
  }, 500);

  const darkModePreference = localStorage.getItem('darkMode') === 'true';
  document.getElementById('modeToggle').checked = darkModePreference;
  document.body.classList.toggle('dark', darkModePreference);

  // Load the user's previously saved GPA data
  loadGPAData();
};

document.getElementById('modeToggle').addEventListener('change', function () {
  const isDarkMode = this.checked;
  document.body.classList.toggle('dark', isDarkMode);
  localStorage.setItem('darkMode', isDarkMode);
});

function printResults() {
  let printContent = `
    <div style="text-align:center;">
      <img src="legon logo.jpg" width="100" />
      <h2>University of Ghana (LEGON) - GPA Report</h2>
    </div>
  `;

  const semesters = document.querySelectorAll('.semesterSection');

  let summaryTable = `
    <h3>Semester Summary</h3>
    <table border="1" cellspacing="0" cellpadding="8" width="100%">
      <tr>
        <th>Semester</th>
        <th>Courses</th>
        <th>Total Credit Hours</th>
        <th>GPA</th>
        <th>CGPA</th>
        <th>Class</th>
      </tr>
  `;

  let totalPoints = 0;
  let totalCredits = 0;

  semesters.forEach((semester, index) => {
    const courseRows = semester.querySelectorAll('.courseRow');
    let courseNames = [];
    let semesterCredits = 0;
    let semesterPoints = 0;

    courseRows.forEach(row => {
      const inputs = row.querySelectorAll('input');
      const courseName = inputs[0].value;
      const credit = parseFloat(inputs[1].value);
      const marks = parseFloat(inputs[2].value);

      if (!isNaN(credit) && !isNaN(marks) && credit > 0 && marks >= 0 && marks <= 100) {
        const grade = getGrade(marks);
        const point = {
          'A': 4.00, 'B+': 3.50, 'B': 3.00, 'C+': 2.50,
          'C': 2.00, 'D+': 1.50, 'D': 1.00, 'E': 0.50, 'F': 0.00
        }[grade];

        semesterCredits += credit;
        semesterPoints += point * credit;
        courseNames.push(courseName);
      }
    });

    let semesterGPA = 0;
    if (semesterCredits > 0) {
      semesterGPA = semesterPoints / semesterCredits;
      totalPoints += semesterPoints;
      totalCredits += semesterCredits;

      const cgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
      const classLabel = classifyGPA(cgpa.toFixed(2));

      summaryTable += `
        <tr>
          <td>Semester ${index + 1}</td>
          <td>${courseNames.join(", ")}</td>
          <td>${semesterCredits}</td>
          <td>${semesterGPA.toFixed(2)}</td>
          <td>${cgpa.toFixed(2)}</td>
          <td>${classLabel}</td>
        </tr>
      `;
    }
  });

  summaryTable += '</table><br/>';
  printContent += summaryTable;

  // Detailed breakdown
  semesters.forEach((semester, index) => {
    printContent += `<h3>Semester ${index + 1}</h3>`;
    printContent += `
      <table border="1" cellspacing="0" cellpadding="8" width="100%">
        <tr>
          <th>Course Name</th>
          <th>Credit Hours</th>
          <th>Marks</th>
          <th>Grade</th>
        </tr>
    `;
    const courseRows = semester.querySelectorAll('.courseRow');
    courseRows.forEach(row => {
      const inputs = row.querySelectorAll('input');
      const grade = row.querySelector('.grade-box').innerText;
      printContent += `
        <tr>
          <td>${inputs[0].value}</td>
          <td>${inputs[1].value}</td>
          <td>${inputs[2].value}</td>
          <td>${grade}</td>
        </tr>
      `;
    });

    const semesterResult = semester.querySelector('.semesterResult')?.innerText || '';
    printContent += `</table><p><strong>${semesterResult}</strong></p><br/>`;
  });

  // Footer
  const overallGPAInfo = document.getElementById('cgpaResult').innerText;
  const fgpaInfo = document.getElementById('fgpaResult')?.innerText || '';

  printContent += `<hr/><p><strong>${overallGPAInfo}</strong></p>`;
  if (fgpaInfo) {
    printContent += `<p><strong>${fgpaInfo}</strong></p>`;
  }

  // Open print preview
  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <html><head><title>Print Results</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #999; text-align: center; }
      img { margin-bottom: 10px; }
      @media print { button { display: none; } }
    </style>
    </head><body>${printContent}</body></html>
  `);
  printWindow.document.close();
  printWindow.print();
}

// ==========================================================
// PERSISTENCE FUNCTIONS
// ==========================================================

// SAVE everything using a user-specific key as JSON
function saveGPAData() {
    const semesters = [];
    const semesterSections = document.querySelectorAll('.semesterSection');

    semesterSections.forEach((section) => {
        const courses = [];
        const courseRows = section.querySelectorAll('.courseRow');

        courseRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            courses.push({
                name: inputs[0].value,
                credit: inputs[1].value,
                marks: inputs[2].value
            });
        });

        semesters.push({ courses: courses });
    });

    // Save the entire structure as JSON
    localStorage.setItem(getIndexKey("gpaCalculatorData"), JSON.stringify(semesters));
    
    // Save result displays
    localStorage.setItem(getIndexKey("gpaCalculatorCGPA"), document.getElementById("cgpaResult").innerHTML);
    localStorage.setItem(getIndexKey("gpaCalculatorFGPA"), document.getElementById("fgpaResult")?.innerHTML || '');
}

// RESTORE everything on page load by rebuilding the DOM from JSON
function loadGPAData() {
  const userIndexNumber = localStorage.getItem('userIndexNumber');
  const semesterInputsContainer = document.getElementById('semesterInputs');
  
  // Always clear the initial structure before loading/rebuilding
  semesterInputsContainer.innerHTML = '';

  // If no index number (user not logged in), skip loading and just add one empty semester
  if (!userIndexNumber) {
      addSemester();
      return; 
  }
    
  const savedDataJSON = localStorage.getItem(getIndexKey("gpaCalculatorData"));
  const savedCGPA = localStorage.getItem(getIndexKey("gpaCalculatorCGPA"));
  const savedFGPA = localStorage.getItem(getIndexKey("gpaCalculatorFGPA"));

  if (savedDataJSON) {
    const savedSemesters = JSON.parse(savedDataJSON);

    if (savedSemesters.length > 0) {
      savedSemesters.forEach((semesterData, semIndex) => {
        const semesterCount = semIndex + 1;

        const semesterSection = document.createElement('div');
        semesterSection.className = 'semesterSection';
        semesterSection.innerHTML = `
          <h4>Semester ${semesterCount}</h4>
          <div class="courseInputs">
          </div>
          <button type="button" onclick="addCourse(this)">Add Course</button>
          <button type="button" onclick="calculateSemesterGPA(this)">Calculate Semester GPA</button>
          <div class="semesterResult"></div>
          <div class="cumulativeCGPA"></div>
        `;
        
        const courseInputsDiv = semesterSection.querySelector('.courseInputs');
        
        // Rebuild courses using the saved data and helper function
        semesterData.courses.forEach(course => {
          const row = createCourseRow(course.name, course.credit, course.marks);
          courseInputsDiv.appendChild(row);
        });

        semesterInputsContainer.appendChild(semesterSection);
      });

      // Recalculate to update grade boxes, semester, and cumulative results after rebuilding the DOM
      const allCalculateButtons = document.querySelectorAll('.semesterSection button[onclick*="calculateSemesterGPA"]');
      allCalculateButtons.forEach(button => calculateSemesterGPA(button)); 

    } else {
        addSemester(); // No semesters saved, add the initial one
    }
  } else {
    addSemester(); // No data found, first-time use
  }

  // Restore CGPA/FGPA displays
  if (savedCGPA) {
    document.getElementById("cgpaResult").innerHTML = savedCGPA;
  }
  const fgpaDiv = document.getElementById("fgpaResult");
  if (savedFGPA && fgpaDiv) {
    fgpaDiv.innerHTML = savedFGPA;
  }
}

// CLEAR saved data using a user-specific key
function clearSavedGPAData() {
  localStorage.removeItem(getIndexKey("gpaCalculatorData"));
  localStorage.removeItem(getIndexKey("gpaCalculatorCGPA"));
  localStorage.removeItem(getIndexKey("gpaCalculatorFGPA"));
}
