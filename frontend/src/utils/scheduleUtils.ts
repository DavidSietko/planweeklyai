import { Task, MandatoryTask, Schedule, Day, DaySelection, DaySchedule } from './interfaces';

// UUID generator with fallback for mobile browsers
const generateUUID = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    
    // Fallback UUID generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Day utilities
export const DAYS_OF_WEEK: Day[] = [
    Day.MONDAY,
    Day.TUESDAY,
    Day.WEDNESDAY,
    Day.THURSDAY,
    Day.FRIDAY,
    Day.SATURDAY,
    Day.SUNDAY
];

export const DAY_LABELS: Record<Day, string> = {
    [Day.MONDAY]: 'Monday',
    [Day.TUESDAY]: 'Tuesday',
    [Day.WEDNESDAY]: 'Wednesday',
    [Day.THURSDAY]: 'Thursday',
    [Day.FRIDAY]: 'Friday',
    [Day.SATURDAY]: 'Saturday',
    [Day.SUNDAY]: 'Sunday'
};

// Time utilities
export const formatTime = (time: string): string => {
    // Convert "HH:MM" to "HH:MM AM/PM"
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const parseTime = (time: string): { hours: number; minutes: number } => {
    const [hours, minutes] = time.split(':').map(Number);
    return { hours, minutes };
};

export const timeToMinutes = (time: string): number => {
    const { hours, minutes } = parseTime(time);
    return hours * 60 + minutes;
};

export const minutesToTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};



export const getDurationInMinutes = (task: Task): number => {
    return task.duration.hours * 60 + task.duration.minutes;
};

export const getTaskDurationString = (task: Task): string => {
    const { hours, minutes } = task.duration;
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
};

// Schedule utilities
export const getSchedule = async (): Promise<Schedule> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/schedule/get`, {
        method: 'GET',
        credentials: 'include',
    });
    const data = await response.json();
    if(!response.ok) {
        throw new Error(data.message);
    }
    return data;
};

export const saveSchedule = async (schedule: Schedule): Promise<Schedule> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/schedule/save`, {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(schedule)
    });
    const data = await response.json();
    if(!response.ok) {
        throw new Error(data.message);
    }
    return data;
};

export const createEmptyTask = (): Task => {
    return {
        id: generateUUID(),
        summary: '',
        duration: { hours: 1, minutes: 0 },
        on_weekends: false,
        preferred_time: undefined,
        frequency: 1, // Default to once per week
        color: '#3B82F6', // Default blue
        priority: 'medium'
    };
};

export const createEmptyMandatoryTask = (): MandatoryTask => {
    return {
        id: generateUUID(),
        summary: '',
        start_time: '09:00',
        end_time: '17:00',
        start_day: Day.MONDAY,
        end_day: Day.FRIDAY,
        color: '#EF4444', // Default red
        location: undefined
    };
};

// New function to get schedule for a specific day
export const getDaySchedule = (schedule: Schedule, day: Day): DaySchedule | null => {
    // Check if this schedule applies to the given day
    if (!schedule.active_days.includes(day)) {
        return null;
    }

    // Filter tasks that should be shown on this day
    const applicableTasks = schedule.tasks.filter(task => shouldShowTask(task, day));
    
    // Filter mandatory tasks that apply to this day
    const applicableMandatoryTasks = schedule.mandatory_tasks.filter(task => 
        isDayInRange(day, task.start_day, task.end_day)
    );

    return {
        day,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        tasks: applicableTasks,
        mandatory_tasks: applicableMandatoryTasks
    };
};

// Helper function to check if a day is within a range
export const isDayInRange = (day: Day, startDay: Day, endDay: Day): boolean => {
    const dayOrder = [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY, Day.SATURDAY, Day.SUNDAY];
    const dayIndex = dayOrder.indexOf(day);
    const startIndex = dayOrder.indexOf(startDay);
    const endIndex = dayOrder.indexOf(endDay);
    
    if (startIndex <= endIndex) {
        return dayIndex >= startIndex && dayIndex <= endIndex;
    } else {
        // Handles ranges that wrap around (e.g., Friday to Monday)
        return dayIndex >= startIndex || dayIndex <= endIndex;
    }
};

// Get all days that have schedules
export const getActiveDays = (schedule: Schedule): Day[] => {
    return schedule.active_days;
};

// Get formatted active days string
export const getActiveDaysString = (schedule: Schedule): string => {
    if (schedule.active_days.length === 0) return 'No days selected';
    if (schedule.active_days.length === 7) return 'Every day';
    if (schedule.active_days.length === 5 && 
        schedule.active_days.includes(Day.MONDAY) && 
        schedule.active_days.includes(Day.TUESDAY) && 
        schedule.active_days.includes(Day.WEDNESDAY) && 
        schedule.active_days.includes(Day.THURSDAY) && 
        schedule.active_days.includes(Day.FRIDAY)) {
        return 'Weekdays';
    }
    if (schedule.active_days.length === 2 && 
        schedule.active_days.includes(Day.SATURDAY) && 
        schedule.active_days.includes(Day.SUNDAY)) {
        return 'Weekends';
    }
    
    return schedule.active_days.map(day => DAY_LABELS[day]).join(', ');
};

// Validation utilities
export const isValidTime = (time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
};

export const isTimeRangeValid = (startTime: string, endTime: string): boolean => {
    if (!isValidTime(startTime) || !isValidTime(endTime)) return false;
    return timeToMinutes(startTime) < timeToMinutes(endTime);
};

export const validateSchedule = (schedule: Schedule): string[] => {
    const errors: string[] = [];
    
    if (!schedule.name.trim()) {
        errors.push('Schedule name is required');
    }
    
    if (!isTimeRangeValid(schedule.start_time, schedule.end_time)) {
        errors.push('End time must be after start time');
    }
    
    if (schedule.active_days.length === 0) {
        errors.push('At least one day must be selected');
    }
    
    if (schedule.tasks.length === 0 && schedule.mandatory_tasks.length === 0) {
        errors.push('Schedule must have at least one task or mandatory task');
    }
    
    return errors;
};

// Day selection utilities
export const createEmptyDaySelection = (): DaySelection => {
    return DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = false;
        return acc;
    }, {} as DaySelection);
};

export const daySelectionToArray = (selection: DaySelection): Day[] => {
    return DAYS_OF_WEEK.filter(day => selection[day]);
};

export const arrayToDaySelection = (days: Day[]): DaySelection => {
    const selection = createEmptyDaySelection();
    days.forEach(day => {
        selection[day] = true;
    });
    return selection;
};

export const isWeekend = (day: Day): boolean => {
    return day === Day.SATURDAY || day === Day.SUNDAY;
};

export const shouldShowTask = (task: Task, day: Day): boolean => {
    if (isWeekend(day)) {
        return task.on_weekends;
    }
    return true;
};

// Color utilities for UI
export const DEFAULT_COLORS = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16'  // Lime
];

export const getRandomColor = (): string => {
    return DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
}; 