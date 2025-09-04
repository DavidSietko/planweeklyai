import styles from '../page.module.css';

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1>Privacy Policy</h1>
        <hr className={styles.Hr} />
        <div className={styles.contentBox}>
          <h2 className={styles.title}>Information We Collect</h2>
          <p>We collect your email address to create your account and identify you uniquely.</p>
          <p>Google Calendar Access: With your permission, we request read and write access to your Google Calendar to generate and optimize your weekly schedule. 
            You can revoke these permissions at any time, however you will be unable to generate schedules.</p>
        </div>
        <hr className={styles.Hr} />
        <div className={styles.contentBox}>
          <h2 className={styles.title}>How we use Information</h2>
          <p>To provide personalized scheduling services. To maintain and secure your account.</p>
        </div>
        <hr className={styles.Hr} />
        <div className={styles.contentBox}>
          <h2 className={styles.title}>Cookie Policy</h2>
          <p>When you log in, our website creates a cookie in your browser. This cookie is necessary to keep you logged in and verify your session.</p>
          <p>What the cookie stores: Only information required for authentication and session management.</p>
          <p>What it does not store: It does not collect personal data for tracking, advertising, or analytics.</p>
          <p>How it is used: Solely to recognize your login session and keep you signed in until you log out or the session expires. A session lasts 1 full week.</p>
          <p>Consent: By logging in, you agree to the use of this cookie. If you disable cookies in your browser, you will not be able to stay logged in.</p>
        </div>
        <hr className={styles.Hr} />
        <div className={styles.contentBox}>
          <h2 className={styles.title}>Data Sharing</h2>
          <p>We do not share any user data with third parties. You are also able to delete your account at any time in settings. Deleting an account will remove all data associated with it. This includes: the account Email and our ability to access your google calender associated with the email.</p>
        </div>
      </div>
    </div>
  );
}
