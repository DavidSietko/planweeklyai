import styles from '../page.module.css';

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <h1>Privacy Policy</h1>
        <div>
          <h2>Information We Collect</h2>
          <p>he only information we ask of users at planweekly ai is email and google calender access.
          We use the email to create accounts to uniquely identify users. We then ask for calender read and write access associated with this email.</p>
        </div>
        <div>
          <h3>Data Sharing</h3>
          <p>We do not share any user data with third parties. You are also able to delete your account at any time, which will remove all data associated with it.</p>
        </div>
      </div>
    </div>
  );
}
