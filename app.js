// ===== Numerology Cycle Runtime Engine =====

// 🌐 DOM Binding for Phase Header
const phaseHeader = document.getElementById('phase-header');

// 🧠 Cycle Definitions
const phases = [
  'Presence', 'Planning', 'Action', 'Reflection',
  'Correction', 'Connection', 'Rest', 'Recalibration', 'Release + Restart'
];

const folderNames = [
  '1_Presence', '2_Planning', '3_Action', '4_Reflection',
  '5_Correction', '6_Connection', '7_Rest', '8_Recalibration', '9_Release_And_Restart'
];

const MASTER_NUMBERS = new Set([11, 22, 33]);


// [MERGE: Retained from codex branch for journaling functionality]

const PHASE_FOCUS_MAP = {
  Presence: 'Ground the system, document state, and breathe into awareness.',
  Planning: 'Design the path forward and translate numerology into intention.',
  Action: 'Move deliverables forward with purposeful execution.',
  Reflection: 'Review outcomes, lessons, and emergent signals.',
  Correction: 'Integrate adjustments and reinforce the plan.',
  Connection: 'Sync with collaborators and share meaning.',
  Rest: 'Pause, recover, and preserve energy for the next push.',
  Recalibration: 'Retune priorities with fresh data and intuition.',
  'Release + Restart': 'Archive the loop, celebrate, and prep the relaunch.',
};

const PHASE_BEHAVIORS = {
  Presence: '📍 Registering system state and grounding sensors.',
  Planning: '🧭 Strategizing next task sequences.',
  Action: '⚙️ Executing programmed motion/task.',
  Reflection: '🪞 Reviewing task outcome, collecting diagnostics.',
  Correction: '🔧 Applying necessary course adjustments.',
  Connection: '🔗 Syncing with purpose, relaying meaning matrix.',
  Rest: '💤 Entering rest cycle. Cooling systems, passive state.',
  Recalibration: '🎯 Re-evaluating goals, retuning parameters.',
  'Release + Restart': '🚀 Logging progress. Preparing for full system refresh.',
};

function reduceToCoreNumerology(value) {
  let sum = value;
  while (sum > 9 && !MASTER_NUMBERS.has(sum)) {
    sum = sum
      .toString()
      .split("") // [MERGE: Used double quotes for consistency]
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
    ...String(date.getMonth() + 1).padStart(2, "0"), // [MERGE: Used double quotes]
    ...String(date.getDate()).padStart(2, "0"), // [MERGE: Used double quotes]
  ].map(Number);

  const initialSum = digits.reduce((total, digit) => total + digit, 0);
  return reduceToCoreNumerology(initialSum);
}

