import { NextResponse } from 'next/server';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

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

  // Replit runs the app from the repo root.
  const cwd = process.cwd();

  const shaBefore = await gitSha(cwd);

  const logs: Array<{ step: string; out?: string; err?: string }> = [];

  // 1) Pull latest
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

  // 2) Optional build
  const doBuild = body.build !== false; // default true
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

  // 3) Optional restart
  const restart = body.restart === true;
  if (restart) {
    logs.push({ step: 'restart', out: 'process.exit(0) scheduled (Replit should restart on exit)' });
    setTimeout(() => {
      // eslint-disable-next-line no-process-exit
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
