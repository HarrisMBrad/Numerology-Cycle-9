const fs = require('fs');
const path = require('path');

const DEFAULT_JOURNAL_DIR = path.join(__dirname, 'journal');
const DEFAULT_LATEST_FILE = 'phase-journal-latest.json';

function safeTimestamp(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, '-');
}

function getJournalState(journal) {
  if (!journal || typeof journal.getState !== 'function') {
    return {
      phases: [],
      entries: [],
      active: null,
      summary: null,
    };
  }

  const state = journal.getState();
  const active = state.active
    ? {
        phase: state.active.phase,
        startedAt: state.active.startedAt instanceof Date
          ? state.active.startedAt.toISOString()
          : null,
      }
    : null;

  return {
    phases: Array.isArray(state.phases) ? state.phases : [],
    entries: Array.isArray(state.entries) ? state.entries : [],
    active,
    summary: typeof journal.summarize === 'function' ? journal.summarize() : null,
  };
}

function getUpworkState(upworkTracker) {
  if (!upworkTracker || typeof upworkTracker.summarize !== 'function') {
    return null;
  }

  return upworkTracker.summarize();
}

function createJournalStore(options = {}) {
  const outputDir = options.outputDir || process.env.CYCLE9_JOURNAL_DIR || DEFAULT_JOURNAL_DIR;
  const latestFileName = options.latestFileName || DEFAULT_LATEST_FILE;

  function buildSnapshot(journal, upworkTracker, metadata = {}) {
    return {
      exportedAt: new Date().toISOString(),
      metadata,
      journal: getJournalState(journal),
      upwork: getUpworkState(upworkTracker),
    };
  }

  function writeSnapshot(journal, upworkTracker, options = {}) {
    const snapshot = buildSnapshot(journal, upworkTracker, options.metadata || {});
    fs.mkdirSync(outputDir, { recursive: true });

    const written = [];
    const latestPath = path.join(outputDir, latestFileName);
    fs.writeFileSync(latestPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    written.push(latestPath);

    if (options.timestamped) {
      const timestampedPath = path.join(outputDir, `phase-journal-${safeTimestamp()}.json`);
      fs.writeFileSync(timestampedPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
      written.push(timestampedPath);
    }

    return {
      snapshot,
      written,
    };
  }

  return {
    outputDir,
    buildSnapshot,
    writeSnapshot,
  };
}

module.exports = {
  createJournalStore,
  DEFAULT_JOURNAL_DIR,
  DEFAULT_LATEST_FILE,
};
