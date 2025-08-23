'use client';

import {useState, useEffect} from 'react';
import { Event } from '../../utils/interfaces';
import WeeklyEventsView from '../../components/WeeklyEventsView';

export default function SchedulePage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const [syncing, setSyncing] = useState<boolean>(false);
    const [success, setSuccess] = useState<boolean>(false);

    useEffect(() => {
        // try get schedule from cache
        const cacheEvents = sessionStorage.getItem("events");
        if(!cacheEvents) {
            generateSchedule();
        }
        else {
            setEvents(JSON.parse(cacheEvents));
            setLoading(false);
        }
    }, []);


    const generateSchedule = async () => {
        try {
            // set loading part to true
            setLoading(true);
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
                    sessionStorage.setItem("events", JSON.stringify(data));
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

    const syncSchedule = async() => {
        try {
            setSyncing(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sync/schedule`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(events)
            });
            
            const data = await response.json();
            if(!response.ok) {
                throw new Error(data.detail);
            }
            setSuccess(true);
            setSyncing(false);
        } catch(error: unknown) {
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
                setErrorMessage("Sorry. We had trouble syncing your schedule. Please try again later.");
            }
        }
    }

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
    else if(syncing) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    <div className="text-blue-700 font-medium text-lg">Syncing your calendar...</div>
                </div>
            </div>
        );
    }
    else if(success) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="flex flex-col items-center bg-green-50 border border-green-400 text-green-700 px-6 py-4 rounded shadow text-center max-w-md">
                    <svg className="h-10 w-10 text-green-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="font-bold text-lg mb-2">Sync Successful!</div>
                    <div>Your schedule has been synced. You may close this tab and check your Google Calendar.</div>
                </div>
            </div>
        );
    }
    else {
        return <WeeklyEventsView events={events} generateSchedule={generateSchedule} syncSchedule={syncSchedule} />;
    }
}