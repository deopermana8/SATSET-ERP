const intervalMs = Number(process.env.WORKER_INTERVAL_MS ?? 5000);

console.log("[worker] ready");

setInterval(() => {
  console.log(`[worker] heartbeat ${new Date().toISOString()}`);
}, intervalMs);