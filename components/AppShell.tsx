import SidebarNav from '@/components/SidebarNav';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-zinc-50/80 backdrop-blur dark:border-zinc-800 dark:bg-black/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-xl font-bold tracking-tight">Mission Control</div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              Real-time agent coordination dashboard
            </div>
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            v0 (MVP)
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 md:grid-cols-[240px_1fr]">
        <aside className="md:sticky md:top-[88px] md:self-start">
          <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Views
            </div>
            <SidebarNav />
          </div>
        </aside>

        <main className="space-y-8">{children}</main>
      </div>
    </div>
  );
}
