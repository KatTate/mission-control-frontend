'use client';

import { useState, useEffect } from 'react';

interface HeaderProps {
  agentsActive: number;
  agentsTotal: number;
  tasksInQueue: number;
  projectName?: string;
  onChatClick?: () => void;
  onBroadcastClick?: () => void;
  onDocsClick?: () => void;
}

export default function Header({
  agentsActive,
  agentsTotal,
  tasksInQueue,
  projectName = 'SiteGPT',
  onChatClick,
  onBroadcastClick,
  onDocsClick,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }).toUpperCase()
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Logo and project name */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⊙</span>
            <span className="text-lg font-bold tracking-tight">MISSION CONTROL</span>
          </div>
          <div className="hidden sm:block px-3 py-1 bg-zinc-100 rounded text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {projectName}
          </div>
        </div>

        {/* Center: Stats */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{agentsActive}</div>
            <div className="text-xs uppercase tracking-wider text-zinc-500">Agents Active</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{tasksInQueue}</div>
            <div className="text-xs uppercase tracking-wider text-zinc-500">Tasks in Queue</div>
          </div>
        </div>

        {/* Right: Action buttons, clock, status */}
        <div className="flex items-center space-x-3">
          {/* Action buttons */}
          <div className="hidden sm:flex items-center space-x-2">
            <button
              onClick={onChatClick}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
            >
              <span>💬</span>
              <span>Chat</span>
            </button>
            <button
              onClick={onBroadcastClick}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-700 text-sm font-medium hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              <span>📡</span>
              <span>Broadcast</span>
            </button>
            <button
              onClick={onDocsClick}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-zinc-100 text-zinc-700 text-sm font-medium hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              <span>📄</span>
              <span>Docs</span>
            </button>
          </div>

          {/* Clock */}
          <div className="text-right hidden lg:block">
            <div className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100">{currentTime}</div>
            <div className="text-xs text-zinc-500">{currentDate}</div>
          </div>

          {/* Online status */}
          <div className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
