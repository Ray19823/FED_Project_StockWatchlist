// Frees the TCP port before starting the app (macOS/Linux)
// Kills only Node/Nodemon processes bound to the chosen port.

const { execSync } = require('child_process');

const port = String(process.env.PORT || 3000);

function run(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
  } catch {
    return '';
  }
}

function pidsOnPort() {
  const out = run(`lsof -nP -iTCP:${port} -sTCP:LISTEN -t`).trim();
  if (!out) return [];
  return out.split('\n').map(s => s.trim()).filter(Boolean);
}

function isNodePid(pid) {
  const out = run(`ps -o comm= -p ${pid}`).trim();
  return /node|nodemon/i.test(out);
}

function sleep(ms) {
  // portable tiny sleep using shell
  run(`sleep ${ms / 1000}`);
}

function killPids(pids, signal) {
  for (const pid of pids) {
    try {
      process.kill(Number(pid), signal);
    } catch {}
  }
}

(function main() {
  let pids = pidsOnPort().filter(isNodePid);
  if (pids.length === 0) {
    console.log(`Port ${port} is free.`);
    return;
  }

  console.log(`Freeing port ${port}: found Node PIDs ${pids.join(', ')}`);
  killPids(pids, 'SIGTERM');

  // wait up to ~3s for graceful exit
  for (let i = 0; i < 30; i++) {
    sleep(100);
    pids = pidsOnPort().filter(isNodePid);
    if (pids.length === 0) break;
  }

  if (pids.length > 0) {
    console.log(`Escalating to SIGKILL for PIDs ${pids.join(', ')}`);
    killPids(pids, 'SIGKILL');
    // brief wait
    sleep(200);
  }

  const remaining = pidsOnPort().filter(isNodePid);
  if (remaining.length === 0) {
    console.log(`Port ${port} is now free.`);
  } else {
    console.log(`Warning: port ${port} still in use by PIDs ${remaining.join(', ')}`);
  }
})();
