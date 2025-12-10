// ==========================================================
// USER-SPECIFIC STORAGE KEY HELPER
// Ensures data is stored against the logged-in user's index number
// Note: Assuming a 'userIndexNumber' is set in localStorage upon login
// ==========================================================
function getIndexKey(key) {
    // Uses the logged-in user's index number for uniqueness
    const indexNumber = localStorage.getItem('userIndexNumber') || 'DEFAULT_USER';
    return `${key}_${indexNumber}`;
}

// ==========================================================
// PERSISTENCE HELPER: Saves data on input change and recalculates
// ==========================================================
function saveAndRecalculate(inputElement) {
    // 1. Find the parent semester section
    const semesterSection = inputElement.closest('.semesterSection');
    
    // 2. Find the Calculate Semester GPA button within that section
    const calculateButton = semesterSection.querySelector('button[onclick*="calculateSemesterGPA"]');
    
    // 3. Trigger the calculation (which calls saveGPAData and updates main CGPA)
    if (calculateButton) {
        calculateSemesterGPA(calculateButton);
    } else {
        // Fallback save just in case
        saveGPAData(); 
    }
}

// ==========================================================
// COURSE ROW CREATION HELPER
// Used for both initial load and for dynamically adding a course
// ==========================================================
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

    // Manually attach the input event listener for persistence
    const inputs = row.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => saveAndRecalculate(input));
    });

    return row;
}

function getGrade(marks) {
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'A-';
  if (marks >= 65) return 'B+';
  if (marks >= 60) return 'B';
  if (marks >= 55) return 'C+';
  if (marks >= 50) return 'C';
  if (marks >= 40) return 'D';
  return 'F';
}

function classifyGPA(gpa) {
  if (gpa >= 3.65) return 'First Class Honours';
  if (gpa >= 3.25) return 'Second Class Honours Upper';
  if (gpa >= 2.50) return 'Second Class Honours Lower';
  if (gpa >= 2.00) return 'Third Class Honours';
  if (gpa >= 1.75) return 'Pass';
  return 'Fail';
}


function addCourse(button) {
  const courseInputs = button.previousElementSibling;
  
  // Use the new helper function to create and attach listeners
  const row = createCourseRow(); 
  courseInputs.appendChild(row);

  // Save data and recalculate after adding a course
  saveGPAData();
  const semesterSection = row.closest('.semesterSection');
  // Re-calculate the specific semester to update results immediately
  calculateSemesterGPA(semesterSection.querySelector('button[onclick*="calculateSemesterGPA"]'));
}

function removeCourse(button) {
  const row = button.parentElement;
  const semesterSection = row.closest('.semesterSection');
  row.remove();
  
  // Recalculate and save after removal
  calculateSemesterGPA(semesterSection.querySelector('button[onclick*="calculateSemesterGPA"]'));
  saveGPAData();
}


