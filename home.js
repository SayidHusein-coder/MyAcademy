const dashboard = document.querySelector(".dashboard");
const sidebarToggle = document.querySelector(".sidebar-toggle");

const SESSION_KEY = "myacademy_current_user";

function readCurrentUser() {
  try {
    const user = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (
      user &&
      typeof user.name === "string" &&
      typeof user.email === "string"
    ) {
      return user;
    }
  } catch (error) {
    console.error("Status sesi tidak dapat dibaca:", error);
  }

  return null;
}

const currentUser = readCurrentUser();

if (!currentUser) {
  window.location.replace("dashboard.html");
} else {
  window.myAcademyCurrentUser = currentUser;
  window.myAcademyProfileKey =
    `myAcademyProfile:${encodeURIComponent(currentUser.email.toLowerCase())}`;
  window.myAcademyAttendanceKey =
    `myAcademyAttendance:${encodeURIComponent(currentUser.email.toLowerCase())}`;
}

function readAttendanceRecords() {
  if (!currentUser) return [];

  try {
    const records = JSON.parse(
      localStorage.getItem(window.myAcademyAttendanceKey) || "[]"
    );
    return Array.isArray(records)
      ? records.filter(
          (record) =>
            record &&
            typeof record.date === "string" &&
            typeof record.checkedAt === "string" &&
            !Number.isNaN(Date.parse(record.checkedAt))
        )
      : [];
  } catch (error) {
    console.error("Data kehadiran tidak dapat dibaca:", error);
    return [];
  }
}

function readProfile() {
  if (!currentUser) return {};

  const profileKey = window.myAcademyProfileKey;

  try {
    const savedProfile = JSON.parse(localStorage.getItem(profileKey) || "null");
    if (savedProfile && typeof savedProfile === "object") {
      return savedProfile;
    }

    const legacyProfile = JSON.parse(
      localStorage.getItem("myAcademyProfile") || "null"
    );
    if (
      legacyProfile &&
      typeof legacyProfile === "object" &&
      typeof legacyProfile.email === "string" &&
      legacyProfile.email.toLowerCase() === currentUser.email.toLowerCase()
    ) {
      localStorage.setItem(profileKey, JSON.stringify(legacyProfile));
      return legacyProfile;
    }
  } catch (error) {
    console.error("Data profil tidak dapat dibaca:", error);
  }

  return {};
}

function getDisplayName() {
  const profile = readProfile();
  return profile.nickname || currentUser?.name || "MyAcademy";
}

function updateProfileHeader() {
  const displayName = getDisplayName();
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  document.querySelectorAll("[data-profile-name]").forEach((element) => {
    element.textContent = displayName;
  });

  document.querySelectorAll("[data-profile-avatar]").forEach((element) => {
    element.textContent = initials;
  });
}

function setSidebarState(isOpen) {
  dashboard.classList.toggle("sidebar-open", isOpen);
  sidebarToggle.setAttribute("aria-expanded", String(isOpen));
  sidebarToggle.setAttribute(
    "aria-label",
    isOpen ? "Close navigation" : "Open navigation"
  );
}

function setupNavigation() {
  sidebarToggle.addEventListener("click", () => {
    setSidebarState(!dashboard.classList.contains("sidebar-open"));
  });

  document.querySelectorAll(".sidebar a").forEach((link) => {
    link.addEventListener("click", () => setSidebarState(false));
  });
}

