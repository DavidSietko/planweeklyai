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
    <div className="w-full flex justify-center items-start">
      <div className="flex gap-6 py-8 px-2 w-full max-w-full overflow-x-auto justify-center items-start scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
        {sortedDates.map(date => (
          <div key={date} className="flex-shrink-0 h-[90vh] flex items-stretch">
            <DailyEventsBox date={date} events={grouped[date]} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyEventsView; 