function formatDuration(durationMs = 0) {
  if (!durationMs || !Number.isFinite(durationMs)) {
    return '0s';
  }

  const totalSeconds = Math.round(durationMs / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const totalMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  if (totalMinutes < 60) {
    return remainingSeconds ? `${totalMinutes}m ${remainingSeconds}s` : `${totalMinutes}m`;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const hoursLabel = `${totalHours}h`;
  return remainingMinutes ? `${hoursLabel} ${remainingMinutes}m` : hoursLabel;
}

function buildInsights(phaseIndex, numerology) {
  const insights = [];
  if (MASTER_NUMBERS.has(numerology)) {
    insights.push('Master number resonance — expect amplified patterns.');
  }
  if (typeof phaseIndex === 'number' && phaseIndex >= 0) {
    if (numerology === phaseIndex + 1) {
      insights.push('Phase numerology aligned — flow is naturally synced.');
    }
  }
  return insights;
}

function formatDetails(metadata = {}) {
  const details = [];
  if (typeof metadata.ordinal === 'number') {
    details.push(`Phase #${metadata.ordinal}`);
  }
  if (typeof metadata.numerology === 'number') {
    details.push(`Num ${metadata.numerology}`);
  }
  if (metadata.masterNumber) {
    details.push('Master Number Day');
  }
  if (metadata.focus) {
    details.push(`Focus: ${metadata.focus}`);
  }
  if (metadata.summary) {
    details.push(`Summary: ${metadata.summary}`);
  }
  if (metadata.durationMs !== undefined) {
    details.push(`Duration ${formatDuration(metadata.durationMs)}`);
  }
  const tags = Array.isArray(metadata.tags)
    ? metadata.tags
    : metadata.tags
    ? [metadata.tags]
    : [];
  if (tags.length) {
    details.push(`Tags: ${tags.join(', ')}`);
  }
  if (Array.isArray(metadata.insights) && metadata.insights.length) {
    details.push(`Insights: ${metadata.insights.join(' | ')}`);
  }
  if (metadata.context) {
    details.push(`Context: ${metadata.context}`);
  }
  return details.length ? ` — ${details.join(' • ')}` : '';
}

function createPhaseJournal(phaseList) {
  const state = {
    phases: Array.isArray(phaseList) ? [...phaseList] : [],
    byPhase: new Map(),
    entries: [],
    active: null,
  };

  state.phases.forEach((phase) => {
    state.byPhase.set(phase, []);
  });

  function ensurePhaseRegistry(phase) {
    if (!state.byPhase.has(phase)) {
      state.byPhase.set(phase, []);
    }
  }

  function getEntry(phase) {
    if (state.active && state.active.phase === phase) {
      return state.active.entry;
    }
    const entries = state.byPhase.get(phase);
    if (!entries || !entries.length) {
      return null;
    }
    return entries[entries.length - 1];
  }

  function recordEvent(phase, type, message, metadata = {}) {
    ensurePhaseRegistry(phase);
    const entry = getEntry(phase);
    if (!entry) {
      console.warn(`🟡 JOURNAL warning: attempted to log "${type}" for phase "${phase}" without an active entry.`);
      return null;
    }

    const timestamp = new Date();
    const event = {
      type,
      message,
      timestamp: timestamp.toISOString(),
      metadata,
    };
    entry.events.push(event);

    const detailSuffix = formatDetails(metadata);
    console.log(`📝 JOURNAL(${phase}) [${type}] ${message}${detailSuffix}`);
    return event;
  }

  function startPhase(phase, metadata = {}) {
    ensurePhaseRegistry(phase);
    const now = metadata.timestamp ? new Date(metadata.timestamp) : new Date();
    const numerology = metadata.numerology ?? calculateNumerology(metadata.date);
    const defaultIndex = state.phases.indexOf(phase);
    let index = typeof metadata.phaseIndex === 'number' ? metadata.phaseIndex : defaultIndex;
    if (index < 0) {
      index = defaultIndex;
    }
    const ordinal = typeof metadata.ordinal === 'number' ? metadata.ordinal : index + 1;
    const focus = metadata.focus || PHASE_FOCUS_MAP[phase] || 'Maintain alignment and intention.';
    const insights = metadata.insights || buildInsights(index, numerology);

    const entry = {
      phase,
      phaseIndex: index,
      startedAt: now.toISOString(),
      numerology,
      focus,
      insights,
      context: metadata.context || null,
      events: [],
    };

    state.byPhase.get(phase).push(entry);
    state.entries.push(entry);
    state.active = { phase, entry, startedAt: now };

    recordEvent(phase, 'start', metadata.message || 'Phase engagement initiated', {
      numerology,
      ordinal,
      focus,
      insights,
      tags: metadata.tags,
      context: metadata.context,
    });

    return entry;
  }

  function completePhase(phase, metadata = {}) {
    ensurePhaseRegistry(phase);
    const entry = getEntry(phase);
    if (!entry) {
      console.warn(`🟡 JOURNAL warning: attempted to close phase "${phase}" with no journal entry.`);
      return null;
    }

    const now = metadata.timestamp ? new Date(metadata.timestamp) : new Date();
    const startedAt = state.active && state.active.phase === phase
      ? state.active.startedAt
      : new Date(entry.startedAt);
    entry.completedAt = now.toISOString();
    entry.durationMs = Math.max(0, now.getTime() - startedAt.getTime());
    entry.summary = metadata.summary ?? entry.summary ?? null;
    if (metadata.tags) {
      const tags = Array.isArray(metadata.tags) ? metadata.tags : [metadata.tags];
      entry.tags = Array.from(new Set([...(entry.tags || []), ...tags]));
    }

    if (state.active && state.active.phase === phase) {
      state.active = null;
    }

    recordEvent(phase, 'complete', metadata.message || 'Phase closed', {
      summary: entry.summary,
      durationMs: entry.durationMs,
      ordinal: (entry.phaseIndex ?? state.phases.indexOf(phase)) + 1,
      tags: metadata.tags,
    });

    return entry;
  }

  function summarize() {
    const summary = {
      totalEntries: state.entries.length,
      phases: {},
    };

    state.byPhase.forEach((entries, phase) => {
      if (!entries.length) {
        return;
      }
      const totalDuration = entries.reduce((total, entry) => total + (entry.durationMs || 0), 0);
      const averageDuration = entries.length ? totalDuration / entries.length : 0;
      const latestEntry = entries[entries.length - 1];
      summary.phases[phase] = {
        count: entries.length,
        totalDurationMs: totalDuration,
        averageDurationMs: averageDuration,
        lastSummary: latestEntry.summary || null,
        focus: latestEntry.focus || null,
        insights: latestEntry.insights || [],
      };
    });

    return summary;
  }

  function printSummary() {
    const summary = summarize();
    console.log('📊 Phase Journal Summary');
    const phaseEntries = Object.entries(summary.phases);
    if (!phaseEntries.length) {
      console.log(' • No phases have been journaled yet.');
      return summary;
    }

    phaseEntries.forEach(([phase, data]) => {
      const totalDuration = formatDuration(data.totalDurationMs);
      const averageDuration = formatDuration(data.averageDurationMs);
      const lastSummary = data.lastSummary ? ` — Last: ${data.lastSummary}` : '';
      console.log(
        ` • ${phase}: ${data.count} entr${data.count === 1 ? 'y' : 'ies'} • Total ${totalDuration} • Avg ${averageDuration}${lastSummary}`
      );
    });

    return summary;
  }

  function getState() {
    return state;
  }

  return {
    startPhase,
    recordEvent,
    completePhase,
    summarize,
    printSummary,
    getState,
  };
}

const journal = createPhaseJournal(phases);
const phaseLogs = []; // [MERGE: Retained from dev-branch for additional logging]

let phaseIndex = 0;
let cycleClosed = false;

if (typeof window !== 'undefined') {
  window.__phaseJournal = journal;
}

// 🔁 Repeating Functions
function onStart() {
  console.log("🌅 START: Beginning new numerology cycle."); // [MERGE: Used double quotes]
  const numerology = calculateNumerology();
  console.log(`🔢 Today's numerology value: ${numerology}`);
}

function onUpdate(phase) {
  console.log('UPDATE: Checking system state and recalibrating where needed.');
  const numerology = calculateNumerology();
  console.log(`》onUpdate: State refreshed, Numerology: ${numerology}`);

  journal.recordEvent(phase, 'update', 'System check-in completed.', {
    numerology,
    masterNumber: MASTER_NUMBERS.has(numerology),
    tags: ['update'],
  });
}

function onStop() {
  console.log('🛑 STOP: End of day reached.');
  console.log('》anUpdate: Final update before stopping.');

  journal.recordEvent('Release + Restart', 'stop', 'Cycle gracefully paused and archived.', {
    numerology: calculateNumerology(),
    tags: ['shutdown'],
  });
}

function onEOD() {
  console.log('EOD: End of day processing...');
  if (typeof phaseCorp === 'function') {
    phaseCorp('Cycle 9');
  }
  if (typeof mindStateRecursion === 'function') {
    mindStateRecursion('Clarity Index');
  }

  journal.recordEvent('Release + Restart', 'eod', 'End-of-day ritual executed.', {
    numerology: calculateNumerology(),
    tags: ['eod'],
  });

  onStop();
}

function onTask(phase) {
  if (phaseHeader) {
    phaseHeader.innerText = `Now in Phase: ${phase}`;
  }

  const numerology = calculateNumerology();
  const timestamp = new Date().toLocaleTimeString();
  const startMessage = `🌀 Task for Phase: "${phase}" started at ${timestamp} (Numerology: ${numerology})`;
  console.log(startMessage);

  phaseLogs.push(startMessage); // [MERGE: Added dev-branch's phaseLogs for compatibility]

  journal.recordEvent(phase, 'start-note', startMessage, {
    numerology,
    ordinal: phases.indexOf(phase) + 1,
  });

  const phaseMessage = PHASE_BEHAVIORS[phase] || '❓ Unknown phase. Awaiting further instruction...';
  console.log(phaseMessage);
  journal.recordEvent(phase, 'intent', phaseMessage, {
    focus: PHASE_FOCUS_MAP[phase],
  });


  const folderName = folderNames[phases.indexOf(phase)] || phase.replace(/\s+/g, '_'); // [MERGE: Used codex's folderNames with dev-branch's fallback]
  const folderLog = `📂 Logging to folder: /Numerology-Cycle-9/${folderName}`;
  console.log(folderLog);
  journal.recordEvent(phase, 'storage', folderLog, {
    context: 'filesystem-sim',
  });
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
    const numerology = calculateNumerology();

    journal.startPhase(phase, {
      numerology,
      phaseIndex,
      context: 'frontend-runtime',
    });

    console.log(`🔄 Starting Phase: ${phase}`);

    onTask(phase);

    if (phase === 'Reflection' || phase === 'Recalibration') {
      onUpdate(phase);
    }

    if (phase === 'Release + Restart') {
      onEOD();
      journal.completePhase(phase, {
        summary: 'Cycle archived and restart queued.',
        numerology,
        tags: ['eod', 'restart'],
      });
      cycleClosed = true;
      clearInterval(phaseInterval);
      journal.printSummary();
    } else {
      journal.completePhase(phase, {
        summary: 'Phase preview executed',
        numerology,
        tags: ['progress'],
      });
    }

    phaseIndex = (phaseIndex + 1) % phases.length;
  }, phaseDuration);

  // Safety shutdown trigger
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

      onEOD();
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

// 🧩 Highlight current cycle phase in UI
const currentCyclePhase = 4;  // Could be loaded dynamically
const phaseItems = document.querySelectorAll('li');
if (phaseItems.length >= currentCyclePhase) {
  phaseItems[currentCyclePhase - 1].style.fontWeight = 'bold';
}

// 🚀 Launch the system
main();