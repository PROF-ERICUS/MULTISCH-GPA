function getGrade(marks) {
  if (marks >= 70) return 'A';
  if (marks >= 60) return 'B';
  if (marks >= 50) return 'C';
  if (marks >= 40) return 'D';
  return 'F';
}

function classifyGPA(gpa) {
  if (gpa >= 3.60) return 'First Class';
    if (gpa >= 3.00) return 'Second Class Upper Division';
    if (gpa >= 2.00) return 'Second Class Lower Division';
    if (gpa >= 1.00) return 'Pass';
    return 'Fail';
}

let totalGpaPoints = 0;
let totalCredits = 0;

function addCourse(button) {
  const courseInputs = button.previousElementSibling;
  const row = document.createElement('div');
  row.className = 'courseRow';
  row.innerHTML = `
    <input type="text" placeholder="Course Name" required>
    <input type="number" placeholder="Credit Hours" min="1" required>
    <input type="number" placeholder="Marks (0-100)" min="0" max="100" required>
    <span class="grade-box"></span>
  `;
  courseInputs.appendChild(row);
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

    const grade = getGrade(marks);
    const point = {
      'A': 4.00,
      'B': 3.00,
      'C': 2.00,
      'D': 1.00,
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
    semesterResult.innerText = `Semester GPA: ${gpa} (Total Credits: ${semesterCredits}) - Class: ${classLabel}`;

    // Recalculate CGPA
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
          'B': 3.00,
          'C': 2.00,
          'D': 1.00,
          'F': 0.00
        }[grade];

        overallPoints += point * credit;
        overallCredits += credit;
      });
    });

    const cgpa = (overallPoints / overallCredits).toFixed(2);
    const cgpaClassLabel = classifyGPA(cgpa);
    document.getElementById('cgpaResult').innerText = `CGPA: ${cgpa} (Total Credits: ${overallCredits}) - Class: ${cgpaClassLabel}`;

    if (incompleteCourses > 0) {
      alert(`GPA calculated. Add credit hours and marks for the remaining ${incompleteCourses} course(s).`);
    }
  } else {
    semesterResult.innerText = 'Please enter at least one valid course with credit hours and marks.';
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
  `;
  semesterInputs.appendChild(semesterSection);
}

function calculateCGPA() {
  const cgpa = (totalGpaPoints / totalCredits).toFixed(2);
  const cgpaClassLabel = classifyGPA(cgpa);
  document.getElementById('cgpaResult').innerText = `CGPA: ${cgpa} (Total Credits: ${totalCredits}) - Class: ${cgpaClassLabel}`;
}

function resetForm() {
  document.getElementById('semesterInputs').innerHTML = '';
  document.getElementById('cgpaResult').innerText = '';
  totalGpaPoints = 0;
  totalCredits = 0;
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

function openCwaModal() {
  document.getElementById('cwaModal').style.display = 'block';
}

function closeCwaModal() {
  document.getElementById('cwaModal').style.display = 'none';
}

function convertToCwa() {
  const valueType = document.getElementById('valueType').value;
  const value = parseFloat(document.getElementById('valueInput').value);

  if (isNaN(value)) {
    document.getElementById('cwaResult').innerText = 'Please enter a valid number.';
    return;
  }

  // Simple conversion formula — can be adjusted if needed
  const cwa = value * 25;

  document.getElementById('cwaResult').innerText = `Converted ${valueType.toUpperCase()} to CWA: ${cwa.toFixed(2)}`;
}

// Optional: close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('cwaModal');
  if (event.target == modal) {
    modal.style.display = "none";
  }
}


function printResults() {
  let printContent = `
    <div style="text-align:center;">
      <img src="knust.jpg" width="100" />
        <h2>Kwame Nkrumah University of Science and Technology -GPA Report</h2>
    </div>
  `;

  const semesters = document.querySelectorAll('.semesterSection');
  let summaryTable = `
    <h3>Semester Summary</h3>
    <table border="1" cellspacing="0" cellpadding="8" width="100%">
      <tr><th>Semester</th><th>GPA</th><th>Credits</th><th>Class</th></tr>
  `;

  semesters.forEach((semester, index) => {
    const semesterResult = semester.querySelector('.semesterResult').innerText;
    const gpaMatch = semesterResult.match(/GPA: ([\d.]+).*?Credits: (\d+).*?Class: (.+)/i);
    if (gpaMatch) {
      summaryTable += `
        <tr>
          <td>Semester ${index + 1}</td>
          <td>${gpaMatch[1]}</td>
          <td>${gpaMatch[2]}</td>
          <td>${gpaMatch[3]}</td>
        </tr>
      `;
    }
  });

  summaryTable += '</table><br/>';
  printContent += summaryTable;

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

  const overallGPAInfo = document.getElementById('cgpaResult').innerText;
  printContent += `<hr/><p><strong>${overallGPAInfo}</strong></p>`;

  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <html><head><title>Print Results</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { border-collapse: collapse; }
      th, td { border: 1px solid #999; text-align: center; }
      img { margin-bottom: 10px; }
      @media print { button { display: none; } }
    </style>
    </head><body>${printContent}</body></html>
  `);
  printWindow.document.close();
  printWindow.print();
}
