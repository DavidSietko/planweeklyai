'use client';

import React, { useState } from 'react';
import { Schedule, Task, MandatoryTask, Day, DaySelection } from '../utils/interfaces';
import { 
    DAY_LABELS, 
    formatTime, 
    getTaskDurationString, 
    createEmptyTask,
    createEmptyMandatoryTask,
    validateSchedule,
    getActiveDaysString,
    arrayToDaySelection,
    daySelectionToArray
} from '../utils/scheduleUtils';

interface ScheduleDashboardProps {
    initialSchedule: Schedule;
    onSave?: (schedule: Schedule) => void;
}

export default function ScheduleDashboard({ 
    initialSchedule, 
    onSave 
}: ScheduleDashboardProps) {
    const [schedule, setSchedule] = useState<Schedule>(initialSchedule);
    const [errors, setErrors] = useState<string[]>([]);

    const handleScheduleNameChange = (name: string) => {
        setSchedule(prev => ({ ...prev, name }));
    };

    const handleTimeChange = (field: 'start_time' | 'end_time', value: string) => {
        setSchedule(prev => ({ ...prev, [field]: value }));
    };

    const handleDaySelectionChange = (day: Day, selected: boolean) => {
        setSchedule(prev => {
            const newActiveDays = selected 
                ? [...prev.active_days, day]
                : prev.active_days.filter(d => d !== day);
            return { ...prev, active_days: newActiveDays };
        });
    };

    const addTask = () => {
        const newTask = createEmptyTask();
        setSchedule(prev => ({
            ...prev,
            tasks: [...prev.tasks, newTask]
        }));
    };

    const updateTask = (taskId: string, updates: Partial<Task>) => {
        setSchedule(prev => ({
            ...prev,
            tasks: prev.tasks.map(task => 
                task.id === taskId ? { ...task, ...updates } : task
            )   
        }));
    };

    const removeTask = (taskId: string) => {
        setSchedule(prev => ({
            ...prev,
            tasks: prev.tasks.filter(task => task.id !== taskId)
        }));
    };

    const addMandatoryTask = () => {
        const newMandatoryTask = createEmptyMandatoryTask();
        setSchedule(prev => ({
            ...prev,
            mandatory_tasks: [...prev.mandatory_tasks, newMandatoryTask]
        }));
    };

    const updateMandatoryTask = (taskId: string, updates: Partial<MandatoryTask>) => {
        setSchedule(prev => ({
            ...prev,
            mandatory_tasks: prev.mandatory_tasks.map(task => 
                task.id === taskId ? { ...task, ...updates } : task
            )
        }));
    };

    const removeMandatoryTask = (taskId: string) => {
        setSchedule(prev => ({
            ...prev,
            mandatory_tasks: prev.mandatory_tasks.filter(task => task.id !== taskId)
        }));
    };

    const handleSave = () => {
        const validationErrors = validateSchedule(schedule);
        setErrors(validationErrors);
        
        if (validationErrors.length === 0) {
            const updatedSchedule = {
                ...schedule,
                updatedAt: new Date()
            };
            onSave?.(updatedSchedule);
        }
    };

    const daySelection = arrayToDaySelection(schedule.active_days);

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <h1 className="text-2xl font-bold text-white">Schedule Editor</h1>
                <p className="text-blue-100 mt-1">Create and manage your weekly schedule</p>
            </div>

            <div className="p-6 space-y-6">
                {/* Schedule Name */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                        Schedule Name
                    </label>
                    <input
                        type="text"
                        value={schedule.name}
                        onChange={(e) => handleScheduleNameChange(e.target.value)}
                        placeholder="e.g., Work Schedule, Weekday Routine"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-colors"
                    />
                </div>

                {/* Day Selection */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                        Active Days
                    </label>
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {Object.entries(DAY_LABELS).map(([day, label]) => (
                            <label key={day} className="flex flex-col items-center">
                                <input
                                    type="checkbox"
                                    checked={daySelection[day as Day]}
                                    onChange={(e) => handleDaySelectionChange(day as Day, e.target.checked)}
                                    className="sr-only"
                                />
                                <div className={`
                                    w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl border-2 flex items-center justify-center text-xs sm:text-sm font-semibold cursor-pointer transition-all duration-200
                                    ${daySelection[day as Day] 
                                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white border-blue-500 shadow-lg transform scale-105' 
                                        : 'bg-gray-50 text-gray-600 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                                    }
                                `}>
                                    {label.slice(0, 3)}
                                </div>
                            </label>
                        ))}
                    </div>
                    <p className="text-sm text-gray-500">
                        Active: {getActiveDaysString(schedule)}
                    </p>
                </div>

                {/* Schedule Time Range */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Daily Start Time
                        </label>
                        <input
                            type="time"
                            value={schedule.start_time}
                            onChange={(e) => handleTimeChange('start_time', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Daily End Time
                        </label>
                        <input
                            type="time"
                            value={schedule.end_time}
                            onChange={(e) => handleTimeChange('end_time', e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Mandatory Tasks Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                            Mandatory Tasks
                        </h2>
                        <button
                            onClick={addMandatoryTask}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Mandatory Task</span>
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                        {schedule.mandatory_tasks.map((task) => (
                            <MandatoryTaskCard
                                key={task.id}
                                task={task}
                                onUpdate={(updates) => updateMandatoryTask(task.id, updates)}
                                onRemove={() => removeMandatoryTask(task.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Regular Tasks Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                            Tasks
                        </h2>
                        <button
                            onClick={addTask}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Task</span>
                        </button>
                    </div>
                    
                    <div className="space-y-4">
                                        {schedule.tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        schedule={schedule}
                        onUpdate={(updates) => updateTask(task.id, updates)}
                        onRemove={() => removeTask(task.id)}
                    />
                ))}
                    </div>
                </div>

                {/* Validation Errors */}
                {errors.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
                        <ul className="text-sm text-red-700 space-y-1">
                            {errors.map((error, index) => (
                                <li key={index}>• {error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-green-300 focus:ring-opacity-50 flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Schedule</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

// Task Card Component
interface TaskCardProps {
    task: Task;
    schedule: Schedule;
    onUpdate: (updates: Partial<Task>) => void;
    onRemove: () => void;
}

function TaskCard({ task, schedule, onUpdate, onRemove }: TaskCardProps) {
    // Get the current schedule's active days to determine max frequency
    const maxFrequency = schedule.active_days.length;
    
    return (
        <div className="p-6 border border-blue-200 rounded-xl bg-blue-50 hover:shadow-md transition-shadow">
            <div className="flex items-start mb-4 gap-3">
                <input
                    type="text"
                    value={task.summary}
                    onChange={(e) => onUpdate({ summary: e.target.value })}
                    placeholder="Task name"
                    className="min-w-0 flex-1 text-lg font-semibold border-none outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2 bg-blue-100 hover:bg-blue-200 transition-colors text-gray-800"
                />
                <button
                    onClick={onRemove}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 w-10 h-10 flex items-center justify-center"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="number"
                            min="0"
                            max="23"
                            value={task.duration.hours}
                            onChange={(e) => onUpdate({ 
                                duration: { ...task.duration, hours: parseInt(e.target.value) || 0 }
                            })}
                            className="w-16 p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-600 font-medium">h</span>
                        <input
                            type="number"
                            min="0"
                            max="59"
                            value={task.duration.minutes}
                            onChange={(e) => onUpdate({ 
                                duration: { ...task.duration, minutes: parseInt(e.target.value) || 0 }
                            })}
                            className="w-16 p-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-600 font-medium">m</span>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Preferred Time</label>
                    <select
                        value={task.preferred_time || ''}
                        onChange={(e) => onUpdate({ preferred_time: e.target.value as "morning" | "afternoon" | "evening" | "night" | undefined })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">No preference</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="evening">Evening</option>
                        <option value="night">Night</option>
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Times per Week</label>
                    <select
                        value={task.frequency}
                        onChange={(e) => onUpdate({ frequency: parseInt(e.target.value) })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {Array.from({ length: maxFrequency }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>
                                {num} {num === 1 ? 'time' : 'times'}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                    <select
                        value={task.priority || 'medium'}
                        onChange={(e) => onUpdate({ priority: e.target.value as 'low' | 'medium' | 'high' })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>
            
            <div className="flex items-center justify-between">
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={task.on_weekends}
                        onChange={(e) => onUpdate({ on_weekends: e.target.checked })}
                        className="mr-2 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Include on weekends</span>
                </label>
            </div>
        </div>
    );
}

// Mandatory Task Card Component
interface MandatoryTaskCardProps {
    task: MandatoryTask;
    onUpdate: (updates: Partial<MandatoryTask>) => void;
    onRemove: () => void;
}

function MandatoryTaskCard({ task, onUpdate, onRemove }: MandatoryTaskCardProps) {
    return (
        <div className="p-6 border border-red-200 rounded-xl bg-red-50 hover:shadow-md transition-shadow">
            <div className="flex items-start mb-4 gap-3">
                <input
                    type="text"
                    value={task.summary}
                    onChange={(e) => onUpdate({ summary: e.target.value })}
                    placeholder="Mandatory task name"
                    className="min-w-0 flex-1 text-lg font-semibold border-none outline-none focus:ring-2 focus:ring-red-500 rounded-lg px-3 py-2 bg-red-200 hover:bg-red-300 transition-colors text-gray-800"
                />
                <button
                    onClick={onRemove}
                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0 w-10 h-10 flex items-center justify-center"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                        type="time"
                        value={task.start_time}
                        onChange={(e) => onUpdate({ start_time: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">End Time</label>
                    <input
                        type="time"
                        value={task.end_time}
                        onChange={(e) => onUpdate({ end_time: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Start Day</label>
                    <select
                        value={task.start_day}
                        onChange={(e) => onUpdate({ start_day: e.target.value as Day })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                        {Object.entries(DAY_LABELS).map(([day, label]) => (
                            <option key={day} value={day}>{label}</option>
                        ))}
                    </select>
                </div>
                
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">End Day</label>
                    <select
                        value={task.end_day}
                        onChange={(e) => onUpdate({ end_day: e.target.value as Day })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                        {Object.entries(DAY_LABELS).map(([day, label]) => (
                            <option key={day} value={day}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Location (optional)</label>
                <input
                    type="text"
                    value={task.location || ''}
                    onChange={(e) => onUpdate({ location: e.target.value || undefined })}
                    placeholder="e.g., Office, Gym, Home"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
            </div>
        </div>
    );
} 