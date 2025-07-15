'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Schedule, Day } from '../../utils/interfaces';
import { getSchedule, saveSchedule } from '../../utils/scheduleUtils';
import ScheduleDashboard from '../../components/ScheduleDashboard';
import DayScheduleView from '../../components/DayScheduleView';

export default function DashboardPage() {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [selectedDay, setSelectedDay] = useState<Day>(Day.MONDAY);
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const data = await getSchedule();
        setSchedule(data);
      } catch (err: any) {
        const msg = err.message || 'Failed to load schedule';
        console.log(msg);
        if (msg.includes('Not authenticated') || msg.includes('logging in') || msg.includes("log in")) {
          setAuthError(msg);
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const handleSaveSchedule = async (savedSchedule: Schedule) => {
    await saveSchedule(savedSchedule);
    setSchedule(savedSchedule);
  };

  const handleGenerateSchedule = () => {
    // TODO: Implement schedule generation logic
    console.log('Generating schedule...');
    alert('Schedule generation feature coming soon!');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) return <div>Loading schedule...</div>;
  if (authError) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-gray-200 mt-12">
        <h2 className="text-xl font-bold text-red-700 mb-4">Authentication Required</h2>
        <p className="text-gray-700 mb-6">{authError}</p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
  if (error) return <div>Error: {error}</div>;
  if (!schedule) return <div>No schedule found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Menu</h2>
          <div className="space-y-2">
            <div className="p-3 bg-gray-100 rounded-md">
              <p className="text-gray-600">Sidebar content coming soon...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="ml-4 text-2xl font-bold text-gray-900">Dashboard</h1>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setViewMode('edit')}
                  className={`px-2 py-1 sm:px-4 sm:py-2 rounded-md font-medium transition-colors text-sm sm:text-base ${viewMode === 'edit' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                >
                  <span className="hidden sm:inline">Edit Schedule</span>
                  <span className="sm:hidden">Edit</span>
                </button>
                <button
                  onClick={() => setViewMode('view')}
                  className={`px-2 py-1 sm:px-4 sm:py-2 rounded-md font-medium transition-colors text-sm sm:text-base ${viewMode === 'view' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                >
                  <span className="hidden sm:inline">View Schedule</span>
                  <span className="sm:hidden">View</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Day Navigation (only in view mode) */}
        {viewMode === 'view' && (
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Object.entries({
                  MONDAY: 'Mon',
                  TUESDAY: 'Tue', 
                  WEDNESDAY: 'Wed',
                  THURSDAY: 'Thu',
                  FRIDAY: 'Fri',
                  SATURDAY: 'Sat',
                  SUNDAY: 'Sun'
                }).map(([day, label]) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day as Day)}
                    className={`px-4 py-2 rounded-md font-medium whitespace-nowrap transition-colors ${selectedDay === day ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Schedule Section */}
          <div className="mb-8">
            {viewMode === 'edit' ? (
              <ScheduleDashboard
                initialSchedule={schedule}
                onSave={handleSaveSchedule}
              />
            ) : (
              <DayScheduleView
                schedule={schedule}
                day={selectedDay}
              />
            )}
          </div>

          {/* Generate Schedule Button */}
          <div className="flex justify-center">
            <button
              onClick={handleGenerateSchedule}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-green-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generate Schedule</span>
              </div>
            </button>
          </div>

          {/* Schedule Summary (in view mode) */}
          {viewMode === 'view' && (
            <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Schedule Summary
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-600">{schedule.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Active Days:</span>
                  <span className="ml-2 text-gray-600">
                    {schedule.active_days.length} days selected
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Daily Hours:</span>
                  <span className="ml-2 text-gray-600">
                    {schedule.start_time} - {schedule.end_time}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total Tasks:</span>
                  <span className="ml-2 text-gray-600">
                    {schedule.tasks.length + schedule.mandatory_tasks.length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}