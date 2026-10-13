const API_URL = "http://127.0.0.1:5000/api/courses";

// Helper function para gawing 12-hour format na may AM/PM ang oras
function formatTo12Hour(timeStr) {
  if (!timeStr) return "";
  let [hours, minutes] = timeStr.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // Ang '0' ay magiging '12'
  const formattedHours = hours < 10 ? "0" + hours : hours;
  return `${formattedHours}:${minutes < 10 ? "0" + minutes : minutes} ${ampm}`;
}

// Load courses on start
document.addEventListener("DOMContentLoaded", fetchCourses);

async function fetchCourses() {
  try {
    const response = await fetch(API_URL);
    const courses = await response.json();

    const scheduleList = document.getElementById("scheduleList");
    if (!scheduleList) return;
    scheduleList.innerHTML = "";

    if (!Array.isArray(courses) || courses.length === 0) {
      scheduleList.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">Walang naka-schedule na course.</td></tr>`;
      return;
    }

    courses.forEach((course) => {
      const row = document.createElement("tr");
      // Gagamitin ang formatTo12Hour function sa display
      const formattedStart = formatTo12Hour(course.start_time);
      const formattedEnd = formatTo12Hour(course.end_time);

      row.innerHTML = `
                <td><b>${course.course_code}</b></td>
                <td>${course.day_of_week}</td>
                <td>${formattedStart} - ${formattedEnd}</td>
                <td>${course.room}</td>
                <td>
                    <button class="btn-delete" onclick="removeCourse('${course.course_code}')">
                        🗑 Delete
                    </button>
                </td>
            `;
      scheduleList.appendChild(row);
    });
  } catch (error) {
    console.error("Fetch error:", error);
    const statusMsg = document.getElementById("statusMessage");
    if (statusMsg) {
      statusMsg.innerText = "Hindi ma-connect sa backend server!";
      statusMsg.style.color = "red";
    }
  }
}

document.getElementById("courseForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const statusMsg = document.getElementById("statusMessage");
  statusMsg.innerText = "Saving...";
  statusMsg.style.color = "blue";

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
      statusMsg.innerText = "Successfully saved!";
      statusMsg.style.color = "green";
      fetchCourses();
    } else {
      const errData = await response.json();
      console.error("Server error details:", errData);
      statusMsg.innerText = "Failed to save course.";
      statusMsg.style.color = "red";
    }
  } catch (error) {
    console.error("Network error:", error);
    statusMsg.innerText = "Hindi ma-connect sa backend server!";
    statusMsg.style.color = "red";
  }
});

async function removeCourse(courseCode) {
  if (confirm(`Sigurado ka bang gusto mong burahin ang ${courseCode}?`)) {
    try {
      const response = await fetch(`${API_URL}/${courseCode}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCourses();
      } else {
        alert("Biktima ng error sa pagbura.");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  }
}
