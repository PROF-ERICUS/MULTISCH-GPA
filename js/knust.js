let semesterCount = 0;

function addSemester() {
  semesterCount++;
  const semDiv = document.createElement("div");
  semDiv.className = "semester";
  semDiv.id = `semester-${semesterCount}`;
  semDiv.innerHTML = `
    <h3>Semester ${semesterCount}</h3>
    <table id="table-${semesterCount}">
      <tr>
        <th>Course Name</th>
        <th>Credit Hours</th>
        <th>Marks</th>
        <th>Grade</th>
        <th>Remark</th>
        <th>Action</th>
      </tr>
    </table>
    <button onclick="addCourse(${semesterCount})">+ Add Course</button>
    <div id="result-${semesterCount}"></div>
  `;
  document.getElementById("semesters").appendChild(semDiv);
}

function addCourse(semId) {
  const table = document.getElementById(`table-${semId}`);
  const row = table.insertRow();
  row.innerHTML = `
    <td><input type="text" placeholder="e.g. WEB DESIGN"/></td>
    <td><input type="number" min="1" placeholder="3"/></td>
    <td><input type="number" min="0" max="100" oninput="updateGrade(this, ${semId})"/></td>
    <td class="grade"></td>
    <td class="remark"></td>
    <td><button onclick="removeRow(this)">Remove</button></td>
  `;
}

function removeRow(btn) {
  const row = btn.parentElement.parentElement;
  const semId = getSemesterIdFromTableId(row.closest("table").id);
  row.parentElement.removeChild(row);
  calculateSemesterCWA(semId);
  calculateCWA(); // 👈 recalculate overall after row is removed
}


function updateGrade(input, semId) {
  const mark = parseFloat(input.value);
  const gradeCell = input.parentElement.nextElementSibling;
  const remarkCell = gradeCell.nextElementSibling;

  let grade = '', remark = '';
  if (mark >= 70) { grade = 'A'; remark = 'Excellent'; }
  else if (mark >= 60) { grade = 'B'; remark = 'Very Good'; }
  else if (mark >= 50) { grade = 'C'; remark = 'Good'; }
  else if (mark >= 40) { grade = 'D'; remark = 'Pass'; }
  else if (mark >= 0)  { grade = 'F'; remark = 'Fail'; }

  gradeCell.innerText = grade;
  remarkCell.innerText = remark;

  calculateSemesterCWA(semId);
}
function calculateSemesterCWA(semId) {
  const rows = document.querySelectorAll(`#table-${semId} tr:not(:first-child)`);
  let totalWeighted = 0;
  let totalCredits = 0;
  let totalMarks = 0;
  let courseCount = 0;

  rows.forEach(row => {
    const credit = parseFloat(row.cells[1].querySelector("input")?.value || 0);
    const mark = parseFloat(row.cells[2].querySelector("input")?.value || 0);
    if (credit && !isNaN(mark)) {
      totalCredits += credit;
      totalWeighted += credit * mark;
      totalMarks += mark;
      courseCount++;
    }
  });

  const semesterCWA = totalCredits ? (totalWeighted / totalCredits).toFixed(2) : "0.00";
  const semesterSWA = totalCredits ? (totalWeighted / totalCredits).toFixed(2) : "0.00";
  const classRemark = getClassRemark(semesterCWA);

  document.getElementById(`result-${semId}`).innerHTML = `
    <strong>Total Marks:</strong> ${totalWeighted.toFixed(2)}<br/>
    <strong>Total Credit Hours:</strong> ${totalCredits}<br/>
    <strong>Semester ${semId} Average:</strong> ${semesterSWA}<br/>
    <strong>Semester ${semId} CWA:</strong> ${semesterCWA} (${classRemark})
  `;

  calculateCWA(); // Update overall automatically
}


function calculateCWA() {
  let totalWeighted = 0;
  let totalCredits = 0;

  for (let i = 1; i <= semesterCount; i++) {
    const rows = document.querySelectorAll(`#table-${i} tr:not(:first-child)`);
    rows.forEach(row => {
      const credit = parseFloat(row.cells[1].querySelector("input")?.value || 0);
      const mark = parseFloat(row.cells[2].querySelector("input")?.value || 0);
      if (credit && !isNaN(mark)) {
        totalCredits += credit;
        totalWeighted += credit * mark;
      }
    });
  }

  const cwa = totalCredits ? (totalWeighted / totalCredits).toFixed(2) : 0;
  const classRemark = getClassRemark(cwa);

  document.getElementById("overallCWA").innerHTML = `
    <h3>Overall CWA: ${cwa} (${classRemark})</h3>
    <p><strong>Total Marks:</strong> ${totalWeighted.toFixed(2)}</p>
    <p><strong>Total Credit Hours:</strong> ${totalCredits}</p>
  `;
}

function getClassRemark(cwa) {
  cwa = parseFloat(cwa);
  if (cwa >= 70) return "First Class";
  else if (cwa >= 60) return "Second Class Upper";
  else if (cwa >= 50) return "Second Class Lower";
  else if (cwa >= 45) return "Pass";
  else return "Fail";
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
};

document.getElementById('modeToggle').addEventListener('change', function () {
  const isDarkMode = this.checked;
  document.body.classList.toggle('dark', isDarkMode);
  localStorage.setItem('darkMode', isDarkMode);
});

function resetCalculator() {
  document.getElementById("semesters").innerHTML = "";
  document.getElementById("overallCWA").innerHTML = "";
  semesterCount = 0;
}

function getSemesterIdFromTableId(tableId) {
  return parseInt(tableId.split("-")[1]);
}

function printResults() {
  let printContent = `
    <div style="text-align:center;">
      <img src="ucc logo.jpg" width="100" />
      <h2>University of Cape Coast - CWA Report</h2>
      <p>Date: ${new Date().toLocaleDateString()}</p>
    </div>
  `;

  const semesters = document.querySelectorAll('.semester');
  let summaryTable = `
    <h3>Semester Summary</h3>
    <table border="1" cellspacing="0" cellpadding="8" width="100%">
      <tr><th>Semester</th><th>CWA</th><th>Credits</th><th>Class</th></tr>
  `;

  semesters.forEach((semester, index) => {
    const semesterResult = semester.querySelector('.semesterResult').innerText;
    const cwaMatch = semesterResult.match(/CWA: ([\d.]+).*?Credits: (\d+).*?Class: (.+)/i);
    if (cwaMatch) {
      summaryTable += `
        <tr>
          <td>Semester ${index + 1}</td>
          <td>${cwaMatch[1]}</td>
          <td>${cwaMatch[2]}</td>
          <td>${cwaMatch[3]}</td>
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

  const overallCWAInfo = document.getElementById('overallCWA').innerText;
  printContent += `<hr/><p><strong>${overallCWAInfo}</strong></p>`;

  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <html><head><title>Print Results</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #999; text-align: center; }
      img { margin-bottom: 10px; }
      h2, h3 { margin-bottom: 5px; }
      @media print { button { display: none; } }
    </style>
    </head><body>${printContent}</body></html>
  `);
  printWindow.document.close();
  printWindow.print();
}
