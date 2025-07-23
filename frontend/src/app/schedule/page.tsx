'use client';

import {useState, useEffect} from 'react';
import { Event } from '../../utils/interfaces';
import WeeklyEventsView from '../../components/WeeklyEventsView';

export default function SchedulePage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate/schedule`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();
                if(!response.ok) {
                    setLoading(false);
                    throw new Error(data.detail);
                }
                else {
                    setEvents(data);
                    console.log(events);
                }
                setLoading(false);
            } catch (error : unknown) {
                setError(true);
                if(error instanceof Error) {
                    if(error.message && error.message.includes("log in")) {
                        setErrorMessage("Looks like you're not logged in. Please log in to continue.");
                    }
                    else {
                        setErrorMessage(error.message);
                    }
                }
                else {
                    setErrorMessage("Sorry. We had trouble generating your schedule. Please try again later.");
                }
            }
        }
        fetchSchedule();
    }, []);

    if(loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <div className="text-blue-700 font-medium text-lg">Loading...</div>
                </div>
            </div>
        );
    }
    else if(error) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="bg-red-50 border border-red-400 text-red-700 px-6 py-4 rounded shadow text-center max-w-md">
                    <div className="font-bold text-lg mb-2">Sorry</div>
                    <div>{errorMessage}</div>
                </div>
            </div>
        );
    }
    else {
        return <WeeklyEventsView events={events} />;
    }
}