function setupCalendar() {
  const calendar = document.querySelector("[data-calendar]");
  if (!calendar) return;

  const calendarTitle = document.querySelector("#calendar-title");
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const statuses = {
    "0-5": "status-present",
    "0-6": "status-present",
    "0-7": "status-permit",
    "0-9": "status-sick",
    "1-4": "status-on-duty",
    "2-10": "status-alpha",
    "3-7": "status-on-leave",
    "3-10": "status-holiday",
    "5-9": "status-sick",
    "6-8": "status-alpha",
    "7-5": "status-on-leave",
    "8-23": "status-on-leave",
    "9-6": "status-permit",
    "10-4": "status-on-duty",
    "11-9": "status-holiday"
  };

  monthNames.forEach((monthName, monthIndex) => {
    const month = document.createElement("div");
    const days = document.createElement("div");
    const daysInMonth = new Date(2026, monthIndex + 1, 0).getDate();
    const firstDay = new Date(2026, monthIndex, 1).getDay();

    month.className = "month";
    month.innerHTML = `
      <h3>${monthName} 2026</h3>
      <div class="weekdays">${weekdays.map((day) => `<span>${day}</span>`).join("")}</div>
    `;
    days.className = "month-days";
    month.append(days);

    for (let blank = 0; blank < firstDay; blank += 1) {
      days.insertAdjacentHTML("beforeend", '<span class="empty-day"></span>');
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const status = statuses[`${monthIndex}-${day}`] || "";
      days.insertAdjacentHTML("beforeend", `<span class="${status}">${day}</span>`);
    }

    calendar.append(month);
  });

  const months = [...calendar.querySelectorAll(".month")];

  function moveCalendar(direction) {
    const slideWidth = calendar.clientWidth + 14;
    const currentIndex = Math.round(calendar.scrollLeft / slideWidth);
    const nextIndex = Math.max(
      0,
      Math.min(months.length - 1, currentIndex + direction)
    );

    calendar.scrollTo({
      left: nextIndex * slideWidth,
      behavior: "smooth"
    });
    calendarTitle.textContent = `${monthNames[nextIndex]} 2026`;
  }

  document
    .querySelector("[data-calendar-prev]")
    .addEventListener("click", () => moveCalendar(-1));
  document
    .querySelector("[data-calendar-next]")
    .addEventListener("click", () => moveCalendar(1));
  calendar.addEventListener("scroll", () => {
    const index = Math.round(calendar.scrollLeft / (calendar.clientWidth + 14));
    calendarTitle.textContent = `${monthNames[index] || monthNames[0]} 2026`;
  });
}

function setupCheckIn() {
  const checkInButton = document.querySelector("[data-check-in]");
  if (!checkInButton) return;

  const currentStatus = document.querySelector("[data-current-status]");
  const statusMessage = document.querySelector("[data-check-in-message]");
  const today = getLocalDateKey(new Date());

  function showCheckedIn(record) {
    const checkedAt = new Date(record.checkedAt);
    const time = checkedAt.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });

    currentStatus.textContent = "Present";
    statusMessage.textContent = `Anda tercatat hadir hari ini pukul ${time}.`;
    checkInButton.querySelector("span:last-child").textContent =
      `Checked in at ${time}`;
    checkInButton.disabled = true;
  }

  const existingRecord = readAttendanceRecords().find(
    (record) => record.date === today
  );

  if (existingRecord) {
    showCheckedIn(existingRecord);
  }

  checkInButton.addEventListener("click", () => {
    const checkedAt = new Date();
    const records = readAttendanceRecords();
    const record = {
      date: getLocalDateKey(checkedAt),
      checkedAt: checkedAt.toISOString()
    };

    try {
      const updatedRecords = [
        ...records.filter((item) => item.date !== record.date),
        record
      ];
      localStorage.setItem(
        window.myAcademyAttendanceKey,
        JSON.stringify(updatedRecords)
      );
      showCheckedIn(record);
    } catch (error) {
      console.error("Waktu kehadiran tidak dapat disimpan:", error);
      statusMessage.textContent =
        "Waktu kehadiran gagal disimpan. Silakan coba lagi.";
    }
  });
}

function getLocalDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

updateProfileHeader();
setupNavigation();
setupCalendar();
setupCheckIn();

window.myAcademyReadProfile = readProfile;
window.myAcademyReadAttendanceRecords = readAttendanceRecords;
