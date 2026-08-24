/**
 * jobs/scheduler.js
 * Responsibility: central job runner — registers all background jobs at boot.
 * Lightweight interval-based scheduler (no extra dependency):
 *   - each job runs on a fixed interval with overlap protection
 *   - timers are unref()'d so they never keep the process alive
 *   - start()/stop() are idempotent; runNow() triggers a job on demand
 */
const logger = require("../utils/logger");
const lowStockNotifier = require("./lowStockNotifier");
const expiringCoupons = require("./expiringCoupons");

const MINUTE = 60 * 1000;

const JOBS = [
  {
    name: "lowStockNotifier",
    intervalMs: Number(process.env.LOW_STOCK_JOB_INTERVAL_MS) || 30 * MINUTE,
    run: () => lowStockNotifier.run(),
  },
  {
    name: "expiringCoupons",
    intervalMs: Number(process.env.EXPIRING_COUPONS_JOB_INTERVAL_MS) || 60 * MINUTE,
    run: () => expiringCoupons.run(),
  },
];

const state = new Map(); // name -> { timer, running }

function scheduleJob(job) {
  const entry = { timer: null, running: false };
  state.set(job.name, entry);

  entry.timer = setInterval(async () => {
    if (entry.running) return; // skip tick if previous run still in progress
    entry.running = true;
    try {
      await job.run();
    } catch (err) {
      logger.error(`[scheduler] job "${job.name}" failed`, { error: err.message });
    } finally {
      entry.running = false;
    }
  }, job.intervalMs);

  entry.timer.unref();
}

function start({ runOnStart = false } = {}) {
  if (state.size > 0) return; // already started
  JOBS.forEach(scheduleJob);
  logger.info(
    `[scheduler] started ${JOBS.length} job(s): ${JOBS.map((j) => `${j.name}(${Math.round(j.intervalMs / 60000)}m)`).join(", ")}`
  );
  if (runOnStart) {
    JOBS.forEach((job) => module.exports.runNow(job.name).catch(() => {}));
  }
}

function stop() {
  state.forEach((entry) => clearInterval(entry.timer));
  state.clear();
}

async function runNow(name) {
  const job = JOBS.find((j) => j.name === name);
  if (!job) throw new Error(`Unknown job: ${name}`);
  const entry = state.get(name);
  if (entry && entry.running) return { skipped: true };
  try {
    if (entry) entry.running = true;
    const result = await job.run();
    return { skipped: false, result };
  } finally {
    if (entry) entry.running = false;
  }
}

module.exports = { start, stop, runNow, JOBS };
