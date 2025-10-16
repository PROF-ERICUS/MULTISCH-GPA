// -------------------- GRADE LOGIC --------------------
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

// -------------------- USER SESSION --------------------
let currentUser = localStorage.getItem('currentUser') || '';

function askForUser() {
  if (!currentUser) {
    currentUser = prompt('Enter your name or student ID to load/save your records:');
    if (currentUser) {
      localStorage.setItem('currentUser', currentUser);
    } else {
      currentUser = 'guest';
    }
  }
  document.getElementById('usernameDisplay').innerText = currentUser;
}

// -------------------- STORAGE HELPERS --------------------
function getUserKey() {
  return `gctuData_${currentUser}`;
}

function saveData() {
  const semesters = [];
  document.querySelectorAll('.semesterSection').forEach((semester) => {
    const courses = [];
    semester.querySelectorAll('.courseRow').forEach((row) => {
      const inputs = row.querySelectorAll('input');
      courses.push({
        name: inputs[0].value,
        credit: inputs[1].value,
        marks: inputs[2].value,
      });
    });
    semesters.push(courses);
  });
  localStorage.setItem(getUserKey(), JSON.stringify(semesters));
}

function loadData() {
  const saved = localStorage.getItem(getUserKey());
  if (!saved) return;
  const semesters = JSON.parse(saved);
  const container = document.getElementById('semesterInputs');
  container.innerHTML = '';

  semesters.forEach((courses, i) => {
    const semesterSection = document.createElement('div');
    semesterSection.className = 'semesterSection';
    semesterSection.innerHTML = `
      <h4>Semester ${i + 1}</h4>
      <div class="courseInputs"></div>
      <button type="button" onclick="addCourse(this)">Add Course</button>
      <button type="button" onclick="calculateSemesterGPA(this)">Calculate Semester GPA</button>
      <div class="semesterResult"></div>
      <div class="cumulativeCGPA"></div>
    `;
    const courseContainer = semesterSection.querySelector('.courseInputs');
    courses.forEach((course) => {
      const row = document.createElement('div');
      row.className = 'courseRow';
      row.innerHTML = `
        <input type="text" placeholder="Course Name" value="${course.name || ''}" required>
        <input type="number" placeholder="Credit Hours" min="1" value="${course.credit || ''}" required>
        <input type="number" placeholder="Marks (0-100)" min="0" max="100" value="${course.marks || ''}" required>
        <span class="grade-box"></span>
        <button type="button" class="remove-btn" onclick="removeCourse(this)">×</button>
      `;
      courseContainer.appendChild(row);
    });
    container.appendChild(semesterSection);
  });
}

// -------------------- UI FUNCTIONS --------------------
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
  attachAutoSave(row);
  saveData();
}

function removeCourse(button) {
  button.parentElement.remove();
  saveData();
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
  attachAutoSave(semesterSection);
  saveData();
}

// -------------------- GPA CALCULATIONS --------------------
function calculateSemesterGPA(button) {
  const semesterSection = button.closest('.semesterSection');
  const courseRows = semesterSection.querySelectorAll('.courseRow');
  let semesterPoints = 0, semesterCredits = 0;
  let hasInvalid = false;
  let hasOver100 = false;

  courseRows.forEach((row) => {
    const inputs = row.querySelectorAll('input');
    const credit = parseFloat(inputs[1].value);
    const marks = parseFloat(inputs[2].value);

    // 🚨 Missing values
    if (isNaN(credit) || isNaN(marks)) {
      hasInvalid = true;
      return;
    }

    // 🚨 Marks greater than 100
    if (marks > 100) {
      hasOver100 = true;
      return;
    }

    const grade = getGrade(marks);
    const point = {
      'A': 4.0, 'A-': 3.75, 'B+': 3.5, 'B': 3.25,
      'B-': 3.0, 'C+': 2.75, 'C': 2.5, 'C-': 2.0,
      'D': 1.5, 'F': 0.0
    }[grade];

    row.querySelector('.grade-box').innerText = grade;
    semesterPoints += point * credit;
    semesterCredits += credit;
  });

  // 🧾 Handle invalid input alerts
  if (hasInvalid) {
    alert("Please enter both Credit Hours and Marks for all courses before calculating GPA.");
    return;
  }

  if (hasOver100) {
    alert("Invalid marks entered! Marks cannot be greater than 100.");
    return;
  }

  if (semesterCredits === 0) {
    alert("Please add at least one valid course before calculating GPA.");
    return;
  }

  // ✅ Calculate GPA
  const gpa = (semesterPoints / semesterCredits).toFixed(2);
  semesterSection.querySelector('.semesterResult').innerText = `Semester GPA: ${gpa}`;

  updateMainCGPA();
  saveData();
}



function updateMainCGPA() {
  let totalPoints = 0, totalCredits = 0;
  document.querySelectorAll('.semesterSection').forEach((section) => {
    section.querySelectorAll('.courseRow').forEach((row) => {
      const inputs = row.querySelectorAll('input');
      const credit = parseFloat(inputs[1].value);
      const marks = parseFloat(inputs[2].value);
      if (isNaN(credit) || isNaN(marks)) return;
      const grade = getGrade(marks);
      const point = {
        'A': 4.0, 'A-': 3.75, 'B+': 3.5, 'B': 3.25,
        'B-': 3.0, 'C+': 2.75, 'C': 2.5, 'C-': 2.0,
        'D': 1.5, 'F': 0.0
      }[grade];
      totalPoints += point * credit;
      totalCredits += credit;
    });
  });
  if (totalCredits === 0) return;
  const cgpa = (totalPoints / totalCredits).toFixed(2);
  const cgpaClass = classifyGPA(cgpa);
  document.getElementById('cgpaResult').innerText = `CGPA: ${cgpa} (Credits: ${totalCredits}) - Class: ${cgpaClass}`;
  saveData();
}

// -------------------- RESET, CLEAR, POPUP --------------------
function resetForm() {
  if (!confirm('Reset all data for this user?')) return;
  localStorage.removeItem(getUserKey());
  document.getElementById('semesterInputs').innerHTML = '';
  document.getElementById('cgpaResult').innerText = '';
  addSemester();
}

function clearHistory() {
  localStorage.removeItem(getUserKey());
  alert(`All saved data for ${currentUser} cleared.`);
}

function switchUser() {
  localStorage.removeItem('currentUser');
  location.reload();
}

function closePopup() {
  document.getElementById('popup').style.display = 'none';
}

// -------------------- AUTO SAVE BIND --------------------
function attachAutoSave(container) {
  container.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', saveData);
  });
}

// -------------------- DARK MODE + LOAD --------------------
window.onload = function () {
  askForUser();
  setTimeout(() => (document.getElementById('popup').style.display = 'flex'), 500);

  const darkModePreference = localStorage.getItem(`darkMode_${currentUser}`) === 'true';
  document.getElementById('modeToggle').checked = darkModePreference;
  document.body.classList.toggle('dark', darkModePreference);

  loadData();
  if (document.querySelectorAll('.semesterSection').length === 0) addSemester();
  document.querySelectorAll('.semesterSection').forEach(attachAutoSave);
};

document.getElementById('modeToggle').addEventListener('change', function () {
  const isDarkMode = this.checked;
  document.body.classList.toggle('dark', isDarkMode);
  localStorage.setItem(`darkMode_${currentUser}`, isDarkMode);
});
