'use client';

import React from 'react';
import { Schedule, Day, DaySchedule } from '../utils/interfaces';
import { 
    getDaySchedule, 
    DAY_LABELS, 
    formatTime, 
    getTaskDurationString,
    isWeekend
} from '../utils/scheduleUtils';

interface DayScheduleViewProps {
    schedule: Schedule;
    day: Day;
}

export default function DayScheduleView({ schedule, day }: DayScheduleViewProps) {
    const daySchedule = getDaySchedule(schedule, day);
    
    if (!daySchedule) {
        return (
            <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    {DAY_LABELS[day]}
                </h1>
                <div className="text-center py-8 text-gray-500">
                    <p>No schedule for {DAY_LABELS[day]}</p>
                    <p className="text-sm mt-2">
                        This day is not included in your active schedule
                    </p>
                </div>
            </div>
        );
    }

    const totalTasks = daySchedule.tasks.length + daySchedule.mandatoryTasks.length;
    const totalDuration = daySchedule.tasks.reduce((total, task) => {
        return total + (task.duration.hours * 60 + task.duration.minutes);
    }, 0);

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {DAY_LABELS[day]}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                        {formatTime(daySchedule.startTime)} - {formatTime(daySchedule.endTime)}
                    </span>
                    <span>•</span>
                    <span>{totalTasks} tasks</span>
                    <span>•</span>
                    <span>{Math.floor(totalDuration / 60)}h {totalDuration % 60}m total</span>
                </div>
            </div>

            {/* Mandatory Tasks */}
            {daySchedule.mandatoryTasks.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                        Mandatory Tasks
                    </h2>
                    <div className="space-y-3">
                        {daySchedule.mandatoryTasks.map((task) => (
                            <MandatoryTaskItem key={task.id} task={task} />
                        ))}
                    </div>
                </div>
            )}

            {/* Regular Tasks */}
            {daySchedule.tasks.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                        Tasks
                    </h2>
                    <div className="space-y-3">
                        {daySchedule.tasks.map((task) => (
                            <TaskItem key={task.id} task={task} day={day} />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {totalTasks === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>No tasks scheduled for {DAY_LABELS[day]}</p>
                    <p className="text-sm mt-2">
                        Add some tasks to your schedule to get started
                    </p>
                </div>
            )}
        </div>
    );
}

// Task Item Component
interface TaskItemProps {
    task: any; // Using any for now since we're importing from interfaces
    day: Day;
}

function TaskItem({ task, day }: TaskItemProps) {
    const isWeekendDay = isWeekend(day);
    const showWeekendNote = isWeekendDay && !task.onWeekends;

    return (
        <div className="p-4 border border-gray-200 rounded-md bg-white">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{task.summary}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Duration: {getTaskDurationString(task)}</span>
                        {task.preferredTime && (
                            <>
                                <span>•</span>
                                <span>Preferred: {task.preferredTime.charAt(0).toUpperCase() + task.preferredTime.slice(1)}</span>
                            </>
                        )}
                        {task.priority && (
                            <>
                                <span>•</span>
                                <span className={`px-2 py-1 rounded text-xs ${
                                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                }`}>
                                    {task.priority}
                                </span>
                            </>
                        )}
                    </div>
                    {showWeekendNote && (
                        <p className="text-xs text-orange-600 mt-1">
                            ⚠️ This task is not typically scheduled for weekends
                        </p>
                    )}
                </div>
                {task.color && (
                    <div 
                        className="w-4 h-4 rounded-full ml-2"
                        style={{ backgroundColor: task.color }}
                    ></div>
                )}
            </div>
        </div>
    );
}

// Mandatory Task Item Component
interface MandatoryTaskItemProps {
    task: any; // Using any for now since we're importing from interfaces
}

function MandatoryTaskItem({ task }: MandatoryTaskItemProps) {
    return (
        <div className="p-4 border border-red-200 rounded-md bg-red-50">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{task.summary}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Time: {formatTime(task.startTime)} - {formatTime(task.endTime)}</span>
                        {task.location && (
                            <>
                                <span>•</span>
                                <span>📍 {task.location}</span>
                            </>
                        )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {task.startDay === task.endDay 
                            ? `Every ${task.startDay}` 
                            : `${task.startDay} - ${task.endDay}`
                        }
                    </div>
                </div>
                {task.color && (
                    <div 
                        className="w-4 h-4 rounded-full ml-2"
                        style={{ backgroundColor: task.color }}
                    ></div>
                )}
            </div>
        </div>
    );
} 