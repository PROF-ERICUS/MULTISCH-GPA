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

function addCourse(button) {
  const courseInputs = button.previousElementSibling;
  const row = document.createElement('div');
  row.className = 'courseRow';
  row.innerHTML = `
    <input type="text" placeholder="Course Name" required>
    <input type="number" placeholder="Credit Hours" min="1" required>
    <input type="number" placeholder="Marks (0-100)" min="0" max="100" required>
    <span class="grade-box"></span>
    <button type="button" class="remove-btn" onclick="removeCourse(this)">×</button>
  `;
  courseInputs.appendChild(row);
}

function removeCourse(button) {
  const row = button.parentElement;
  const semesterSection = row.closest('.semesterSection');
  row.remove();
  calculateSemesterGPA(semesterSection.querySelector('button[onclick*="calculateSemesterGPA"]'));
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
      const credit = parseFloat(inputs[1].value);
      const marks = parseFloat(inputs[2].value);
  
      if (isNaN(credit) || isNaN(marks)) {
        incompleteCourses++;
        return;
      }
      
      if (marks < 0 || marks > 100 || credit <= 0) {
        alert('Please enter valid marks (0–100) and credit hours greater than 0.');
        incompleteCourses++;
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
  
      // Recalculate CGPA across all semesters
      let overallPoints = 0;
      let overallCredits = 0;
      const allSemesterSections = document.querySelectorAll('.semesterSection');
  
      allSemesterSections.forEach(section => {
        const rows = section.querySelectorAll('.courseRow');
        rows.forEach(row => {
          const inputs = row.querySelectorAll('input');
          const credit = parseFloat(inputs[1].value);
          const marks = parseFloat(inputs[2].value);
          if (isNaN(credit) || isNaN(marks)) return;
  
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
  
          overallPoints += point * credit;
          overallCredits += credit;
        });
      });
  
      const cgpa = (overallPoints / overallCredits).toFixed(2);
      const cgpaClassLabel = classifyGPA(cgpa);
  
      // Update semester result
      let resultHTML = `
        <strong>Semester GPA:</strong> ${gpa} (Credits: ${semesterCredits}) - Class: ${classLabel}
      `;
  
      if (semesterIndex >= 2) {
        resultHTML += `<br/><strong>CGPA:</strong> ${cgpa} (Total Credits: ${overallCredits}) - Class: ${cgpaClassLabel}`;
      }
  
      semesterResult.innerHTML = resultHTML;
  
      // Update CGPA at bottom
      document.getElementById('cgpaResult').innerText = `CGPA: ${cgpa} (Total Credits: ${overallCredits}) - Class: ${cgpaClassLabel}`;
  
      // FGPA Calculation
      const cgpa100 = parseFloat(cgpa);
      const cgpa200 = parseFloat(cgpa);
      const cgpa300 = parseFloat(cgpa);
      const cgpa400 = parseFloat(cgpa);
      const FGPA = ((cgpa100 * 1) + (cgpa200 * 1) + (cgpa300 * 2) + (cgpa400 * 2)) / 6;
      const finalClass = classifyGPA(FGPA);
  
      if (allSemesterSections.length >= 2) {
        document.getElementById('fgpaResult').innerText = `FGPA: ${FGPA.toFixed(2)} - Class: ${finalClass}`;
      } else {
        document.getElementById('fgpaResult').innerText = '';
      }
      
      if (incompleteCourses > 0) {
        alert(`GPA calculated. Add credit hours and marks for the remaining ${incompleteCourses} course(s).`);
      }
  
    } else {
      semesterResult.innerText = 'Please enter at least one valid course with credit hours and marks.';
    }
  }
  


function updateMainCGPA() {
  let totalPoints = 0;
  let totalCredits = 0;

  const allSections = document.querySelectorAll('.semesterSection');
  allSections.forEach(section => {
    const rows = section.querySelectorAll('.courseRow');
    rows.forEach(row => {
      const inputs = row.querySelectorAll('input');
      const credit = parseFloat(inputs[1].value);
      const marks = parseFloat(inputs[2].value);
      if (isNaN(credit) || isNaN(marks)) return;

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

      totalPoints += point * credit;
      totalCredits += credit;
    });
  });

  const cgpa = (totalPoints / totalCredits).toFixed(2);
  const cgpaClass = classifyGPA(cgpa);
  document.getElementById('cgpaResult').innerText = `CGPA: ${cgpa} (Total Credits: ${totalCredits}) - Class: ${cgpaClass}`;
}

function addSemester() {
  const semesterInputs = document.getElementById('semesterInputs');
  const semesterCount = semesterInputs.getElementsByClassName('semesterSection').length + 1;

  const semesterSection = document.createElement('div');
  semesterSection.className = 'semesterSection';
  semesterSection.innerHTML = `
    <h4>Semester ${semesterCount}</h4>
    <div class="courseInputs">
      <div class="courseRow">
        <input type="text" placeholder="Course Name" required>
        <input type="number" placeholder="Credit Hours" min="1" required>
        <input type="number" placeholder="Marks (0-100)" min="0" max="100" required>
        <span class="grade-box"></span>
      </div>
    </div>
    <button type="button" onclick="addCourse(this)">Add Course</button>
    <button type="button" onclick="calculateSemesterGPA(this)">Calculate Semester GPA</button>
    <div class="semesterResult"></div>
    <div class="cumulativeCGPA"></div>
  `;
  semesterInputs.appendChild(semesterSection);
}


function resetForm() {
  document.getElementById('semesterInputs').innerHTML = '';
  document.getElementById('cgpaResult').innerText = '';
  addSemester();
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

  addSemester();
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

      if (!isNaN(credit) && !isNaN(marks)) {
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

      const cgpa = totalPoints / totalCredits;
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

    const semesterResult = semester.querySelector('.semesterResult').innerText;
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

