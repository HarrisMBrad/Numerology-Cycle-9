// === main.js ===
// Highlights the current phase row in the table based on Numerology Cycle index

document.addEventListener("DOMContentLoaded", () => {
  const phases = [
    "Presence", "Planning", "Action", "Reflection",
    "Correction", "Connection", "Rest", "Recalibration", "Release + Restart"
  ];

  function calculateNumerology(dateStr) {
    const digits = dateStr.replace(/\D/g, "").split("").map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);
    while (sum > 9 && ![11, 22, 33].includes(sum)) {
      sum = sum.toString().split("").reduce((a, b) => a + b, 0);
    }
    return sum;
  }

  const todayNum = calculateNumerology(new Date().toLocaleDateString("en-US"));
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

  console.log(`🔁 Phase ${currentPhaseIndex} (${phases[currentPhaseIndex - 1]}) is active and highlighted.`);
});

