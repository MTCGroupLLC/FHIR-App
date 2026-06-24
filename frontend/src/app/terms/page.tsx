import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — FHIR-Based Medical Record Locator Service",
};

export default function TermsPage() {
  const effective = "June 24, 2026";

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-gray-800">
      <div>
        <h2 className="text-2xl font-bold">Terms &amp; Conditions</h2>
        <p className="text-sm text-gray-500 mt-1">Effective date: {effective}</p>
      </div>

      <p className="text-sm text-gray-600">
        Please read these Terms &amp; Conditions ("Terms") carefully before using the FHIR-Based
        Medical Record Locator Service ("the Service") operated by MTC Group LLC ("we," "us," or
        "our"). By accessing or using the Service you agree to be bound by these Terms.
      </p>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">1. Description of Service</h3>
        <p className="text-sm text-gray-600">
          The Service is a patient-directed health information aggregation tool that queries
          FHIR R4-compliant Patient Access APIs published by health insurers, providers, and
          government programs under the CMS Interoperability and Patient Access Final Rule
          (CMS-9115-F). The Service acts as a technical conduit between you and those organizations;
          it does not provide medical advice, treatment, or diagnosis.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">2. Eligibility</h3>
        <p className="text-sm text-gray-600">
          You must be at least 18 years of age, or the legally authorized representative of a
          patient, to use the Service. By using the Service you represent that you have the legal
          right to access the health records you are searching for.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">3. Your Authorization</h3>
        <p className="text-sm text-gray-600">
          When you connect the Service to a payer or provider, you explicitly authorize the Service
          to query that organization's FHIR API on your behalf using a short-lived OAuth 2.0 access
          token. You may revoke this authorization at any time through the connected organization's
          member portal. You are solely responsible for ensuring you have the right to access any
          records retrieved.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">4. Acceptable Use</h3>
        <p className="text-sm text-gray-600">You agree not to:</p>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
          <li>Use the Service to access health records you are not authorized to view.</li>
          <li>Attempt to circumvent any authentication or security measures.</li>
          <li>Use the Service in violation of any applicable law or regulation, including HIPAA.</li>
          <li>Transmit malicious code, automated scripts, or bots through the Service.</li>
          <li>Reverse engineer, decompile, or otherwise attempt to extract the Service's source code except as permitted by law.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">5. No Medical Advice</h3>
        <p className="text-sm text-gray-600">
          The Service retrieves and displays health records as provided by your payers and
          providers. We do not review, interpret, validate, or provide any medical opinion on
          the information returned. Nothing displayed by the Service constitutes medical advice.
          Always consult a qualified healthcare professional regarding your health.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">6. Accuracy of Records</h3>
        <p className="text-sm text-gray-600">
          Records are retrieved directly from source systems operated by third parties. We make no
          representations regarding the accuracy, completeness, or currency of records returned.
          Discrepancies should be reported directly to the relevant payer or provider.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">7. Intellectual Property</h3>
        <p className="text-sm text-gray-600">
          The Service, including its design, code, and content created by MTC Group LLC, is owned
          by MTC Group LLC and protected by applicable intellectual property laws. Health records
          returned through the Service remain the property of the originating health organizations
          and/or the patient as provided by law.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">8. Disclaimer of Warranties</h3>
        <p className="text-sm text-gray-600">
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS
          OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
          PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE
          UNINTERRUPTED, ERROR-FREE, OR THAT ALL CONNECTED ENDPOINTS WILL RETURN RESULTS.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">9. Limitation of Liability</h3>
        <p className="text-sm text-gray-600">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, MTC GROUP LLC SHALL NOT BE LIABLE FOR ANY
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR
          USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF HEALTH COVERAGE,
          OR RELIANCE ON INFORMATION RETRIEVED THROUGH THE SERVICE.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">10. Third-Party Services</h3>
        <p className="text-sm text-gray-600">
          The Service connects to third-party payer and provider APIs. We are not responsible for
          the availability, accuracy, or practices of those third-party services. Their use is
          governed by their own terms and privacy policies.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">11. Modifications</h3>
        <p className="text-sm text-gray-600">
          We reserve the right to modify these Terms at any time. Updated Terms will be posted
          on this page with a revised effective date. Continued use of the Service after changes
          are posted constitutes acceptance of the modified Terms.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">12. Governing Law</h3>
        <p className="text-sm text-gray-600">
          These Terms shall be governed by and construed in accordance with the laws of the State
          of Texas, without regard to its conflict of law provisions.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">13. Contact</h3>
        <p className="text-sm text-gray-600">
          Questions about these Terms should be directed to:<br />
          MTC Group LLC<br />
          Email: <a href="mailto:rick@mtcgroupllc.com" className="text-blue-600 underline">rick@mtcgroupllc.com</a>
        </p>
      </section>
    </div>
  );
}
