const agendaTitle = document.querySelector("[data-agenda-title]");
const agendaWeekdays = document.querySelector("[data-agenda-weekdays]");
const agendaGrid = document.querySelector("[data-agenda-grid]");
const previousMonthButton = document.querySelector("[data-agenda-prev]");
const nextMonthButton = document.querySelector("[data-agenda-next]");

const agendaMonths = [
  { year: 2026, month: 7 },
  { year: 2026, month: 8 },
  { year: 2026, month: 9 }
];
const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const eventDays = {
  3: ["exam"],
  4: ["exam"],
  7: ["exam"],
  8: ["exam"],
  9: ["exam"],
  10: ["exam", "blue"],
  16: ["blue"],
  17: ["blue"],
  18: ["blue"],
  21: ["exam", "exam"],
  22: ["exam", "exam"],
  23: ["exam", "exam"],
  24: ["exam", "yellow"],
  25: ["exam", "yellow"],
  28: ["green"],
  29: ["green"],
  30: ["green"]
};

let currentMonthIndex = 1;

function renderAgenda() {
  const { year, month } = agendaMonths[currentMonthIndex];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const monthDate = new Date(year, month, 1);

  agendaTitle.textContent = monthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });
  agendaWeekdays.innerHTML = weekdayNames
    .map((day) => `<span>${day}</span>`)
    .join("");
  agendaGrid.innerHTML = "";

  for (let index = firstDay - 1; index >= 0; index -= 1) {
    agendaGrid.insertAdjacentHTML(
      "beforeend",
      `<div class="agenda-day muted"><span class="agenda-date">${previousMonthDays - index}</span></div>`
    );
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const colors = month === 8 ? eventDays[day] || [] : [];
    const events = colors
      .map(
        (color) =>
          `<span class="agenda-event ${color}" title="Belajar Bersama">Belajar Bersama</span>`
      )
      .join("");
    const todayClass =
      year === 2026 && month === 8 && day === 26 ? " today" : "";

    agendaGrid.insertAdjacentHTML(
      "beforeend",
      `<div class="agenda-day${todayClass}"><span class="agenda-date">${day}</span>${events}</div>`
    );
  }

  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const nextMonthDays = totalCells - firstDay - daysInMonth;

  for (let day = 1; day <= nextMonthDays; day += 1) {
    agendaGrid.insertAdjacentHTML(
      "beforeend",
      `<div class="agenda-day muted"><span class="agenda-date">${day}</span></div>`
    );
  }
}

previousMonthButton.addEventListener("click", () => {
  currentMonthIndex = Math.max(0, currentMonthIndex - 1);
  renderAgenda();
});

nextMonthButton.addEventListener("click", () => {
  currentMonthIndex = Math.min(
    agendaMonths.length - 1,
    currentMonthIndex + 1
  );
  renderAgenda();
});

renderAgenda();
