'use client';

import React, { useEffect, useState } from 'react';
import { Schedule } from '../../utils/interfaces';
import { getSchedule } from '../../utils/scheduleUtils';
import ScheduleDashboard from '../../components/ScheduleDashboard';

export default function DashboardPage() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const data = await getSchedule();
        setSchedule(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  if (loading) return <div>Loading schedule...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!schedule) return <div>No schedule found.</div>;

  return (
    <ScheduleDashboard
      initialSchedule={schedule}
      onSave={setSchedule}
    />
  );
}