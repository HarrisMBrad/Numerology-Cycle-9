const DAY_IN_MS = 24 * 60 * 60 * 1000;

const DEFAULT_DELIVERABLES = [
  {
    id: 'UP-001',
    title: 'Cycle Presence + Numerology Broadcast',
    description: 'Capture the daily numerology focus and post an alignment note to the Upwork workspace.',
    dueDate: null,
    status: 'pending',
    priority: 'medium',
    tags: ['communication', 'daily-sync'],
    phaseRequirements: {
      Presence: 'Log numerology focus + availability update in Upwork message thread.',
      Connection: 'Echo progress touchpoint and confirm collaboration windows.',
      'Release + Restart': 'Roll the day-end note into the Upwork channel before cycle reset.',
    },
  },
  {
    id: 'UP-002',
    title: 'Deliverable Packaging & Submission Bundle',
    description: 'Bundle code artifacts, testing logs, and summary for Upwork deliverable submission queue.',
    dueDate: null,
    status: 'in-progress',
    priority: 'high',
    tags: ['delivery', 'packaging'],
    phaseRequirements: {
      Planning: 'Outline acceptance criteria + required artifacts for today\'s submissions.',
      Action: 'Advance implementation tied to acceptance criteria and capture commit references.',
      Reflection: 'Review implementation against requirements and list validation notes.',
      'Release + Restart': 'Package artifacts + attach notes to Upwork submission queue.',
    },
  },
  {
    id: 'UP-003',
    title: 'Client Feedback Integration Loop',
    description: 'Track clarifications + adjustments from the Upwork contract feedback stream.',
    dueDate: null,
    status: 'pending',
    priority: 'medium',
    tags: ['feedback', 'qa'],
    phaseRequirements: {
      Reflection: 'Catalogue new feedback threads and tag them by impact.',
      Correction: 'Apply adjustments or log blockers to Upwork for visibility.',
      Connection: 'Confirm resolution status + follow-up notes with client in Upwork.',
    },
  },
];

