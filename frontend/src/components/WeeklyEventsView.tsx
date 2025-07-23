import React from 'react';
import { Event } from '../utils/interfaces';
import DailyEventsBox from '../components/DailyEventsBox';

interface WeeklyEventsViewProps {
  events: Event[];
}

// Helper to group events by date (YYYY-MM-DD)
function groupEventsByDay(events: Event[]) {
  return events.reduce((acc, event) => {
    const date = event.start.dateTime.slice(0, 10); // 'YYYY-MM-DD'
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, Event[]>);
}

const WeeklyEventsView: React.FC<WeeklyEventsViewProps> = ({ events }) => {
  const grouped = groupEventsByDay(events);
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="w-full min-w-0 flex flex-col items-center justify-center overflow-x-auto">
      <div className="w-full min-w-0 flex justify-center items-center">
        <div className="flex gap-4 scroll-pl-4 pr-4 py-4 w-max h-[85vh] overflow-x-auto justify-start items-center scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 snap-x snap-mandatory">
          {sortedDates.map(date => (
            <div key={date} className="flex-shrink-0 h-full flex items-stretch snap-center">
              <DailyEventsBox date={date} events={grouped[date]} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-4 mt-6 mb-2 justify-center">
        <button
          className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
          onClick={() => { /* TODO: Implement re-generate logic */ }}
        >
          Re-generate
        </button>
        <button
          className="px-6 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 transition"
          onClick={() => { /* TODO: Implement sync logic */ }}
        >
          Sync
        </button>
      </div>
    </div>
  );
};

export default WeeklyEventsView; 