import { NextResponse } from 'next/server';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const execFileAsync = promisify(execFile);

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

function findRepoRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    if (existsSync(resolve(dir, '.git')) && existsSync(resolve(dir, 'package.json'))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
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
  };

  const cwd = findRepoRoot();

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