function calculateSemesterGPA(button) {
  const semesterSection = button.closest('.semesterSection');
  const courseRows = semesterSection.querySelectorAll('.courseRow');

  let semesterPoints = 0;
  let semesterCredits = 0;
  let incompleteCourses = 0;

  courseRows.forEach(row => {
    const inputs = row.querySelectorAll('input');
    const courseName = inputs[0].value.trim(); // Check course name too
    const credit = parseFloat(inputs[1].value);
    const marks = parseFloat(inputs[2].value);

    if (courseName === '' || isNaN(credit) || isNaN(marks)) {
      incompleteCourses++;
      // Clear grade box if incomplete
      const gradeBox = row.querySelector('.grade-box');
      gradeBox.innerText = '';
      gradeBox.style.background = 'none';
      return;
    }
   

    
    if (marks < 0 || marks > 100 || credit <= 0) {
      alert('Please enter valid marks (0–100) and credit hours greater than 0.');
      incompleteCourses++;
      return;
    }
    

    const grade = getGrade(marks);
    const point = {
      'A': 4.00, 'A-': 3.75, 'B+': 3.50, 'B': 3.00,
      'C+': 2.50, 'C': 2.00,
      'D': 1.50, 'F': 0.00
    }[grade];

    const gradeBox = row.querySelector('.grade-box');
    gradeBox.innerText = grade;
    gradeBox.style.background = point >= 3.0 ? '#d4edda' : point >= 2.0 ? '#fff3cd' : '#f8d7da';
    gradeBox.style.color = '#333';

    semesterPoints += point * credit;
    semesterCredits += credit;
  });

  const semesterResult = semesterSection.querySelector('.semesterResult');
  
  // Ensure cumulative CGPA display exists
  let cumulativeResult = semesterSection.querySelector('.cumulativeCGPA');
  if (!cumulativeResult) {
      cumulativeResult = document.createElement('div');
      cumulativeResult.className = 'cumulativeCGPA';
      semesterSection.appendChild(cumulativeResult);
  }


  if (semesterCredits > 0) {
    const semesterGPA = (semesterPoints / semesterCredits).toFixed(2);
    const semesterClass = classifyGPA(semesterGPA);
    semesterResult.innerText = `Semester GPA: ${semesterGPA} (Total Credits: ${semesterCredits}) - Class: ${semesterClass}`;

    // Calculate cumulative up to this semester
    let cumulativePoints = 0;
    let cumulativeCredits = 0;
    const allSections = document.querySelectorAll('.semesterSection');

    for (let i = 0; i <= Array.from(allSections).indexOf(semesterSection); i++) {
      const rows = allSections[i].querySelectorAll('.courseRow');
      rows.forEach(row => {
        const inputs = row.querySelectorAll('input');
        const courseName = inputs[0].value.trim();
        const credit = parseFloat(inputs[1].value);
        const marks = parseFloat(inputs[2].value);
        if (courseName === '' || isNaN(credit) || isNaN(marks)) return;

        const grade = getGrade(marks);
        const point = {
         'A': 4.00, 'A-': 3.75, 'B+': 3.50, 'B': 3.00,
          'C+': 2.50, 'C': 2.00,
          'D': 1.50, 'F': 0.00
        }[grade];

        cumulativePoints += point * credit;
        cumulativeCredits += credit;
      });
    }

    const cgpa = (cumulativePoints / cumulativeCredits).toFixed(2);
    const cgpaClass = classifyGPA(cgpa);
    cumulativeResult.innerText = `Cumulative CGPA: ${cgpa} (Credits: ${cumulativeCredits}) - Class: ${cgpaClass}`;
  

    updateMainCGPA();

    if (incompleteCourses > 0) {
      // Change alert to a simple message to avoid disrupting flow, or remove it entirely if handled by a better UI
    }
  } else {
    semesterResult.innerText = 'Please enter at least one valid course with course name, credit hours and marks.';
    cumulativeResult.innerText = '';
    updateMainCGPA();
  }
  
  // Save data after calculation
  saveGPAData();
}

function updateMainCGPA() {
  let totalPoints = 0;
  let totalCredits = 0;

  const allSections = document.querySelectorAll('.semesterSection');
  allSections.forEach(section => {
    const rows = section.querySelectorAll('.courseRow');
    rows.forEach(row => {
      const inputs = row.querySelectorAll('input');
      const courseName = inputs[0].value.trim();
      const credit = parseFloat(inputs[1].value);
      const marks = parseFloat(inputs[2].value);
      if (courseName === '' || isNaN(credit) || isNaN(marks)) return;

      const grade = getGrade(marks);
      const point = {
        'A': 4.00, 'A-': 3.75, 'B+': 3.50, 'B': 3.00,
        'C+': 2.50, 'C': 2.00,
        'D': 1.50, 'F': 0.00
      }[grade];

      totalPoints += point * credit;
      totalCredits += credit;
    });
  });
  
  const cgpaResultDiv = document.getElementById('cgpaResult');

  if (totalCredits > 0) {
    const cgpa = (totalPoints / totalCredits).toFixed(2);
    const cgpaClass = classifyGPA(cgpa);
    cgpaResultDiv.innerText = `CGPA: ${cgpa} (Total Credits: ${totalCredits}) - Class: ${cgpaClass}`;
  } else {
    cgpaResultDiv.innerText = 'Enter course details to calculate overall CGPA.';
  }
}

function calculateCGPA() {
    // This button mostly triggers the final save and re-display of the overall CGPA
    updateMainCGPA();
    saveGPAData();
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
  
  // Add an initial course row using the helper
  const courseInputsDiv = semesterSection.querySelector('.courseInputs');
  courseInputsDiv.appendChild(createCourseRow()); 

  semesterInputs.appendChild(semesterSection);
  
  // Save data after adding a new semester
  saveGPAData();
}


