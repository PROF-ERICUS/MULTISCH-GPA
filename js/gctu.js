function getGrade(marks) {
  if (marks >= 80) return 'A';
  if (marks >= 75) return 'A-';
  if (marks >= 70) return 'B+';
  if (marks >= 65) return 'B';
  if (marks >= 60) return 'B-';
  if (marks >= 55) return 'C+';
  if (marks >= 50) return 'C';
  if (marks >= 45) return 'C-';
  if (marks >= 40) return 'D';
  return 'F';
}

function classifyGPA(gpa) {
  if (gpa >= 3.60) return 'First Class Honours';
  if (gpa >= 3.00) return 'Second Class Honours Upper';
  if (gpa >= 2.50) return 'Second Class Honours Lower';
  if (gpa >= 2.00) return 'Third Class Honours';
  if (gpa >= 1.50) return 'Pass';
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
      'A': 4.00, 'A-': 3.75, 'B+': 3.50, 'B': 3.25,
      'B-': 3.00, 'C+': 2.75, 'C': 2.50, 'C-': 2.00,
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
  const cumulativeResult = semesterSection.querySelector('.cumulativeCGPA');

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
        const credit = parseFloat(inputs[1].value);
        const marks = parseFloat(inputs[2].value);
        if (isNaN(credit) || isNaN(marks)) return;

        const grade = getGrade(marks);
        const point = {
          'A': 4.00, 'A-': 3.75, 'B+': 3.50, 'B': 3.25,
          'B-': 3.00, 'C+': 2.75, 'C': 2.50, 'C-': 2.00,
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
        'A': 4.00, 'A-': 3.75, 'B+': 3.50, 'B': 3.25,
        'B-': 3.00, 'C+': 2.75, 'C': 2.50, 'C-': 2.00,
        'D': 1.50, 'F': 0.00
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
      <img src="gctu logo.jpg" width="100" />
      <h2>Ghana Communication Technology University - GPA Report</h2>
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

