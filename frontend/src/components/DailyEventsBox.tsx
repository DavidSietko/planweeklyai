import React from 'react';
import { Event } from '../utils/interfaces';

interface DailyEventsBoxProps {
  date: string; // 'YYYY-MM-DD'
  events: Event[];
}

function formatTime(dateTime: string) {
  const date = new Date(dateTime);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
}

const DailyEventsBox: React.FC<DailyEventsBoxProps> = ({ date, events }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 min-w-[280px] max-w-xs flex-1 h-full flex flex-col justify-start overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-blue-700 sticky top-0 bg-white z-10 pb-2">{formatDate(date)}</h2>
      <div className="space-y-4">
        {events.map(event => (
          <div key={event.id} className="border-l-4 border-blue-400 pl-3 py-2 bg-blue-50 rounded">
            <div className="font-semibold text-gray-900">{event.summary}</div>
            <div className="text-sm text-gray-700">
              {formatTime(event.start.dateTime)} - {formatTime(event.end.dateTime)}
            </div>
            {event.location && (
              <div className="text-xs text-gray-500 mt-1">📍 {event.location}</div>
            )}
            {event.description && (
              <div className="text-xs text-gray-400 mt-1">{event.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyEventsBox; 