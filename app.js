// ===== Numerology Cycle Runtime Engine =====

// 🌐 DOM Binding for Phase Header
const phaseHeader = document.getElementById('phase-header');

// 🧠 Cycle Definitions
const phases = [
  "Presence", "Planning", "Action", "Reflection",
  "Correction", "Connection", "Rest", "Recalibration", "Release + Restart"
];

const folderNames = [
  "1_Presence", "2_Planning", "3_Action", "4_Reflection",
  "5_Correction", "6_Connection", "7_Rest", "8_Recalibration", "9_Release_And_Restart"
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

// 📅 Numerology Utility — automated from current Date()
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

const phaseLogs = [];
let phaseIndex = 0;

// 🔁 Repeating Functions
function onStart() {
  console.log("🌅 START: Beginning new numerology cycle.");
  const numerology = calculateNumerology();
  console.log(`🔢 Today's numerology value: ${numerology}`);
}

function onUpdate() {
  console.log("UPDATE: Checking system state and recalibrating where needed.");
}

function onStop() {
  console.log("🛑 STOP: End of day reached.");
  console.log("》anUpdate: Final update before stopping.");
}

function onEOD() {
  console.log("EOD: End of day processing...");
  phaseCorp("Cycle 9");  // External file hook
  mindStateRecursion("Clarity Index");  // Optional reflection
  onStop();
}

function onTask(phase) {
  // ✅ Update DOM
  if (phaseHeader) phaseHeader.innerText = `Now in Phase: ${phase}`;

  // ✅ Log start of phase
  const timestamp = new Date().toLocaleTimeString();
  const numerology = calculateNumerology();
  const log = `🌀 Task for Phase: "${phase}" started at ${timestamp} (Numerology: ${numerology})`;
  phaseLogs.push(log);
  console.log(log);

  // ✅ Phase Behavior Simulation
  switch (phase) {
    case "Presence":
      console.log("📍 Registering system state and grounding sensors.");
      break;
    case "Planning":
      console.log("🧭 Strategizing next task sequences.");
      break;
    case "Action":
      console.log("⚙️ Executing programmed motion/task.");
      break;
    case "Reflection":
      console.log("🪞 Reviewing task outcome, collecting diagnostics.");
      break;
    case "Correction":
      console.log("🔧 Applying necessary course adjustments.");
      break;
    case "Connection":
      console.log("🔗 Syncing with purpose, relaying meaning matrix.");
      break;
    case "Rest":
      console.log("💤 Entering rest cycle. Cooling systems, passive state.");
      break;
    case "Recalibration":
      console.log("🎯 Re-evaluating goals, retuning parameters.");
      break;
    case "Release + Restart":
      console.log("🚀 Logging progress. Preparing for full system refresh.");
      break;
    default:
      console.log("❓ Unknown phase. Awaiting further instruction...");
  }

  // ✅ Folder Mapping for Simulation
  const folderName = phase.replace(/\s+/g, "_");
  console.log(`📂 Logging to folder: /Numerology-Cycle-9/${folderName}`);
}

// 🧠 Main Runtime Loop
function main() {
  onStart();

  phaseIndex = ((calculateNumerology() - 1) % phases.length + phases.length) % phases.length;
  console.log(`🧮 Start phase aligned to numerology index: ${phaseIndex + 1}`);

  const phaseDuration = 4800000;  // 80 mins
  const totalDuration = 43200000; // 12 hours

  const phaseInterval = setInterval(() => {
    const phase = phases[phaseIndex];
    console.log(`🔄 Starting Phase: ${phase}`);

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

  // Safety shutdown trigger
  setTimeout(() => {
    clearInterval(phaseInterval);
    if (phaseIndex !== 8) onEOD(); // Ensure proper closeout if loop missed
  }, totalDuration);
}

// 🧩 Highlight current cycle phase in UI
const currentCyclePhase = 4;  // Could be loaded dynamically
const phaseItems = document.querySelectorAll('li');
if (phaseItems.length >= currentCyclePhase) {
  phaseItems[currentCyclePhase - 1].style.fontWeight = 'bold';
}

// 🚀 Launch the system
main();
