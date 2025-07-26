
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
    on_weekends: boolean;
    preferred_time?: "morning" | "afternoon" | "evening" | "night"; // Optional since not all tasks need specific time
    frequency: number; // How many times per week (1 to number of active days)
    color?: string; // For UI customization
    priority?: 'low' | 'medium' | 'high';
}

export interface MandatoryTask {
    id: string;
    summary: string;
    start_time: string; // Format: "HH:MM" (24-hour)
    end_time: string;   // Format: "HH:MM" (24-hour)
    start_day: Day;
    end_day: Day;
    color?: string; // For UI customization
    location?: string; // Optional location info
}

export interface Schedule {
    id: string;
    name: string; // User-friendly name like "Work Schedule" or "Weekday Routine"
    time_zone: string;
    start_time: string; // Format: "HH:MM" (24-hour) - daily start time
    end_time: string;   // Format: "HH:MM" (24-hour) - daily end time
    active_days: Day[]; // Which days this schedule applies to
    tasks: Task[];
    mandatory_tasks: MandatoryTask[];
    created_at: Date;
    updated_at: Date;
}

// Utility types for form handling
export interface TaskFormData extends Omit<Task, 'id'> {
    id?: string; // Optional for new tasks
}

export interface MandatoryTaskFormData extends Omit<MandatoryTask, 'id'> {
    id?: string; // Optional for new mandatory tasks
}

export interface ScheduleFormData extends Omit<Schedule, 'id' | 'created_at' | 'updated_at'> {
    id?: string; // Optional for new schedules
}

// Helper type for day selection
export type DaySelection = {
    [key in Day]: boolean;
};

// Type for displaying a specific day's schedule (derived from master schedule)
export interface DaySchedule {
    day: Day;
    start_time: string;
    end_time: string;
    tasks: Task[];
    mandatory_tasks: MandatoryTask[];
}


export interface Event {
    summary: string;
    start: {
        dateTime: string;
        timeZone: string;
    };
    end: {
        dateTime: string;
        timeZone: string;
    };
    id: string;
    location?: string;
    description?: string;
}