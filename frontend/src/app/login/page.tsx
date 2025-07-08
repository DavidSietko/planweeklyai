"use client";

import styles from "../page.module.css";

export default function Login() {
  // This handler triggers a full browser redirect to the FastAPI backend,
  // which starts the Google OAuth flow. The backend will handle all redirects
  // and eventually send the user back to the homepage ("/") after login.
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/google/login";
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
          Sign in to PlanWeeklyAI
        </h1>
        <button
          onClick={handleGoogleLogin}
          className={styles.primary}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            fontSize: '1.1rem',
            padding: '0.75rem 2rem',
            borderRadius: '2rem',
            textDecoration: 'none',
            boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
            margin: '0 auto',
            maxWidth: 320,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.453 3.648-5.617 3.648-3.383 0-6.148-2.797-6.148-6.25s2.765-6.25 6.148-6.25c1.93 0 3.227.82 3.969 1.523l2.719-2.648c-1.711-1.594-3.93-2.574-6.688-2.574-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.695 0-.652-.07-1.148-.156-1.43z" fill="#4285F4"/>
              <path d="M3.153 7.345l3.281 2.406c.891-1.781 2.578-2.906 4.606-2.906 1.18 0 2.273.406 3.125 1.203l2.719-2.648c-1.711-1.594-3.93-2.574-6.688-2.574-3.797 0-7.016 2.484-8.406 5.919l3.363 2.6z" fill="#34A853"/>
              <path d="M12.04 22c2.73 0 5.023-.898 6.695-2.453l-3.094-2.531c-.828.578-1.953.984-3.601.984-2.93 0-5.414-1.977-6.305-4.617l-3.281 2.531c1.375 3.406 4.742 6.086 9.586 6.086z" fill="#4CAF50"/>
              <path d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.453 3.648-5.617 3.648-3.383 0-6.148-2.797-6.148-6.25s2.765-6.25 6.148-6.25c1.93 0 3.227.82 3.969 1.523l2.719-2.648c-1.711-1.594-3.93-2.574-6.688-2.574-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.695 0-.652-.07-1.148-.156-1.43z" fill="#FBBC05"/>
              <path d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.453 3.648-5.617 3.648-3.383 0-6.148-2.797-6.148-6.25s2.765-6.25 6.148-6.25c1.93 0 3.227.82 3.969 1.523l2.719-2.648c-1.711-1.594-3.93-2.574-6.688-2.574-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.695 0-.652-.07-1.148-.156-1.43z" fill="#EA4335"/>
            </g>
          </svg>
          Sign in with Google
        </button>
      </main>
    </div>
  );
} 