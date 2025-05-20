export const metadata = {
  title: "Terms of Service - TimeTracker",
  description:
    "Terms and Conditions for using TimeTracker time tracking and billing application",
};

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <p>
          These Terms of Service ("Terms") govern your use of TimeTracker (the
          "Service") operated by TimeTracker Inc. ("we", "us", or "our"). By
          accessing or using the Service, you agree to be bound by these Terms.
          If you disagree with any part of the Terms, you may not access the
          Service.
        </p>

        <h2>1. Accounts</h2>
        <p>
          When you create an account with us, you must provide information that
          is accurate, complete, and current at all times. Failure to do so
          constitutes a breach of the Terms, which may result in immediate
          termination of your account on our Service.
        </p>
        <p>
          You are responsible for safeguarding the password that you use to
          access the Service and for any activities or actions under your
          password. You agree not to disclose your password to any third party.
          You must notify us immediately upon becoming aware of any breach of
          security or unauthorized use of your account.
        </p>

        <h2>2. Subscription and Payments</h2>
        <p>
          Some features of the Service are billed on a subscription basis
          ("Subscription(s)"). You will be billed in advance on a recurring and
          periodic basis ("Billing Cycle"). Billing cycles are set on a monthly
          or annual basis, depending on the type of subscription plan you
          select.
        </p>
        <p>
          At the end of each Billing Cycle, your Subscription will automatically
          renew under the exact same conditions unless you cancel it or we
          cancel it. You may cancel your Subscription renewal through your
          online account management page.
        </p>
        <p>
          All payments are non-refundable except as expressly set forth in our
          Refund Policy or as required by applicable law.
        </p>

        <h2>3. Free Trial</h2>
        <p>
          We may, at our sole discretion, offer a Subscription with a free trial
          for a limited period of time ("Free Trial"). You may be required to
          enter your billing information to sign up for the Free Trial.
        </p>
        <p>
          If you do enter your billing information when signing up for the Free
          Trial, you will not be charged until the Free Trial has expired. On
          the last day of the Free Trial period, unless you canceled your
          Subscription, you will be automatically charged the applicable
          subscription fee for the type of Subscription you have selected.
        </p>

        <h2>4. Content Ownership and License</h2>
        <p>
          The Service and its original content, features, and functionality are
          and will remain the exclusive property of TimeTracker Inc. and its
          licensors. The Service is protected by copyright, trademark, and other
          laws.
        </p>
        <p>
          You retain any and all of your rights to any data you submit, post, or
          display on or through the Service ("User Content"). By submitting,
          posting or displaying User Content on or through the Service, you
          grant us a worldwide, non-exclusive, royalty-free license to use,
          reproduce, adapt, publish, translate, and distribute your User Content
          in connection with providing and improving the Service.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          In no event shall TimeTracker Inc., nor its directors, employees,
          partners, agents, suppliers, or affiliates, be liable for any
          indirect, incidental, special, consequential or punitive damages,
          including without limitation, loss of profits, data, use, goodwill, or
          other intangible losses, resulting from:
        </p>
        <ul>
          <li>
            Your access to or use of or inability to access or use the Service;
          </li>
          <li>Any conduct or content of any third party on the Service;</li>
          <li>Any content obtained from the Service; and</li>
          <li>
            Unauthorized access, use or alteration of your transmissions or
            content.
          </li>
        </ul>

        <h2>6. Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior
          notice or liability, for any reason whatsoever, including without
          limitation if you breach the Terms.
        </p>
        <p>
          Upon termination, your right to use the Service will immediately
          cease. If you wish to terminate your account, you may simply
          discontinue using the Service or delete your account through the
          account settings.
        </p>

        <h2>7. Changes</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace
          these Terms at any time. If a revision is material we will try to
          provide at least 30 days' notice prior to any new terms taking effect.
          What constitutes a material change will be determined at our sole
          discretion.
        </p>
        <p>
          By continuing to access or use our Service after those revisions
          become effective, you agree to be bound by the revised terms. If you
          do not agree to the new terms, please stop using the Service.
        </p>

        <h2>8. Governing Law</h2>
        <p>
          These Terms shall be governed and construed in accordance with the
          laws of the United States, without regard to its conflict of law
          provisions.
        </p>
        <p>
          Our failure to enforce any right or provision of these Terms will not
          be considered a waiver of those rights. If any provision of these
          Terms is held to be invalid or unenforceable by a court, the remaining
          provisions of these Terms will remain in effect.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at:
        </p>
        <p>
          Email: legal@timetracker.com
          <br />
          Address: 123 Time Street, Clockville, TC 12345
        </p>
      </div>
    </div>
  );
}
