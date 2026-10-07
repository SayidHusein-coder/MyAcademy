const attendanceRows = document.querySelector("[data-attendance-rows]");
const summaryPresent = document.querySelector("[data-summary-present]");
const statusFilter = document.querySelector("[data-status-filter]");
const filterButton = document.querySelector("[data-apply-filter]");

const startDate = document.querySelector("[data-start-date]");
const endDate = document.querySelector("[data-end-date]");

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readAttendanceRecords() {
  try {
    return window.myAcademyReadAttendanceRecords?.() || [];
  } catch (error) {
    console.error("Data kehadiran tidak dapat dibaca:", error);
    throw error;
  }
}

function renderAttendanceLog() {
  const today = getLocalDateKey(new Date());
  const records = readAttendanceRecords();
  const selectedStatus = statusFilter.value;
  const start = startDate.value;
  const end = endDate.value;
  const recordsByDate = new Map(records.map((record) => [record.date, record]));
  const dates = [...new Set([...recordsByDate.keys(), today])]
    .filter((date) => (!start || date >= start) && (!end || date <= end))
    .sort((first, second) => second.localeCompare(first));
  const visibleDates = dates.filter((date) => {
    const isPresent = recordsByDate.has(date);
    return (
      selectedStatus === "All Statuses" ||
      (selectedStatus === "Present" && isPresent) ||
      (selectedStatus === "Not Checked In" && !isPresent)
    );
  });

  summaryPresent.textContent = String(
    dates.filter((date) => recordsByDate.has(date)).length
  );

  if (visibleDates.length === 0) {
    attendanceRows.innerHTML =
      '<tr><td colspan="5">No attendance records match the selected filter.</td></tr>';
    return;
  }

  attendanceRows.innerHTML = visibleDates
    .map((date) => {
      const record = recordsByDate.get(date);
      const localDate = new Date(`${date}T12:00:00`);
      const day = localDate.toLocaleDateString("en-US", { weekday: "short" });
      const label = localDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
      const checkInTime = record
        ? new Date(record.checkedAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
          })
        : "-";
      const status = record ? "Present" : "Not Checked In";
      const statusClass = record ? "" : " unchecked";

      return `
        <tr>
          <td>${day}</td>
          <td>${label}</td>
          <td>${checkInTime}</td>
          <td>-</td>
          <td><span class="status-pill${statusClass}">${status}</span></td>
        </tr>
      `;
    })
    .join("");
}

filterButton.addEventListener("click", renderAttendanceLog);
statusFilter.addEventListener("change", renderAttendanceLog);
renderAttendanceLog();
