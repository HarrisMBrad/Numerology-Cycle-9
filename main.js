// === main.js ===
// Highlights the current phase row in the table based on Numerology Cycle index

document.addEventListener("DOMContentLoaded", () => {
  const currentPhaseIndex = 4; // For example: Phase 4 = Reflection

  const rows = document.querySelectorAll(".cycle-phase-row");
  rows.forEach(row => {
    if (parseInt(row.dataset.phase) === currentPhaseIndex) {
      row.classList.add("highlight");
    }
  });

  const phaseHeader = document.getElementById("phase-header");
  if (phaseHeader) {
    phaseHeader.textContent = `Now in Phase: ${currentPhaseIndex}`;
  }

  console.log(`🔁 Phase ${currentPhaseIndex} is active and highlighted.`);
});

