import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — FHIR-Based Medical Record Locator Service",
};

export default function PrivacyPage() {
  const effective = "June 24, 2026";

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-gray-800">
      <div>
        <h2 className="text-2xl font-bold">Privacy Policy</h2>
        <p className="text-sm text-gray-500 mt-1">Effective date: {effective}</p>
      </div>

      <p className="text-sm text-gray-600">
        MTC Group LLC ("we," "us," or "our") operates the FHIR-Based Medical Record Locator
        Service ("the Service") available at this website. This Privacy Policy explains how we
        collect, use, and protect information when you use the Service.
      </p>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">1. Information We Collect</h3>
        <p className="text-sm text-gray-600">
          <strong>Patient demographics you provide.</strong> To search for your medical records you
          enter identifying information such as your name, date of birth, gender, and address. This
          information is transmitted to FHIR-enabled health systems and payers solely to locate
          records that match your identity. We do not retain this information after your session ends.
        </p>
        <p className="text-sm text-gray-600">
          <strong>OAuth access tokens.</strong> When you authorize the Service to access a payer or
          provider on your behalf, we receive a short-lived OAuth 2.0 access token issued by that
          organization. Tokens are stored temporarily in an encrypted cache to allow your search to
          complete and are automatically deleted when they expire (typically within one hour).
        </p>
        <p className="text-sm text-gray-600">
          <strong>Usage data.</strong> We may collect standard server log data (IP address,
          browser type, pages visited) for security and operational purposes. This data is not linked
          to your health information.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">2. What We Do Not Do</h3>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>We do not store, copy, or retain your Protected Health Information (PHI).</li>
          <li>We do not sell, rent, or share your personal information with third parties for marketing purposes.</li>
          <li>We do not retain OAuth tokens beyond their expiration window.</li>
          <li>We do not use your health data to train machine learning models.</li>
          <li>We do not access your health records except at your explicit direction during an active search session.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">3. How We Use Your Information</h3>
        <p className="text-sm text-gray-600">
          Information you provide is used exclusively to query FHIR R4 Patient Access APIs on your
          behalf and return the results to you in real time. We act as a technical intermediary;
          we do not interpret, analyze, or retain the health records returned by those systems.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">4. Third-Party Health Systems</h3>
        <p className="text-sm text-gray-600">
          The Service connects to third-party payers and providers (such as insurance companies,
          hospitals, and government health programs) through their published FHIR R4 APIs. When you
          authorize access, you are redirected to that organization's own login and consent page.
          Their collection and handling of your credentials is governed by their own privacy
          policies, not this one. We encourage you to review each organization's privacy practices.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">5. HIPAA</h3>
        <p className="text-sm text-gray-600">
          The Service is designed to facilitate patient access to personal health information as
          permitted under the Health Insurance Portability and Accountability Act (HIPAA) and the
          CMS Interoperability and Patient Access Final Rule (CMS-9115-F). We implement
          administrative, physical, and technical safeguards consistent with applicable law. If you
          have questions about your rights under HIPAA, please contact us at the address below.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">6. Data Security</h3>
        <p className="text-sm text-gray-600">
          All data transmitted between your browser and the Service is encrypted using TLS. OAuth
          tokens are stored in an encrypted Redis cache and never written to persistent disk storage
          in plaintext. We use PKCE (Proof Key for Code Exchange) for all authorization flows to
          prevent token interception.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">7. Your Rights</h3>
        <p className="text-sm text-gray-600">
          You may request deletion of any session data associated with your use of the Service at
          any time by contacting us. You may also revoke the Service's access to any connected payer
          or provider directly through that organization's member portal.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">8. Children's Privacy</h3>
        <p className="text-sm text-gray-600">
          The Service is intended for use by adults managing their own health records or by
          authorized caregivers. We do not knowingly collect personal information from children
          under 13 without verifiable parental consent.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">9. Changes to This Policy</h3>
        <p className="text-sm text-gray-600">
          We may update this Privacy Policy periodically. We will post the revised policy on this
          page with an updated effective date. Continued use of the Service after changes are posted
          constitutes acceptance of the updated policy.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">10. Contact Us</h3>
        <p className="text-sm text-gray-600">
          MTC Group LLC<br />
          Email: <a href="mailto:rick@mtcgroupllc.com" className="text-blue-600 underline">rick@mtcgroupllc.com</a><br />
          Website: <a href="https://frontend-omega-five-22.vercel.app" className="text-blue-600 underline">frontend-omega-five-22.vercel.app</a>
        </p>
      </section>
    </div>
  );
}
