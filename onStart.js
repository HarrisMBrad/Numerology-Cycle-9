// === onStart.js ===
// Description: Initialization logic for Numerology-Cycle-9 daily run
// Author: brforeal.dev@gmail.com

function calculateNumerology(dateStr) {
    const digits = dateStr.replace(/\D/g, "").split("").map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);
    while (sum > 9) sum = sum.toString().split("").reduce((a, b) => a + b, 0);
    return sum;
  }
  
  function onStart() {
    console.log("START: Initializing system");
  
    const yesterday = new Date("2025-04-13");
    const today = new Date("2025-04-14");
    const tomorrow = new Date("2025-04-15");
  
    const yesterdayNum = calculateNumerology("04/13/2025");
    const todayNum = calculateNumerology("04/14/2025");
    const tomorrowNum = calculateNumerology("04/15/2025");
  
    console.log(`Yesterday: ${yesterday.toDateString()}, Numerology: ${yesterdayNum}`);
    console.log(`Today: ${today.toDateString()}, Numerology: ${todayNum}`);
    console.log(`Tomorrow: ${tomorrow.toDateString()}, Numerology: ${tomorrowNum}`);
  
    console.log(`Numerology (Today + Tomorrow): ${todayNum} + ${tomorrowNum}`);
  }
  
  module.exports = { onStart };
  