function normalizeDate(value) {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function computeDueInfo(deliverable, referenceDate = new Date()) {
  const dueDate = normalizeDate(deliverable.dueDate);
  if (!dueDate) {
    return { dueInDays: null, risk: 'n/a' };
  }

  const due = new Date(dueDate.getTime());
  const ref = new Date(referenceDate.getTime());
  due.setHours(23, 59, 59, 999);
  ref.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - ref.getTime();
  const dueInDays = Math.ceil(diffMs / DAY_IN_MS);

  let risk = 'on-track';
  if (dueInDays < 0) {
    risk = 'overdue';
  } else if (dueInDays === 0) {
    risk = 'due-today';
  } else if (dueInDays <= 2) {
    risk = 'due-soon';
  }

  return { dueInDays, risk };
}

function createDeliverableState(deliverable) {
  const state = {
    ...deliverable,
    status: deliverable.status || 'pending',
    tags: Array.isArray(deliverable.tags)
      ? [...deliverable.tags]
      : deliverable.tags
      ? [deliverable.tags]
      : [],
    history: deliverable.history ? [...deliverable.history] : [],
    submissions: deliverable.submissions ? [...deliverable.submissions] : [],
    phaseRequirements: deliverable.phaseRequirements || {},
    progress: {},
  };

  Object.keys(state.phaseRequirements).forEach((phase) => {
    state.progress[phase] = {
      touched: false,
      completed: false,
    };
  });

  return state;
}

function createUpworkTracker(deliverables = DEFAULT_DELIVERABLES) {
  const state = {
    deliverables: [],
    byId: new Map(),
    logs: [],
  };

  deliverables.forEach((deliverable) => {
    const normalized = createDeliverableState(deliverable);
    state.deliverables.push(normalized);
    state.byId.set(normalized.id, normalized);
  });

  function getDeliverables() {
    return state.deliverables;
  }

  function getDeliverable(id) {
    return state.byId.get(id) || null;
  }

  function getDeliverablesForPhase(phase) {
    return state.deliverables.filter(
      (deliverable) =>
        deliverable.phaseRequirements &&
        Object.prototype.hasOwnProperty.call(deliverable.phaseRequirements, phase)
    );
  }

  function pushLog(entry) {
    state.logs.push(entry);
  }

  function logPhaseTouch(phase, journal, options = {}) {
    const relevant = getDeliverablesForPhase(phase);
    if (!relevant.length) {
      return [];
    }

    const timestamp = options.date ? new Date(options.date) : new Date();
    const context = options.context || 'cycle-engine';

    relevant.forEach((deliverable) => {
      const progress = deliverable.progress[phase];
      if (progress && !progress.touched) {
        progress.touched = true;
      }

      const dueInfo = computeDueInfo(deliverable, timestamp);
      const expectation = deliverable.phaseRequirements[phase];
      const metadata = {
        deliverableId: deliverable.id,
        status: deliverable.status,
        dueDate: deliverable.dueDate || null,
        dueInDays: dueInfo.dueInDays,
        risk: dueInfo.risk,
        expectation,
        priority: deliverable.priority || null,
        tags: ['upwork', 'deliverable', ...deliverable.tags],
        context,
      };

      deliverable.history.push({
        type: 'phase-touch',
        phase,
        timestamp: timestamp.toISOString(),
        expectation,
        status: deliverable.status,
        context,
      });

      pushLog({
        type: 'phase-touch',
        phase,
        deliverableId: deliverable.id,
        timestamp: timestamp.toISOString(),
        expectation,
        status: deliverable.status,
        context,
      });

      if (options.autoAdvanceStatus && deliverable.status === 'pending') {
        deliverable.status = 'in-progress';
        deliverable.history.push({
          type: 'status',
          status: 'in-progress',
          phase,
          timestamp: timestamp.toISOString(),
          note: 'Auto advanced after phase touch.',
          context,
        });
        pushLog({
          type: 'status',
          status: 'in-progress',
          deliverableId: deliverable.id,
          phase,
          timestamp: timestamp.toISOString(),
          note: 'Auto advanced after phase touch.',
          context,
        });
      }

      if (journal) {
        journal.recordEvent(
          phase,
          'upwork:deliverable',
          `Upwork deliverable ${deliverable.id}: ${deliverable.title} — ${expectation}`,
          metadata
        );
      }
    });

    return relevant;
  }

  function updateDeliverableStatus(id, status, options = {}) {
    const deliverable = getDeliverable(id);
    if (!deliverable) {
      console.warn(`🟡 UpworkTracker: attempted to update unknown deliverable "${id}".`);
      return null;
    }

    const timestamp = options.date ? new Date(options.date) : new Date();
    const context = options.context || 'cycle-engine';

    deliverable.status = status;
    if (!options.skipHistory) {
      deliverable.history.push({
        type: 'status',
        status,
        phase: options.phase || null,
        note: options.note || null,
        timestamp: timestamp.toISOString(),
        context,
      });
    }

    pushLog({
      type: 'status',
      status,
      deliverableId: id,
      phase: options.phase || null,
      timestamp: timestamp.toISOString(),
      note: options.note || null,
      context,
    });

    if (options.journal && options.phase) {
      options.journal.recordEvent(
        options.phase,
        'upwork:status',
        `Deliverable ${id} marked ${status}.`,
        {
          deliverableId: id,
          status,
          note: options.note || null,
          tags: ['upwork', 'status'],
          context,
        }
      );
    }

    return deliverable;
  }

  function markPhaseComplete(phase, journal, options = {}) {
    const relevant = getDeliverablesForPhase(phase);
    if (!relevant.length) {
      return [];
    }

    const timestamp = options.date ? new Date(options.date) : new Date();
    const context = options.context || 'cycle-engine';

    relevant.forEach((deliverable) => {
      const progress = deliverable.progress[phase];
      if (!progress || progress.completed) {
        return;
      }

      progress.completed = true;

      const dueInfo = computeDueInfo(deliverable, timestamp);
      const expectation = deliverable.phaseRequirements[phase];
      const metadata = {
        deliverableId: deliverable.id,
        status: deliverable.status,
        dueDate: deliverable.dueDate || null,
        dueInDays: dueInfo.dueInDays,
        risk: dueInfo.risk,
        expectation,
        priority: deliverable.priority || null,
        tags: ['upwork', 'phase-complete', ...deliverable.tags],
        context,
      };

      deliverable.history.push({
        type: 'phase-complete',
        phase,
        timestamp: timestamp.toISOString(),
        expectation,
        status: deliverable.status,
        context,
      });

      pushLog({
        type: 'phase-complete',
        phase,
        deliverableId: deliverable.id,
        timestamp: timestamp.toISOString(),
        status: deliverable.status,
        context,
      });

      if (journal) {
        journal.recordEvent(
          phase,
          'upwork:phase-complete',
          `Upwork requirement fulfilled for deliverable ${deliverable.id}.`,
          metadata
        );
      }

      if (
        options.autoCompleteDeliverable &&
        Object.values(deliverable.progress).every((p) => p.completed)
      ) {
        updateDeliverableStatus(deliverable.id, options.completeStatus || 'ready-for-client', {
          phase,
          journal,
          note: 'All phase requirements satisfied.',
          context,
        });
      }
    });

    return relevant;
  }

  function recordSubmission(id, submission, options = {}) {
    const deliverable = getDeliverable(id);
    if (!deliverable) {
      console.warn(`🟡 UpworkTracker: attempted to log submission for unknown deliverable "${id}".`);
      return null;
    }

    const timestamp = options.date ? new Date(options.date) : new Date();
    const context = submission.context || options.context || 'upwork';

    const entry = {
      type: 'submission',
      link: submission.link || null,
      note: submission.note || null,
      attachment: submission.attachment || null,
      phase: options.phase || null,
      timestamp: timestamp.toISOString(),
      context,
    };

    deliverable.submissions.push(entry);
    deliverable.history.push(entry);
    pushLog({ ...entry, deliverableId: id });

    if (options.journal && options.phase) {
      options.journal.recordEvent(
        options.phase,
        'upwork:submission',
        `Deliverable ${id} submitted to Upwork queue.`,
        {
          deliverableId: id,
          link: submission.link || null,
          note: submission.note || null,
          attachment: submission.attachment || null,
          tags: ['upwork', 'submission'],
          context,
        }
      );
    }

    if (submission.autoCompleteStatus) {
      updateDeliverableStatus(id, submission.autoCompleteStatus, {
        phase: options.phase,
        journal: options.journal,
        note: submission.note || 'Submission completed.',
        context,
      });
    }

    return entry;
  }

  function getAtRiskDeliverables(referenceDate = new Date()) {
    const snapshotDate = new Date(referenceDate);
    return state.deliverables
      .map((deliverable) => ({
        deliverable,
        dueInfo: computeDueInfo(deliverable, snapshotDate),
      }))
      .filter(({ deliverable, dueInfo }) => {
        if (!deliverable.dueDate) {
          return false;
        }
        return dueInfo.risk === 'due-today' || dueInfo.risk === 'overdue' || dueInfo.risk === 'due-soon';
      });
  }

  function summarize(referenceDate = new Date()) {
    const snapshotDate = new Date(referenceDate);
    const summary = state.deliverables.map((deliverable) => {
      const dueInfo = computeDueInfo(deliverable, snapshotDate);
      const outstandingPhases = Object.entries(deliverable.progress)
        .filter(([, progress]) => !progress.completed)
        .map(([phase]) => phase);
      const completedPhases = Object.entries(deliverable.progress)
        .filter(([, progress]) => progress.completed)
        .map(([phase]) => phase);

      return {
        id: deliverable.id,
        title: deliverable.title,
        status: deliverable.status,
        dueDate: deliverable.dueDate || null,
        dueInDays: dueInfo.dueInDays,
        risk: dueInfo.risk,
        outstandingPhases,
        completedPhases,
        priority: deliverable.priority || null,
      };
    });

    const byStatus = summary.reduce((acc, item) => {
      const key = item.status || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const atRisk = summary
      .filter((item) => item.risk === 'due-today' || item.risk === 'overdue')
      .map((item) => item.id);

    return {
      deliverables: summary,
      totals: {
        count: summary.length,
        byStatus,
        atRisk,
      },
    };
  }

  function getLogs() {
    return [...state.logs];
  }

  return {
    getDeliverables,
    getDeliverable,
    getDeliverablesForPhase,
    logPhaseTouch,
    markPhaseComplete,
    updateDeliverableStatus,
    recordSubmission,
    getAtRiskDeliverables,
    summarize,
    getLogs,
  };
}

module.exports = {
  createUpworkTracker,
  DEFAULT_DELIVERABLES,
  computeDueInfo,
};

