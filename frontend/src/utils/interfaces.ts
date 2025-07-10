
export enum Day {
    MONDAY = "MONDAY",
    TUESDAY = "TUESDAY", 
    WEDNESDAY = "WEDNESDAY",
    THURSDAY = "THURSDAY",
    FRIDAY = "FRIDAY",
    SATURDAY = "SATURDAY",
    SUNDAY = "SUNDAY"
}

export interface Task {
    id: string;
    summary: string;
    duration: {
        hours: number;
        minutes: number;
    };
    onWeekends: boolean;
    preferredTime?: "morning" | "afternoon" | "evening" | "night"; // Optional since not all tasks need specific time
    frequency: number; // How many times per week (1 to number of active days)
    color?: string; // For UI customization
    priority?: 'low' | 'medium' | 'high';
}

export interface MandatoryTask {
    id: string;
    summary: string;
    startTime: string; // Format: "HH:MM" (24-hour)
    endTime: string;   // Format: "HH:MM" (24-hour)
    startDay: Day;
    endDay: Day;
    color?: string; // For UI customization
    location?: string; // Optional location info
}

export interface Schedule {
    id: string;
    name: string; // User-friendly name like "Work Schedule" or "Weekday Routine"
    startTime: string; // Format: "HH:MM" (24-hour) - daily start time
    endTime: string;   // Format: "HH:MM" (24-hour) - daily end time
    activeDays: Day[]; // Which days this schedule applies to
    tasks: Task[];
    mandatoryTasks: MandatoryTask[];
    createdAt: Date;
    updatedAt: Date;
}

// Utility types for form handling
export interface TaskFormData extends Omit<Task, 'id'> {
    id?: string; // Optional for new tasks
}

export interface MandatoryTaskFormData extends Omit<MandatoryTask, 'id'> {
    id?: string; // Optional for new mandatory tasks
}

export interface ScheduleFormData extends Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'> {
    id?: string; // Optional for new schedules
}

// Helper type for day selection
export type DaySelection = {
    [key in Day]: boolean;
};

// Type for displaying a specific day's schedule (derived from master schedule)
export interface DaySchedule {
    day: Day;
    startTime: string;
    endTime: string;
    tasks: Task[];
    mandatoryTasks: MandatoryTask[];
}