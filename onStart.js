// === onStart.js ===
// 🧭 Purpose: System initialization + numerological awareness (part of Numerology-Cycle-9)
// 🕯 Authored by: brforeal.dev@gmail.com
// 🧠 Signature Intent: Leave behind a thinking pattern, not just a timestamp

// Calculates reduced numerology value from a date string (MM/DD/YYYY)
function calculateNumerology(dateStr) {
  const digits = dateStr.replace(/\D/g, "").split("").map(Number);
  let sum = digits.reduce((a, b) => a + b, 0);
  while (sum > 9 && ![11, 22, 33].includes(sum)) {
    sum = sum.toString().split("").reduce((a, b) => a + b, 0);
  }
  return sum;
}

// 🧠 START Phase Logic
function onStart() {
  console.log("🟢 START: Numerology-Cycle-9 Initialization Sequence");

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const formatDate = (d) =>
    d.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });

  const todayStr = formatDate(today);
  const tomorrowStr = formatDate(tomorrow);

  const todayNum = calculateNumerology(todayStr);
  const tomorrowNum = calculateNumerology(tomorrowStr);

  console.log(`📅 Today: ${todayStr} → Numerology: ${todayNum}`);
  console.log(`📅 Tomorrow: ${tomorrowStr} → Numerology: ${tomorrowNum}`);

  console.log(`🔢 Numerology (Today + Tomorrow): ${todayNum} + ${tomorrowNum}`);

  // 🧭 Historical Footprint (Echo from original build time)
  console.log("🕰 Legacy Seeds: First built on 2025-04-13 by brforeal.dev — as a system that thinks in time.");
}

// ✨ Exported for use in main engine loop
module.exports = { onStart, calculateNumerology };
