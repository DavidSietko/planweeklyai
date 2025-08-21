import styles from "../page.module.css";

export default function TermsOfServicePage() {
    return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1>Terms Of Service</h1>
        <hr className={styles.Hr} />
        <div className={styles.contentBox}>
          <h2 className={styles.title}>Use Of Service</h2>
          <p>PlanWeeklyAI provides AI-powered weekly scheduling. You may use the service only in compliance with these Terms and all applicable laws.</p>
        </div>
        <hr className={styles.Hr} />
        <div className={styles.contentBox}>
          <h2 className={styles.title}>Accounts</h2>
          <p>You must sign in through google using a valid email. You are responsible for maintaining the security of your account.</p>
        </div>
        <hr className={styles.Hr} />
        <div className={styles.contentBox}>
          <h2 className={styles.title}>User Data</h2>
          <p>By connecting your Google Calendar, you grant us permission to read and write events for scheduling purposes. We will not use this data for any other purpose or share it with third parties.</p>
        </div>
        <hr className={styles.Hr} />
        <p className={styles.contentBox}>For more information please contact planweeklyai@gmail.com</p>
      </div>
    </div>
  );
}