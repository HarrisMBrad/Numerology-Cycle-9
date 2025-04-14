function calculateNumerology(dateStr) {
    const digits = dateStr.replace(/\D/g, "").split("").map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);
    while (sum > 9) sum = sum.toString().split("").reduce((a, b) => a + b, 0);
    return sum;
  }
  
  function mindSetRecursion(taskNum, totalTasks, phase) {
    if (taskNum > totalTasks) return;
    console.log(`TASK: Creating KPI ${taskNum} during ${phase} - Keep People Informed, Involved, Interested`);
    mindSetRecursion(taskNum + 1, totalTasks, phase);
  }
  
  function onStart() {
    console.log("START: Initializing system");
    
    // Yesterday: 04/13/2025 (numerology 8)
    const yesterday = new Date("2025-04-13");
    const yesterdayNum = calculateNumerology("04/13/2025");
    console.log(`Yesterday: ${yesterday.toDateString()}, Numerology: ${yesterdayNum}`); // 8
    
    // Today: 04/14/2025 (numerology 9)
    const today = new Date("2025-04-14");
    const todayNum = calculateNumerology("04/14/2025");
    console.log(`Today: ${today.toDateString()}, Numerology: ${todayNum}`); // 9
    
    // Tomorrow: 04/15/2025 (numerology 1)
    const tomorrow = new Date("2025-04-15");
    const tomorrowNum = calculateNumerology("04/15/2025");
    console.log(`Tomorrow: ${tomorrow.toDateString()}, Numerology: ${tomorrowNum}`); // 1
    
    // Log today + tomorrow numerology
    console.log(`Numerology (Today + Tomorrow): ${todayNum} + ${tomorrowNum}`);
  }
  
  function onTask(phase) {
    console.log(`TASK TODO: Starting KPI creation for phase: ${phase}`);
    mindSetRecursion(1, 4, phase); // 4 tasks (T = (4))
  }
  
  function onUpdate() {
    console.log("UPDATE: Checking system state");
    const todayNum = calculateNumerology("04/14/2025");
    console.log(`》onUpdate: State refreshed, Numerology: ${todayNum}`); // Logs 9
  }
  
  function onStop() {
    console.log("STOP: End of day reached");
    console.log("》anUpdate: Final update before stopping");
  }
  
  function onEOD() {
    console.log("EOD: End of day processing");
    onStop();
  }
  
  function main() {
    onStart();
  
    const phases = [
      "Presence",
      "Planning",
      "Action",
      "Reflection",
      "Correction",
      "Connection",
      "Rest",
      "Recalibration",
      "Release + Restart"
    ];
  
    let phaseIndex = 0;
    const phaseDuration = 4800000; // 1.33 hours = 4,800,000 ms
    const totalDuration = 43200000; // 12 hours = 43,200,000 ms
  
    const phaseInterval = setInterval(() => {
      const phase = phases[phaseIndex];
      console.log(`Starting Phase: ${phase}`);
  
      // Run tasks for each phase
      onTask(phase);
  
      // Run updates at specific phases (Reflection and Recalibration)
      if (phase === "Reflection" || phase === "Recalibration") {
        onUpdate();
      }
  
      // End of day at the final phase
      if (phase === "Release + Restart") {
        onEOD();
        clearInterval(phaseInterval); // Stop the phase cycle
      }
  
      phaseIndex = (phaseIndex + 1) % phases.length;
    }, phaseDuration);
  
    // Ensure the system stops after 12 hours, even if the interval slightly overshoots
    setTimeout(() => {
      clearInterval(phaseInterval);
      if (phaseIndex !== 8) onEOD(); // Ensure EOD runs if not already triggered
    }, totalDuration);
  }
  
  main();