// UCC Grading System Conversion
function getUCCGrade(marks) {
    if (marks >= 80) return 'A';
    if (marks >= 75) return 'B+';
    if (marks >= 70) return 'B';
    if (marks >= 65) return 'C+';
    if (marks >= 60) return 'C';
    if (marks >= 55) return 'D+';
    if (marks >= 50) return 'D';
    return 'F';
  }
  
  function classifyUCCGPA(gpa) {
    if (gpa >= 3.6) return 'First Class';
    if (gpa >= 3.0) return 'Second Class Upper';
    if (gpa >= 2.5) return 'Second Class Lower';
    if (gpa >= 2.0) return 'Third Class';
    if (gpa >= 1.5) return 'Pass';
    return 'Fail';
  }
  
  let totalUccPoints = 0;
  let totalUccCredits = 0;
  
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
      const grade = getUCCGrade(marks);
      const point = {
        'A': 4.0, 'B+': 3.5, 'B': 3.0, 'C+': 2.5, 'C': 2.0,
        'D+': 1.5, 'D': 1.0, 'F': 0.0
      }[grade];
  
      const gradeBox = row.querySelector('.grade-box');
      gradeBox.innerText = `Grade: ${grade}`;
      gradeBox.style.backgroundColor = '#e0f7fa';
      gradeBox.style.color = '#00796b';
      gradeBox.style.padding = '5px';
      gradeBox.style.borderRadius = '4px';
  
      if (!isNaN(credit) && !isNaN(point)) {
        semesterPoints += point * credit;
        semesterCredits += credit;
      }
    });
  
    const semesterResult = semesterSection.querySelector('.semesterResult');
    if (semesterCredits > 0) {
      const gpa = (semesterPoints / semesterCredits).toFixed(2);
      const classLabel = classifyUCCGPA(gpa);
  
      totalUccPoints += semesterPoints;
      totalUccCredits += semesterCredits;
  
      const cgpa = (totalUccPoints / totalUccCredits).toFixed(2);
      const cgpaClass = classifyUCCGPA(cgpa);
  
      semesterResult.innerText = `Semester GPA: ${gpa} (Credits: ${semesterCredits}) - Class: ${classLabel}`;
      document.getElementById('cgpaResult').innerText = `CGPA: ${cgpa} (Credits: ${totalUccCredits}) - Class: ${cgpaClass}`;
    } else {
      semesterResult.innerText = 'Enter valid course details.';
    }
  }
  
  function addSemester() {
    const semesterInputs = document.getElementById('semesterInputs');
    const count = semesterInputs.getElementsByClassName('semesterSection').length + 1;
    const section = document.createElement('div');
    section.className = 'semesterSection';
    section.innerHTML = `
      <h4>Semester ${count}</h4>
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
    semesterInputs.appendChild(section);
  }
  
  function closePopup() {
    document.getElementById('popup').style.display = 'none';
    localStorage.setItem('popupSeenUCC', 'true');
  }
  
  window.onload = function () {
    if (!localStorage.getItem('popupSeenUCC')) {
      setTimeout(() => {
        document.getElementById('popup').style.display = 'flex';
      }, 500);
    }
    const darkPref = localStorage.getItem('darkModeUCC') === 'true';
    document.getElementById('modeToggle').checked = darkPref;
    document.body.classList.toggle('dark', darkPref);
  };
  
  document.getElementById('modeToggle').addEventListener('change', function () {
    const isDark = this.checked;
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('darkModeUCC', isDark);
  });
  
  function resetForm() {
    location.reload();
  }
  