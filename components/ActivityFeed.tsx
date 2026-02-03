'use client';

import { useActivities } from '@/hooks/useActivities';

export default function ActivityFeed() {
  const { activities, loading, error } = useActivities(50);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading activities...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800 font-semibold">Error loading activities</p>
        <p className="text-red-600 text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-8 bg-gray-50 border border-gray-200 rounded-lg text-center">
        <p className="text-gray-600">No activities yet</p>
        <p className="text-gray-500 text-sm mt-2">Agent activities will appear here in real-time</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Activity Feed</h2>
      <div className="space-y-2">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900 uppercase text-sm">
                    {activity.agentId}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 text-sm">{activity.type}</span>
                </div>
                <p className="mt-2 text-gray-700">{activity.message}</p>
              </div>
              <div className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                {activity.createdAt?.toDate?.()?.toLocaleString() || 'Unknown time'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