function resetForm() {
  // Clear saved data for the current user
  clearSavedGPAData();

  document.getElementById('semesterInputs').innerHTML = '';
  document.getElementById('cgpaResult').innerText = '';
  addSemester(); // Start with a fresh semester
  document.getElementById('cgpaResult').textContent = '';
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
      <img src="gimpa.png" width="100" />
      <h2>Ghana Institute of Management and Public Administration(GIMPA) - GPA Report</h2>
    </div>
  `;

  const semesters = document.querySelectorAll('.semesterSection');

  let summaryTable = `
    <h3>Semester Summary</h3>
    <table border="1" cellspacing="0" cellpadding="8" width="100%">
      <tr>
        <th>Semester</th>
        <th>Course Names</th>
        <th>Total Credit Hours</th>
        <th>Semester GPA</th>
        <th>Cumulative CGPA</th>
        <th>Class</th>
      </tr>
  `;

  semesters.forEach((semester, index) => {
    const courseRows = semester.querySelectorAll('.courseRow');
    let courseNames = [];
    let totalCredits = 0;

    courseRows.forEach(row => {
      const inputs = row.querySelectorAll('input');
      const courseName = inputs[0]?.value || '';
      const credit = parseFloat(inputs[1]?.value) || 0;

      if (courseName) courseNames.push(courseName);
      totalCredits += credit;
    });

    const semesterResultText = semester.querySelector('.semesterResult')?.innerText || '';
    const cumulativeResultText = semester.querySelector('.cumulativeCGPA')?.innerText || '';

    const gpaMatch = semesterResultText.match(/GPA:\s*([\d.]+)/i);
    const cgpaMatch = cumulativeResultText.match(/CGPA:\s*([\d.]+)/i);
    const classMatch = cumulativeResultText.match(/Class:\s*(.+)/i);

    const gpa = gpaMatch ? gpaMatch[1] : '-';
    const cgpa = cgpaMatch ? cgpaMatch[1] : '-';
    const className = classMatch ? classMatch[1] : '-';

    summaryTable += `
      <tr>
        <td>Semester ${index + 1}</td>
        <td>${courseNames.join(', ')}</td>
        <td>${totalCredits}</td>
        <td>${gpa}</td>
        <td>${cgpa}</td>
        <td>${className}</td>
      </tr>
    `;
  });

  summaryTable += '</table><br/>';
  printContent += summaryTable;

  // Print detailed course info per semester
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
      const grade = row.querySelector('.grade-box').innerText || '-';
      printContent += `
        <tr>
          <td>${inputs[0]?.value || ''}</td>
          <td>${inputs[1]?.value || ''}</td>
          <td>${inputs[2]?.value || ''}</td>
          <td>${grade}</td>
        </tr>
      `;
    });

    const semesterResult = semester.querySelector('.semesterResult')?.innerText || '';
    printContent += `</table><p><strong>${semesterResult}</strong></p><br/>`;
  });

  const overallGPAInfo = document.getElementById('cgpaResult').innerText;
  printContent += `<hr/><p><strong>${overallGPAInfo}</strong></p>`;

  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <html><head><title>Print Results</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #999; text-align: center; padding: 8px; }
      img { margin-bottom: 10px; }
      @media print { button { display: none; } }
    </style>
    </head><body>${printContent}</body></html>
  `);
  printWindow.document.close();
  printWindow.print();
}


// ==========================================================
// PERSISTENCE FUNCTIONS (UPDATED TO USE JSON)
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
    
    // Save CGPA result as plain text
    const cgpa = document.getElementById("cgpaResult").innerHTML;
    localStorage.setItem(getIndexKey("gpaCalculatorCGPA"), cgpa);
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

  if (savedCGPA) {
    document.getElementById("cgpaResult").innerHTML = savedCGPA;
  }
}

// CLEAR saved data using a user-specific key
function clearSavedGPAData() {
  localStorage.removeItem(getIndexKey("gpaCalculatorData"));
  localStorage.removeItem(getIndexKey("gpaCalculatorCGPA"));
}
