// === onStart.js ===
// 🧭 Purpose: System initialization + numerological awareness (part of Numerology-Cycle-9)
// 🕯 Authored by: brforeal.dev@gmail.com
// 🧠 Signature Intent: Leave behind a thinking pattern, not just a timestamp

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

// Calculates reduced numerology value from a Date instance (defaults to today)
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

// 🧠 START Phase Logic
function onStart() {
  console.log("🟢 START: Numerology-Cycle-9 Initialization Sequence");

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (d) =>
    `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;

  const todayStr = formatDate(today);
  const tomorrowStr = formatDate(tomorrow);

  const todayNum = calculateNumerology(today);
  const tomorrowNum = calculateNumerology(tomorrow);
  const combinedNumerology = reduceToCoreNumerology(todayNum + tomorrowNum);

  console.log(`📅 Today: ${todayStr} → Numerology: ${todayNum}`);
  console.log(`📅 Tomorrow: ${tomorrowStr} → Numerology: ${tomorrowNum}`);

  console.log(`🔢 Numerology (Today + Tomorrow): ${todayNum} + ${tomorrowNum} → ${combinedNumerology}`);

  // 🧭 Historical Footprint (Echo from original build time)
  console.log("🕰 Legacy Seeds: First built on 2025-04-13 by brforeal.dev — as a system that thinks in time.");
}

// ✨ Exported for use in main engine loop + journaling helpers
module.exports = {
  onStart,
  calculateNumerology,
  reduceToCoreNumerology,
  MASTER_NUMBERS,
};
