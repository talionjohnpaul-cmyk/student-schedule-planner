const API_URL = "https://student-schedule-planner.onrender.com/api/courses";

// 1. Function para kuhanin ang courses at i-render sa table
async function fetchCourses() {
  try {
    const response = await fetch(API_URL);
    const courses = await response.json();

    const scheduleList = document.getElementById("scheduleList");
    scheduleList.innerHTML = "";

    courses.forEach((course) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td><b>${course.course_code}</b></td>
                <td>${course.day_of_week}</td>
                <td>${course.start_time} - ${course.end_time}</td>
                <td>${course.room}</td>
                <td style="text-align: center;">
                    <button onclick="removeCourse('${course.course_code}')" style="background-color: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                        Delete
                    </button>
                </td>
            `;
      scheduleList.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    document.getElementById("statusMessage").innerText =
      "Error: Make sure python app.py is running!";
  }
}

// 2. Function para sa pag-Delete ng Course
async function removeCourse(courseCode) {
  if (confirm(`Sigurado ka bang gusto mong idelete ang ${courseCode}?`)) {
    try {
      const response = await fetch(`${API_URL}/${courseCode}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCourses(); // I-refresh ang table pagkatapos idelete
      } else {
        alert("Failed to delete course.");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  }
}

// 3. Handling ng Form Submission (Add Course)
document.getElementById("courseForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const newCourse = {
    course_code: document.getElementById("courseCode").value,
    day_of_week: document.getElementById("dayOfWeek").value,
    start_time: document.getElementById("startTime").value,
    end_time: document.getElementById("endTime").value,
    room: document.getElementById("room").value,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCourse),
    });

    if (response.ok) {
      document.getElementById("courseForm").reset();
      document.getElementById("statusMessage").innerText = "";
      fetchCourses(); // I-refresh ang table
    } else {
      const errorData = await response.json();
      document.getElementById("statusMessage").innerText =
        errorData.error || "Failed to save course";
    }
  } catch (error) {
    document.getElementById("statusMessage").innerText =
      "Error connecting to server!";
  }
});

// Load courses pagkabukas ng page
fetchCourses();
