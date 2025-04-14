// === phaseLoop.js ===
// Description: Runs the 9-phase loop logic for Numerology-Cycle-9.
// Dependencies: onStart.js, corpofFinality.js

const { onStart } = require('./onStart');
// Optional: const { phaseCorp, mindStateRecursion } = require('./corpofFinality');

function mindSetRecursion(taskNum, totalTasks, phase) {
  if (taskNum > totalTasks) return;
  console.log(`TASK: Creating KPI ${taskNum} during ${phase} - Keep People Informed, Involved, Interested`);
  mindSetRecursion(taskNum + 1, totalTasks, phase);
}

function onTask(phase) {
  console.log(`TASK TODO: Starting KPI creation for phase: ${phase}`);
  mindSetRecursion(1, 4, phase);
}

function onUpdate() {
  console.log("UPDATE: Checking system state");
  const todayNum = 9; // Simplified for modular demo
  console.log(`》onUpdate: State refreshed, Numerology: ${todayNum}`);
}

function onStop() {
  console.log("STOP: End of day reached");
  console.log("》anUpdate: Final update before stopping");
}

function onEOD() {
  console.log("EOD: End of day processing");

  // Optional:
  // phaseCorp("Cycle 9");
  // mindStateRecursion("Clarity Index");

  onStop();
}

function phaseLoop() {
  onStart();

  const phases = [
    "Presence", "Planning", "Action", "Reflection",
    "Correction", "Connection", "Rest", "Recalibration", "Release + Restart"
  ];

  let phaseIndex = 0;
  const phaseDuration = 4800000; // 1.33 hours
  const totalDuration = 43200000; // 12 hours

  const phaseInterval = setInterval(() => {
    const phase = phases[phaseIndex];
    console.log(`Starting Phase: ${phase}`);

    onTask(phase);

    if (["Reflection", "Recalibration"].includes(phase)) {
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
    if (phaseIndex !== 8) onEOD(); // Ensure finality
  }, totalDuration);
}

module.exports = { phaseLoop };

