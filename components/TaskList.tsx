'use client';

import { useState } from 'react';
import useTasks from '@/hooks/useTasks';
import CreateTaskModal, { type CreateTaskFormData } from './CreateTaskModal';
import EditTaskModal, { type EditTaskFormData } from './EditTaskModal';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string; // Agent ID
  createdBy?: string; // Agent ID
  createdAt: any; // Firestore Timestamp | ISO string
  updatedAt: any; // Firestore Timestamp | ISO string
  dueDate?: any; // Firestore Timestamp | ISO string
  tags?: string[];
  messageCount?: number;

  // Approval audit trail
  approvedToExecute?: boolean;
  approvedBy?: string | null;
  approvedAt?: any; // Firestore Timestamp | null
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

function toJsDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value?.toDate === 'function') {
    const d = value.toDate();
    return d instanceof Date && !isNaN(d.getTime()) ? d : null;
  }
  const seconds = value?.seconds ?? value?._seconds;
  if (typeof seconds === 'number') {
    const d = new Date(seconds * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatDateShort(value: any): string {
  const d = toJsDate(value);
  if (!d) return '—';
  return d.toLocaleDateString();
}

function formatDateTime(value: any): string {
  const d = toJsDate(value);
  if (!d) return '—';
  return d.toLocaleString();
}

export default function TaskList() {
  const { tasks, loading, error, refetch } = useTasks();
  const [filter, setFilter] = useState<'all' | 'todo' | 'in_progress' | 'blocked' | 'done'>('all');
  const [approvedOnly, setApprovedOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleCreateTask = async (formData: CreateTaskFormData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      // Refetch tasks to update the list
      await refetch();
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };

  const handleEditTask = async (taskId: string, updates: EditTaskFormData) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Refetch tasks to update the list
      await refetch();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Refetch tasks to update the list
      await refetch();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };

  const filteredTasks = (() => {
    const statusFiltered = filter === 'all'
      ? tasks
      : tasks.filter(task => task.status === filter);

    if (!approvedOnly) return statusFiltered;
    return statusFiltered.filter(task => task.approvedToExecute === true);
  })();

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
    <>
      <CreateTaskModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
      
      <EditTaskModal 
        isOpen={isEditModalOpen}
        task={selectedTask}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleEditTask}
      />
      
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Header with filters */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
            <div className="flex items-center space-x-4">
              {/* Create Task Button */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                + Create Task
              </button>
              
              {/* Filter Buttons */}
              <div className="flex space-x-2">
            <FilterButton 
              label="All" 
              active={filter === 'all'} 
              onClick={() => setFilter('all')}
              count={tasks.length}
            />
            <FilterButton 
              label="Approved ✅" 
              active={approvedOnly}
              onClick={() => setApprovedOnly(!approvedOnly)}
              count={tasks.filter(t => t.approvedToExecute === true).length}
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
            <TaskRow 
              key={task.id} 
              task={task} 
              onEdit={openEditModal}
              onDelete={handleDeleteTask}
            />
          ))
        )}
      </div>
      </div>
    </>
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
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

function TaskRow({ task, onEdit, onDelete }: TaskRowProps) {
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
          {task.approvedToExecute === true && (
            <span
              className="px-2 py-1 rounded-md text-xs font-semibold border bg-green-50 text-green-700 border-green-200"
              title={`Approved by ${task.approvedBy ?? '—'} • ${formatDateTime(task.approvedAt)}`}
            >
              Approved ✅
            </span>
          )}
          <span className={`px-3 py-1 rounded-md text-xs font-semibold border ${statusColors[task.status]}`}>
            {statusLabels[task.status]}
          </span>
        </div>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600 space-y-3">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <div>
              <span className="font-semibold">Approval:</span>{' '}
              {task.approvedToExecute === true ? (
                <>
                  <span className="text-green-700 font-semibold">Approved ✅</span>
                  <span className="text-gray-500">
                    {' '}by <span className="uppercase font-mono">@{task.approvedBy ?? '—'}</span>
                    {' '}at {formatDateTime(task.approvedAt)}
                  </span>
                </>
              ) : (
                <span className="text-gray-700">Not approved</span>
              )}
            </div>

            <div>
              <span className="font-semibold">Created:</span>{' '}
              {formatDateShort(task.createdAt)}
            </div>
            {task.dueDate && (
              <div>
                <span className="font-semibold">Due:</span>{' '}
                {formatDateShort(task.dueDate)}
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
          
          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
