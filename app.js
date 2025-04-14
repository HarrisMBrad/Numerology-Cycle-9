function calculateNumerology(dateStr) { ... }

function mindSetRecursion(taskNum, totalTasks, phase) { ... }

function onStart() { ... }

function onTask(phase) { ... }

function onUpdate() { ... }

function onStop() {
  console.log("STOP: End of day reached");
  console.log("》anUpdate: Final update before stopping");
}

function onEOD() {
  console.log("EOD: End of day processing");
  phaseCorp("Cycle 9"); // From corpofFinality.js
  mindStateRecursion("Clarity Index"); // Optional reflective logging
  onStop();
}

function main() {
  onStart();

  const phases = [
    "Presence", "Planning", "Action", "Reflection",
    "Correction", "Connection", "Rest", "Recalibration", "Release + Restart"
  ];

  let phaseIndex = 0;
  const phaseDuration = 4800000;
  const totalDuration = 43200000;

  const phaseInterval = setInterval(() => {
    const phase = phases[phaseIndex];
    console.log(`Starting Phase: ${phase}`);

    onTask(phase);

    if (phase === "Reflection" || phase === "Recalibration") {
      onUpdate();
    }

    if (phase === "Release + Restart") {
      onEOD();
      clearInterval(phaseInterval);
    }

    phaseIndex = (phaseIndex + 1) % phases.length;
  }, phaseDuration);

  setTimeout(() => {
    clearInterval(phaseInterval);
    if (phaseIndex !== 8) onEOD(); // Ensures proper shutdown
  }, totalDuration);
}

main();
