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
        return <div>Loading...</div>;
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