// === phaseLoop.js ===
// Description: Runs the 9-phase loop logic for Numerology-Cycle-9.
// Dependencies: onStart.js, corpofFinality.js

const { onStart, calculateNumerology, MASTER_NUMBERS } = require('./onStart');
const { createPhaseJournal } = require('./phaseJournal');
const { createUpworkTracker } = require('./upworkTracker');
// Optional: const { phaseCorp, mindStateRecursion } = require('./corpofFinality');

function mindSetRecursion(taskNum, totalTasks, phase, steps = []) {
  if (taskNum > totalTasks) return steps;
  const message = `TASK: Creating KPI ${taskNum} during ${phase} - Keep People Informed, Involved, Interested`;
  console.log(message);
  steps.push({ step: taskNum, note: message });
  return mindSetRecursion(taskNum + 1, totalTasks, phase, steps);
}

function titanTalk(phase) {
  const message = `🗣 TITAN TALK: Engaged during ${phase} phase`;
  console.log(message);
  return message;
}

function onTask(phase, journal, upworkTracker) {
  console.log(`TASK TODO: Starting KPI creation for phase: ${phase}`);
  const kpiLogs = mindSetRecursion(1, 4, phase, []);

  if (journal) {
    journal.recordEvent(phase, 'task:kpi', 'Generated KPI reflections for this phase.', {
      totalKPIs: kpiLogs.length,
      sample: kpiLogs.slice(0, 2).map((entry) => entry.note),
    });
  }

  if (phase === 'Recalibration' || phase === 'Release + Restart') {
    const message = titanTalk(phase);
    if (journal) {
      journal.recordEvent(phase, 'alignment', message, {
        tags: ['titan-talk'],
      });
    }
  }

  if (upworkTracker) {
    upworkTracker.logPhaseTouch(phase, journal, {
      context: 'runtime-loop',
      autoAdvanceStatus: true,
    });
  }

  return kpiLogs;
}

function onUpdate(phase, journal, upworkTracker) {
  console.log('UPDATE: Checking system state');
  const todayNum = calculateNumerology();
  console.log(`》onUpdate: State refreshed, Numerology: ${todayNum}`);

  if (journal) {
    journal.recordEvent(phase, 'update', 'State recalibrated after reflection.', {
      numerology: todayNum,
      masterNumber: MASTER_NUMBERS.has(todayNum),
      tags: ['update'],
    });
  }

  if (phase === 'Recalibration') {
    const message = titanTalk(phase);
    if (journal) {
      journal.recordEvent(phase, 'alignment', `${message} (via update)`, {
      tags: ['titan-talk', 'update'],
      });
    }
  }

  if (upworkTracker) {
    const atRisk = upworkTracker.getAtRiskDeliverables();
    if (atRisk.length) {
      atRisk.forEach(({ deliverable, dueInfo }) => {
        const message = `Upwork deliverable ${deliverable.id} (${deliverable.title}) requires attention — ${dueInfo.risk}`;
        if (journal) {
          journal.recordEvent(phase, 'upwork:risk', message, {
            deliverableId: deliverable.id,
            status: deliverable.status,
            dueDate: deliverable.dueDate || null,
            dueInDays: dueInfo.dueInDays,
            risk: dueInfo.risk,
            tags: ['upwork', 'risk'],
          });
        }
        console.log(`⚠️ ${message}`);
      });
    } else if (journal) {
      journal.recordEvent(phase, 'upwork:risk', 'All tracked Upwork deliverables remain on-track.', {
        tags: ['upwork', 'risk', 'clear'],
      });
    }
  }
}

function onStop(journal) {
  console.log('STOP: End of day reached');
  console.log('》anUpdate: Final update before stopping');

  if (journal) {
    journal.recordEvent('Release + Restart', 'stop', 'Cycle gracefully paused and archived.', {
      tags: ['shutdown'],
    });
  }
}

