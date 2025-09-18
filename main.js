// === main.js ===
// Highlights the current phase row in the table based on Numerology Cycle index

document.addEventListener("DOMContentLoaded", () => {
  const phases = [
    "Presence", "Planning", "Action", "Reflection",
    "Correction", "Connection", "Rest", "Recalibration", "Release + Restart"
  ];

  const MASTER_NUMBERS = new Set([11, 22, 33]);

  function reduceToCoreNumerology(value) {
    let sum = value;
    while (sum > 9 && !MASTER_NUMBERS.has(sum)) {
      sum = sum
        .toString()
        .split("")
        .map(Number)
        .reduce((total, digit) => total + digit, 0);
    }
    return sum;
  }

  function calculateNumerology(dateInput = new Date()) {
    let date = dateInput instanceof Date ? dateInput : new Date(dateInput);

    if (Number.isNaN(date.getTime())) {
      console.warn("calculateNumerology received an invalid date input. Defaulting to today's date.");
      date = new Date();
    }

    const digits = [
      ...date.getFullYear().toString(),
      ...String(date.getMonth() + 1).padStart(2, "0"),
      ...String(date.getDate()).padStart(2, "0"),
    ].map(Number);

    const initialSum = digits.reduce((total, digit) => total + digit, 0);
    return reduceToCoreNumerology(initialSum);
  }

  const todayNum = calculateNumerology();
  const currentPhaseIndex = ((todayNum - 1) % phases.length) + 1;

  const rows = document.querySelectorAll(".cycle-phase-row");
  rows.forEach(row => {
    if (parseInt(row.dataset.phase) === currentPhaseIndex) {
      row.classList.add("highlight");
    }
  });

  const phaseHeader = document.getElementById("phase-header");
  if (phaseHeader) {
    phaseHeader.textContent = `Now in Phase: ${phases[currentPhaseIndex - 1]}`;
  }

  console.log(
    `🔁 Phase ${currentPhaseIndex} (${phases[currentPhaseIndex - 1]}) is active and highlighted. Numerology: ${todayNum}`
  );
});

