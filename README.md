# PlanWeeklyAI

An AI-powered weekly schedule planner. Tell it your preferences once, and it generates a personalized weekly schedule for you — with optional two-way sync to Google Calendar.

**Live site:** [planweeklyai.com](https://planweeklyai.com)

## Features

- **AI-generated weekly schedules** built from your stated preferences (routines, priorities, time blocks)
- **Edit and view modes** for reviewing and tweaking your generated schedule
- **Google Calendar sync** to push your schedule straight to the calendar you already use
- **Google Sign-In** for authentication — no separate account/password to manage

> Signing in requires granting Google Calendar permissions to the Google account you use. If you're not comfortable with that, please don't sign in.

## Tech Stack

**Backend:** FastAPI (Python), PostgreSQL, Google OAuth 2.0 & Calendar API, OpenAI API
**Frontend:** Next.js, React, Tailwind CSS

## Screenshots

**Home page**

<img width="1561" height="1023" alt="PlanWeeklyAI home page" src="https://github.com/user-attachments/assets/f55ea415-0d57-474d-bd49-07c709165728" />

**Schedule — edit and view modes**

<img width="2559" height="1263" alt="Schedule edit mode" src="https://github.com/user-attachments/assets/8d0ee640-9125-4943-acd8-363690f5f7c5" />
<img width="2546" height="1033" alt="Schedule view mode" src="https://github.com/user-attachments/assets/576318c4-e10c-417c-82f2-951aaf2a185a" />

## Running Locally

**Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

You'll need your own Google OAuth credentials and an OpenAI API key set as environment variables for the backend to run end-to-end.
