function getGrade(marks) {
    if (marks >= 80) return 'A';
    
    if (marks >= 75) return 'B+';
    if (marks >= 70) return 'B';
    
    if (marks >= 65) return 'C+';
    if (marks >= 60) return 'C';
    if (marks >= 55) return 'D+';
    if (marks >= 50) return 'D';
    if (marks >= 45) return 'D';

    return 'F';
  }
  
  function classifyGPA(gpa) {
    if (gpa >= 3.60) return 'First Class';
    if (gpa >= 3.00) return 'Second Class Upper';
    if (gpa >= 2.50) return 'Second Class Lower';
    if (gpa >= 2.00) return 'Pass';
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
  
    courseRows.forEach(row => {
      const inputs = row.querySelectorAll('input');
      const credit = parseFloat(inputs[1].value);
      const marks = parseFloat(inputs[2].value);
      const grade = getGrade(marks);
      const point = {
        'A': 4.00, 'B+': 3.50, 'B': 3.00, 
        'C+': 2.25, 'C': 2.00, 'D+': 1.50, 'D': 1.00, 'E': 0.50, 'F': 0
      }[grade];
  
      const gradeBox = row.querySelector('.grade-box');
      gradeBox.innerText = grade;
      gradeBox.style.background = point >= 3.0 ? '#d4edda' : point >= 2.0 ? '#fff3cd' : '#f8d7da';
      gradeBox.style.color = '#333';
  
      if (point !== undefined) {
        semesterPoints += point * credit;
        semesterCredits += credit;
      }
    });
  
    const semesterResult = semesterSection.querySelector('.semesterResult');
    if (semesterCredits > 0) {
      const gpa = (semesterPoints / semesterCredits).toFixed(2);
      const classLabel = classifyGPA(gpa);
  
      totalGpaPoints += semesterPoints;
      totalCredits += semesterCredits;
  
      const cgpa = (totalGpaPoints / totalCredits).toFixed(2);
      const cgpaClassLabel = classifyGPA(cgpa);
  
      semesterResult.innerText = `Semester GPA: ${gpa} (Total Credits: ${semesterCredits}) - Class: ${classLabel}`;
      document.getElementById('cgpaResult').innerText = `CGPA: ${cgpa} (Total Credits: ${totalCredits}) - Class: ${cgpaClassLabel}`;
    } else {
      semesterResult.innerText = 'Please enter valid course information.';
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


function printResults() {
  let printContent = `
    <div style="text-align:center;">
      <img src="legon logo.jpg" width="100" />
      <h2>University of Ghana-Legon - GPA Report</h2>
    </div>
  `;

  const semesters = document.querySelectorAll('.semesterSection');
  let summaryTable = `
    <h3>Semester Summary</h3>
    <table border="1" cellspacing="0" cellpadding="8" width="100%">
      <tr><th>Semester</th><th>GPA</th><th>Credits</th><th>Class</th></tr>
  `;

  semesters.forEach((semester, index) => {
    const semesterTitle = `Semester ${index + 1}`;
    const semesterResult = semester.querySelector('.semesterResult').innerText;
    const gpaMatch = semesterResult.match(/GPA: ([\d.]+).*?Credits: (\d+).*?Class: (.+)/i);

    if (gpaMatch) {
      summaryTable += `<tr>
        <td>${semesterTitle}</td>
        <td>${gpaMatch[1]}</td>
        <td>${gpaMatch[2]}</td>
        <td>${gpaMatch[3]}</td>
      </tr>`;
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
  printWindow.document.write(`<html><head><title>Print Results</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { border-collapse: collapse; }
      th, td { border: 1px solid #999; text-align: center; }
      img { margin-bottom: 10px; }
      @media print {
        button { display: none; }
      }
    </style>
  </head><body>${printContent}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

