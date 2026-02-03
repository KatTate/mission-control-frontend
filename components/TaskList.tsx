'use client';

import { useState } from 'react';
import useTasks from '@/hooks/useTasks';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string; // Agent ID
  createdBy?: string; // Agent ID
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  dueDate?: string; // ISO timestamp
  tags?: string[];
  messageCount?: number;
}

const statusColors = {
  todo: 'bg-gray-100 text-gray-800 border-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
  blocked: 'bg-red-100 text-red-800 border-red-300',
  done: 'bg-green-100 text-green-800 border-green-300',
};

const priorityColors = {
  low: 'text-gray-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
};

const priorityLabels = {
  low: '○',
  medium: '◐',
  high: '◉',
  urgent: '🔥',
};

const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  done: 'Done',
};

export default function TaskList() {
  const { tasks, loading, error } = useTasks();
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'blocked' | 'done'>('all');

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <p className="text-red-600">Error loading tasks: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header with filters */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <div className="flex space-x-2">
            <FilterButton 
              label="All" 
              active={filter === 'all'} 
              onClick={() => setFilter('all')}
              count={tasks.length}
            />
            <FilterButton 
              label="To Do" 
              active={filter === 'todo'} 
              onClick={() => setFilter('todo')}
              count={tasks.filter(t => t.status === 'todo').length}
            />
            <FilterButton 
              label="In Progress" 
              active={filter === 'in_progress'} 
              onClick={() => setFilter('in_progress')}
              count={tasks.filter(t => t.status === 'in_progress').length}
            />
            <FilterButton 
              label="Blocked" 
              active={filter === 'blocked'} 
              onClick={() => setFilter('blocked')}
              count={tasks.filter(t => t.status === 'blocked').length}
            />
            <FilterButton 
              label="Done" 
              active={filter === 'done'} 
              onClick={() => setFilter('done')}
              count={tasks.filter(t => t.status === 'done').length}
            />
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="divide-y divide-gray-200">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg">No tasks found</p>
            <p className="text-sm mt-2">
              {filter !== 'all' ? `No ${statusLabels[filter]} tasks` : 'Create a task to get started'}
            </p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskRow key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
}

// Filter button component
interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  count: number;
}

function FilterButton({ label, active, onClick, count }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label} <span className="opacity-75">({count})</span>
    </button>
  );
}

// Task row component
interface TaskRowProps {
  task: Task;
}

function TaskRow({ task }: TaskRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        {/* Left: Priority + Title */}
        <div className="flex items-start space-x-3 flex-1">
          <span className={`text-2xl ${priorityColors[task.priority]}`}>
            {priorityLabels[task.priority]}
          </span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            {expanded && task.description && (
              <p className="text-sm text-gray-600 mt-2">{task.description}</p>
            )}
          </div>
        </div>

        {/* Right: Status + Metadata */}
        <div className="flex items-center space-x-4 ml-4">
          {task.assignedTo && (
            <span className="text-sm text-gray-600 uppercase font-mono">
              @{task.assignedTo}
            </span>
          )}
          {task.messageCount && task.messageCount > 0 && (
            <span className="text-sm text-gray-500">
              💬 {task.messageCount}
            </span>
          )}
          <span className={`px-3 py-1 rounded-md text-xs font-semibold border ${statusColors[task.status]}`}>
            {statusLabels[task.status]}
          </span>
        </div>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600 space-y-2">
          <div className="flex space-x-6">
            <div>
              <span className="font-semibold">Created:</span>{' '}
              {new Date(task.createdAt).toLocaleDateString()}
            </div>
            {task.dueDate && (
              <div>
                <span className="font-semibold">Due:</span>{' '}
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
            {task.createdBy && (
              <div>
                <span className="font-semibold">Created by:</span>{' '}
                <span className="uppercase font-mono">@{task.createdBy}</span>
              </div>
            )}
          </div>
          {task.tags && task.tags.length > 0 && (
            <div className="flex space-x-2">
              {task.tags.map(tag => (
                <span 
                  key={tag} 
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
