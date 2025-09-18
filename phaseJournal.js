const { calculateNumerology, MASTER_NUMBERS } = require('./onStart');

const DEFAULT_FOCUS_MAP = {
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
    return remainingSeconds
      ? `${totalMinutes}m ${remainingSeconds}s`
      : `${totalMinutes}m`;
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

function createPhaseJournal(phases, { focusMap = DEFAULT_FOCUS_MAP } = {}) {
  const state = {
    phases: Array.isArray(phases) ? [...phases] : [],
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
    const focus = metadata.focus || focusMap[phase] || 'Maintain alignment and intention.';
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

module.exports = {
  createPhaseJournal,
  DEFAULT_FOCUS_MAP,
};
