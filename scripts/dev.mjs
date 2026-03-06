import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const procs = [];

function run(cmd, args, opts = {}) {
  const p = spawn(cmd, args, { stdio: 'inherit', ...opts });
  procs.push(p);
  return p;
}

function shutdown(code = 0) {
  for (const p of procs) {
    try {
      p.kill('SIGTERM');
    } catch {}
  }
  setTimeout(() => process.exit(code), 500);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

run('node', [path.join(ROOT, 'packages/api-server/src/index.js')], { env: { ...process.env, PORT: '8080' }, cwd: ROOT });
run('npm', ['--prefix', path.join(ROOT, 'packages/ui'), 'run', 'dev'], { cwd: ROOT });
