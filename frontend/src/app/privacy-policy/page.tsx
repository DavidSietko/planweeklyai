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
          <h2 className={styles.title}>Data Sharing</h2>
          <p>We do not share any user data with third parties. You are also able to delete your account at any time, which will remove all data associated with it.</p>
        </div>
      </div>
    </div>
  );
}