function onEOD(journal, upworkTracker) {
  console.log('EOD: End of day processing');

  if (journal) {
    journal.recordEvent('Release + Restart', 'eod', 'End-of-day ritual executed.', {
      tags: ['eod'],
    });
  }

  if (upworkTracker) {
    const snapshot = upworkTracker.summarize();
    journal.recordEvent('Release + Restart', 'upwork:summary', 'Upwork deliverable snapshot archived for restart planning.', {
      summary: snapshot,
      tags: ['upwork', 'summary'],
    });
    console.log('📦 Upwork Deliverable Snapshot:', JSON.stringify(snapshot, null, 2));
  }

  // Optional:
  // phaseCorp('Cycle 9');
  // mindStateRecursion('Clarity Index');

  onStop(journal);
}

function phaseLoop() {
  onStart();

  const phases = [
    'Presence', 'Planning', 'Action', 'Reflection',
    'Correction', 'Connection', 'Rest', 'Recalibration', 'Release + Restart'
  ];

  const journal = createPhaseJournal(phases);
  const upworkTracker = createUpworkTracker();

  let phaseIndex = 0;
  const phaseDuration = 4800000; // 1.33 hours
  const totalDuration = 43200000; // 12 hours
  let cycleClosed = false;

  const phaseInterval = setInterval(() => {
    const phase = phases[phaseIndex];
    const numerology = calculateNumerology();

    journal.startPhase(phase, {
      numerology,
      phaseIndex,
      context: 'runtime-loop',
    });

    console.log(`Starting Phase: ${phase} → Numerology: ${numerology}`);

    onTask(phase, journal, upworkTracker);

    if (['Reflection', 'Recalibration'].includes(phase)) {
      onUpdate(phase, journal, upworkTracker);
    }

    if (upworkTracker) {
      upworkTracker.markPhaseComplete(phase, journal, {
        context: 'runtime-loop',
        autoCompleteDeliverable: phase === 'Release + Restart',
        completeStatus: 'ready-for-client',
      });
    }

    if (phase === 'Release + Restart') {
      onEOD(journal, upworkTracker);
      journal.completePhase(phase, {
        summary: 'Cycle archived and restart prepared.',
        numerology,
        tags: ['eod', 'restart'],
      });
      cycleClosed = true;
      clearInterval(phaseInterval);
      journal.printSummary();
    } else {
      journal.completePhase(phase, {
        summary: 'Phase tasks completed',
        numerology,
        tags: ['progress'],
      });
    }

    phaseIndex = (phaseIndex + 1) % phases.length;
  }, phaseDuration);

  setTimeout(() => {
    clearInterval(phaseInterval);
    if (!cycleClosed) {
      const fallbackPhase = 'Release + Restart';
      const numerology = calculateNumerology();

      journal.startPhase(fallbackPhase, {
        numerology,
        phaseIndex: phases.indexOf(fallbackPhase),
        context: 'safety-shutdown',
        message: 'Safety shutdown initiated',
        tags: ['safety'],
      });

      journal.recordEvent(fallbackPhase, 'safety', 'Safety shutdown triggered before natural completion.', {
        numerology,
        tags: ['safety'],
      });

      if (upworkTracker) {
        upworkTracker.logPhaseTouch(fallbackPhase, journal, {
          context: 'safety-shutdown',
          autoAdvanceStatus: true,
        });
        upworkTracker.markPhaseComplete(fallbackPhase, journal, {
          context: 'safety-shutdown',
          autoCompleteDeliverable: true,
          completeStatus: 'ready-for-client',
        });
      }

      onEOD(journal, upworkTracker);
      journal.completePhase(fallbackPhase, {
        summary: 'Cycle closed via safety timer',
        numerology,
        tags: ['safety', 'forced'],
      });
      journal.printSummary();
      cycleClosed = true;
    }
  }, totalDuration);
}

module.exports = { phaseLoop };
