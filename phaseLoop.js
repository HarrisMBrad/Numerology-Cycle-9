// === phaseLoop.js ===
// Description: Runs the 9-phase loop logic for Numerology-Cycle-9.
// Dependencies: onStart.js, corpofFinality.js

const { onStart, calculateNumerology } = require('./onStart');
// Optional: const { phaseCorp, mindStateRecursion } = require('./corpofFinality');

function mindSetRecursion(taskNum, totalTasks, phase) {
  if (taskNum > totalTasks) return;
  console.log(`TASK: Creating KPI ${taskNum} during ${phase} - Keep People Informed, Involved, Interested`);
  mindSetRecursion(taskNum + 1, totalTasks, phase);
}

function titanTalk(phase) {
  console.log(`🗣 TITAN TALK: Engaged during ${phase} phase`);
}

function onTask(phase) {
  console.log(`TASK TODO: Starting KPI creation for phase: ${phase}`);
  mindSetRecursion(1, 4, phase);
  if (phase === "Recalibration" || phase === "Release + Restart") {
    titanTalk(phase);
  }
}

function onUpdate(phase) {
  console.log("UPDATE: Checking system state");
  const todayNum = calculateNumerology(new Date().toLocaleDateString('en-US'));
  console.log(`》onUpdate: State refreshed, Numerology: ${todayNum}`);
  if (phase === "Recalibration") {
    titanTalk(phase);
  }
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
    const todayNum = calculateNumerology(new Date().toLocaleDateString('en-US'));
    console.log(`Starting Phase: ${phase} → Numerology: ${todayNum}`);

    onTask(phase);

    if (["Reflection", "Recalibration"].includes(phase)) {
      onUpdate(phase);
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

