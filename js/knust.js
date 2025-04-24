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
    <td><input type="number" min="1" placeholder="3" oninput="validateCredit(this, ${semId})"/></td>
    <td><input type="number" min="0" max="100" oninput="validateMarks(this, ${semId})"/></td>
    <td class="grade"></td>
    <td class="remark"></td>
    <td><button onclick="removeRow(this)">Remove</button></td>
  `;
}

function validateCredit(input, semId) {
  const value = parseFloat(input.value);

  if (!isNaN(value) && value > 0) {
    input.style.border = "1px solid #ccc";
    calculateSemesterCWA(semId);
  } else {
    input.style.border = "2px solid red";
    alert("Please enter a valid credit hour (must be greater than 0)");
    input.focus();
  }
}

function validateMarks(input, semId) {
  const value = parseFloat(input.value);

  if (!isNaN(value) && value >= 0 && value <= 100) {
    input.style.border = "1px solid #ccc";
    updateGrade(input, semId);
  } else {
    input.style.border = "2px solid red";
    alert("Please enter valid marks (between 0 and 100)");
    input.focus();
  }
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

let semesterCWAs = {}; // To store each semester's CWA

function calculateSemesterCWA(semId) {
  const rows = document.querySelectorAll(`#table-${semId} tr:not(:first-child)`);
  let totalWeighted = 0;
  let totalCredits = 0;

  rows.forEach(row => {
    const credit = parseFloat(row.cells[1].querySelector("input")?.value || 0);
    const mark = parseFloat(row.cells[2].querySelector("input")?.value || 0);

    if (credit && !isNaN(mark)) {
      totalCredits += credit;
      totalWeighted += credit * mark;
    }
  });

  const semesterCWA = totalCredits ? (totalWeighted / totalCredits).toFixed(2) : "0.00";
  semesterCWAs[semId] = parseFloat(semesterCWA);

  // Calculate average of CWAs from Semester 1 to current semester
  let totalCwa = 0;
  let counted = 0;
  for (let i = 1; i <= semId; i++) {
    if (semesterCWAs[i]) {
      totalCwa += semesterCWAs[i];
      counted++;
    }
  }

  const averageCwa = counted ? (totalCwa / counted).toFixed(2) : "0.00";
  // Calculate cumulative weighted and credits up to this semester
let cumulativeWeighted = 0;
let cumulativeCredits = 0;

for (let i = 1; i <= semId; i++) {
  const rows = document.querySelectorAll(`#table-${i} tr:not(:first-child)`);
  rows.forEach(row => {
    const credit = parseFloat(row.cells[1].querySelector("input")?.value || 0);
    const mark = parseFloat(row.cells[2].querySelector("input")?.value || 0);
    if (credit && !isNaN(mark)) {
      cumulativeCredits += credit;
      cumulativeWeighted += credit * mark;
    }
  });
}

const cumulativeCWA = cumulativeCredits ? (cumulativeWeighted / cumulativeCredits).toFixed(2) : "0.00";
const classRemark = getClassRemark(semesterCWA);

document.getElementById(`result-${semId}`).innerHTML = `
  <div class="cwa-summary">
    <strong>Semester ${semId} CWA:</strong> ${semesterCWA} (${classRemark})<br/>
    <strong>Cumulative CWA up to Semester ${semId}:</strong> ${cumulativeCWA}
  </div>
`;


  calculateCWA(); // Update overall display
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
  <div class="overall-cwa-box">
    <h3>Overall CWA: ${cwa} (${classRemark})</h3>
    <p><strong>Total Weight:</strong> ${totalWeighted.toFixed(2)}</p>
    <p><strong>Total Credit Hours:</strong> ${totalCredits}</p>
  </div>
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
      <img src="knust.jpg" width="100" />
      <h2> Kwame Nkrumah University of Science and Technology(KNUST) - CWA Report</h2>
      <p>Date: ${new Date().toLocaleDateString()}</p>
    </div>
  `;

  const semesters = document.querySelectorAll('.semester');

  semesters.forEach((semester, index) => {
    printContent += `<h3>Semester ${index + 1}</h3>`;
    printContent += `
      <table border="1" cellspacing="0" cellpadding="8" width="100%">
        <tr>
          <th>Course Name</th>
          <th>Credit Hours</th>
          <th>Marks</th>
          <th>Grade</th>
          <th>Remark</th>
        </tr>
    `;

    const courseRows = semester.querySelectorAll('table tr:not(:first-child)');
    courseRows.forEach(row => {
      const courseName = row.cells[0].querySelector('input')?.value || '';
      const credit = row.cells[1].querySelector('input')?.value || '';
      const marks = row.cells[2].querySelector('input')?.value || '';
      const grade = row.cells[3]?.innerText || '';
      const remark = row.cells[4]?.innerText || '';

      printContent += `
        <tr>
          <td>${courseName}</td>
          <td>${credit}</td>
          <td>${marks}</td>
          <td>${grade}</td>
          <td>${remark}</td>
        </tr>
      `;
    });

    const resultDiv = semester.querySelector(`#result-${index + 1}`);
    if (resultDiv) {
      printContent += `</table><p><strong>${resultDiv.innerHTML}</strong></p><br/>`;
    }
  });

  const overallCWAInfo = document.getElementById('overallCWA').innerHTML;
  printContent += `<hr/><p><strong>${overallCWAInfo}</strong></p>`;

  const printWindow = window.open('', '', 'width=800,height=600');
  printWindow.document.write(`
    <html><head><title>Print Results</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      th, td { border: 1px solid #999; text-align: center; padding: 8px; }
      img { margin-bottom: 10px; }
      h2, h3 { margin-bottom: 5px; }
      @media print { button { display: none; } }
    </style>
    </head><body>${printContent}</body></html>
  `);
  printWindow.document.close();
  printWindow.print();
}
