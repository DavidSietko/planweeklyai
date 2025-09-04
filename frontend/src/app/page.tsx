import styles from "./page.module.css";

const sections = [
  {
    icon: (
      <svg className={styles.icon} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="16" width="48" height="40" rx="6" fill="#fff" stroke="#2563eb" strokeWidth="3"/>
        <rect x="8" y="24" width="48" height="32" rx="4" fill="#e0f2fe"/>
        <rect x="16" y="32" width="8" height="8" rx="2" fill="#22c55e"/>
        <rect x="28" y="32" width="8" height="8" rx="2" fill="#2563eb"/>
        <rect x="40" y="32" width="8" height="8" rx="2" fill="#22c55e"/>
        <rect x="16" y="44" width="8" height="8" rx="2" fill="#2563eb"/>
        <rect x="28" y="44" width="8" height="8" rx="2" fill="#22c55e"/>
        <rect x="40" y="44" width="8" height="8" rx="2" fill="#2563eb"/>
        <rect x="20" y="10" width="4" height="12" rx="2" fill="#2563eb"/>
        <rect x="40" y="10" width="4" height="12" rx="2" fill="#22c55e"/>
      </svg>
    ),
    text: "Plan your weekly schedule any time."
  },
  {
    icon: (
      <svg className={styles.icon} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="24" fill="#fff" stroke="#22c55e" strokeWidth="3"/>
        <circle cx="32" cy="32" r="18" fill="#e0f2fe"/>
        <rect x="30" y="20" width="4" height="14" rx="2" fill="#2563eb"/>
        <rect x="32" y="32" width="12" height="4" rx="2" transform="rotate(45 32 32)" fill="#22c55e"/>
        <circle cx="32" cy="32" r="3" fill="#2563eb"/>
      </svg>
    ),
    text: "Save time and energy on planning."
  },
  {
    icon: (
      <svg className={styles.icon} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="16" y="24" width="32" height="24" rx="10" fill="#e0f2fe" stroke="#2563eb" strokeWidth="3"/>
        <rect x="24" y="36" width="4" height="4" rx="2" fill="#2563eb"/>
        <rect x="36" y="36" width="4" height="4" rx="2" fill="#22c55e"/>
        <rect x="28" y="44" width="8" height="2" rx="1" fill="#2563eb"/>
        <rect x="28" y="16" width="8" height="8" rx="4" fill="#22c55e" stroke="#2563eb" strokeWidth="2"/>
      </svg>
    ),
    text: "Use AI to automatically sync your schedule with your Google Calendar."
  }
];

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 style={{ fontSize: '2.7rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '-1px' }}>
          PlanWeeklyAI
        </h1>
        <h2 className={styles.subtitle} style={{ fontSize: '1.35rem', fontWeight: 500, color: '#3b3b3b', marginBottom: '1.5rem', textAlign: 'center', maxWidth: 600, margin: '0 auto 2rem auto' }}>
          A super smart AI schedule creator. Create your custom tailored weekly schedule any time.
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <a
            href="/login"
            className={styles.primary}
            style={{ fontSize: '1.1rem', padding: '0.75rem 2rem', borderRadius: '2rem', textDecoration: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
          >
            Get Started
          </a>
        </div>
        <div className={styles.sections}>
          {sections.map((section, idx) => (
            <div className={styles.sectionBox} key={idx}>
              {section.icon}
              <div style={{ marginTop: '1rem', fontWeight: 600, fontSize: '1.08rem' }}>{section.text}</div>
            </div>
          ))}
        </div>
        <span className={styles.note}>
          Note: This requires signing in with your Google account so the AI can sync your weekly schedule with your Google Calendar.
        </span>
        <span className={styles.note}>
          By logging in to this site you agree with our cookie policy. Please read our <a href="/privacy-policy" style={{ color: '#03f70fff', textDecoration: 'underline' }}>privacy policy</a> and <a href="/terms-of-service" style={{ color: '#03f70fff', textDecoration: 'underline' }}>terms of service</a> for more information.
        </span>
      </main>
    </div>
  );
}
