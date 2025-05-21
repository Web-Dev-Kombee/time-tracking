export const metadata = {
 title: "Privacy Policy - TimeTracker",
 description: "Privacy Policy for TimeTracker time tracking and billing application",
};

export default function PrivacyPolicyPage() {
 return (
  <div className="container max-w-4xl py-12">
   <div className="mb-12">
    <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
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
     At TimeTracker, we take your privacy seriously. This Privacy Policy outlines how we collect,
     use, and protect your personal information when you use our website and services.
    </p>

    <h2>Information We Collect</h2>
    <p>We may collect the following types of information:</p>
    <ul>
     <li>
      <strong>Personal Information</strong>: Name, email address, billing information, and other
      contact details you provide when registering for our services.
     </li>
     <li>
      <strong>Usage Data</strong>: Information about how you use our service, including time
      tracking data, project details, and client information.
     </li>
     <li>
      <strong>Technical Data</strong>: IP address, browser type, device information, and cookies
      when you visit our website.
     </li>
    </ul>

    <h2>How We Use Your Information</h2>
    <p>We use the information we collect to:</p>
    <ul>
     <li>Provide, maintain, and improve our services</li>
     <li>Process transactions and send related information</li>
     <li>Send notifications, updates, and support messages</li>
     <li>Monitor usage patterns and analyze trends</li>
     <li>Prevent fraudulent use of our services</li>
     <li>Address technical issues and improve user experience</li>
    </ul>

    <h2>Data Security</h2>
    <p>
     We implement appropriate security measures to protect your personal information from
     unauthorized access, alteration, disclosure, or destruction. These measures include:
    </p>
    <ul>
     <li>Encryption of sensitive data</li>
     <li>Regular security assessments</li>
     <li>Access controls and authentication procedures</li>
     <li>Secure data storage practices</li>
    </ul>
    <p>
     While we strive to use commercially acceptable means to protect your personal information, we
     cannot guarantee its absolute security.
    </p>

    <h2>Data Sharing and Disclosure</h2>
    <p>We may share your information with:</p>
    <ul>
     <li>
      <strong>Service Providers</strong>: Third-party vendors who assist us in providing our
      services (e.g., payment processors, hosting providers)
     </li>
     <li>
      <strong>Legal Requirements</strong>: When required by law or to protect our rights
     </li>
     <li>
      <strong>Business Transfers</strong>: In connection with a merger, acquisition, or sale of
      assets
     </li>
    </ul>
    <p>We will never sell your personal information to third parties.</p>

    <h2>Your Rights</h2>
    <p>
     Depending on your location, you may have the following rights regarding your personal
     information:
    </p>
    <ul>
     <li>Access your personal information</li>
     <li>Correct inaccurate information</li>
     <li>Delete your information (with certain exceptions)</li>
     <li>Object to or restrict certain processing activities</li>
     <li>Data portability</li>
     <li>Withdraw consent at any time</li>
    </ul>
    <p>To exercise these rights, please contact us at privacy@timetracker.com.</p>

    <h2>Cookies and Tracking Technologies</h2>
    <p>
     We use cookies and similar tracking technologies to track activity on our website and to hold
     certain information. You can instruct your browser to refuse all cookies or to indicate when a
     cookie is being sent.
    </p>

    <h2>Children's Privacy</h2>
    <p>
     Our services are not intended for children under the age of 13. We do not knowingly collect
     personal information from children under 13. If we become aware that we have collected personal
     information from a child under 13, we will take steps to delete that information.
    </p>

    <h2>Changes to This Privacy Policy</h2>
    <p>
     We may update our Privacy Policy from time to time. We will notify you of any changes by
     posting the new Privacy Policy on this page and updating the "last updated" date.
    </p>

    <h2>Contact Us</h2>
    <p>If you have any questions about this Privacy Policy, please contact us at:</p>
    <p>
     Email: privacy@timetracker.com
     <br />
     Address: 123 Time Street, Clockville, TC 12345
    </p>
   </div>
  </div>
 );
}
