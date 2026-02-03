import ActivityFeed from '@/components/ActivityFeed';

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 gap-16 sm:p-20 bg-zinc-50 dark:bg-black">
      <main className="flex flex-col gap-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-zinc-50">Mission Control</h1>
          <p className="text-gray-600 dark:text-zinc-400 mt-2">Real-time agent coordination dashboard</p>
        </div>
        <ActivityFeed />
      </main>
    </div>
  );
}
