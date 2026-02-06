import { NextResponse } from 'next/server';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';

const execFileAsync = promisify(execFile);

function findRepoRoot(startDir: string): string | null {
  const hasMarkers = (dir: string) =>
    fs.existsSync(path.join(dir, '.git')) && fs.existsSync(path.join(dir, 'package.json'));

  const walkUp = (dir: string) => {
    let cur = dir;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (hasMarkers(cur)) return cur;
      const parent = path.dirname(cur);
      if (parent === cur) return null;
      cur = parent;
    }
  };

  // Try a few likely bases (Replit/Next can change cwd).
  const candidates = [
    startDir,
    process.env.REPL_HOME,
    process.env.PWD,
  ].filter(Boolean) as string[];

  for (const c of candidates) {
    const root = walkUp(c);
    if (root) return root;
  }

  return null;
}

async function sh(cmd: string, args: string[], cwd: string) {
  const { stdout, stderr } = await execFileAsync(cmd, args, {
    cwd,
    timeout: 5 * 60 * 1000,
    maxBuffer: 10 * 1024 * 1024,
    env: process.env,
  });
  return { stdout: stdout?.toString?.() ?? '', stderr: stderr?.toString?.() ?? '' };
}

async function gitSha(cwd: string) {
  try {
    const { stdout } = await sh('git', ['rev-parse', '--short', 'HEAD'], cwd);
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const secret = process.env.DEPLOY_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'DEPLOY_SECRET not configured on server' },
      { status: 503 }
    );
  }

  const auth = request.headers.get('x-deploy-secret') || '';
  if (auth !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    restart?: boolean;
    build?: boolean;
    install?: boolean;
  };

  // Next.js/Replit may run API routes from a build dir; locate the repo root.
  const cwd = findRepoRoot(process.cwd());
  if (!cwd) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Could not locate repo root (.git + package.json) to run deploy commands',
        debug: { cwd: process.cwd(), replHome: process.env.REPL_HOME ?? null },
      },
      { status: 500 }
    );
  }

  const shaBefore = await gitSha(cwd);

  const logs: Array<{ step: string; out?: string; err?: string }> = [];

  logs.push({ step: 'repo-root', out: cwd });

  try {
    const res = await sh('git', ['pull', 'origin', 'main'], cwd);
    logs.push({ step: 'git pull origin main', out: res.stdout, err: res.stderr });
  } catch (e: any) {
    logs.push({ step: 'git pull origin main', err: String(e?.message || e) });
    return NextResponse.json(
      { ok: false, shaBefore, shaAfter: shaBefore, logs },
      { status: 500 }
    );
  }

  // 2) Dependencies (default true): npm ci if lockfile exists, else npm install
  const doInstall = body.install !== false;
  if (doInstall) {
    try {
      const hasLock = fs.existsSync(path.join(cwd, 'package-lock.json'));
      const args = hasLock ? ['ci'] : ['install'];
      const res = await sh('npm', args, cwd);
      logs.push({ step: `npm ${args.join(' ')}`, out: res.stdout, err: res.stderr });
    } catch (e: any) {
      logs.push({ step: 'npm install/ci', err: String(e?.message || e) });
      return NextResponse.json(
        { ok: false, shaBefore, shaAfter: await gitSha(cwd), logs },
        { status: 500 }
      );
    }
  }

  // 3) Build
  const doBuild = body.build !== false;
  if (doBuild) {
    try {
      const res = await sh('npm', ['run', '-s', 'build'], cwd);
      logs.push({ step: 'npm run build', out: res.stdout, err: res.stderr });
    } catch (e: any) {
      logs.push({ step: 'npm run build', err: String(e?.message || e) });
      return NextResponse.json(
        { ok: false, shaBefore, shaAfter: await gitSha(cwd), logs },
        { status: 500 }
      );
    }
  }

  const shaAfter = await gitSha(cwd);

  const restart = body.restart === true;
  if (restart) {
    logs.push({ step: 'restart', out: 'process.exit(0) scheduled (Replit should restart on exit)' });
    setTimeout(() => {
      process.exit(0);
    }, 750);
  }

  return NextResponse.json({
    ok: true,
    shaBefore,
    shaAfter,
    restarted: restart,
    serverTime: new Date().toISOString(),
    logs,
  });
}
