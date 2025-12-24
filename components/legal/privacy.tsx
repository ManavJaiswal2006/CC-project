export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-12">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              1. Introduction
            </h2>
            <p className="leading-relaxed">
              Bourgon Industries Pvt. Ltd. ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when 
              you visit our website and make purchases from us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              2. Information We Collect
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Personal Information</h3>
            <p className="leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Name and contact information (email address, phone number)</li>
              <li>Shipping and billing addresses</li>
              <li>Payment information (processed securely through our payment providers)</li>
              <li>Account credentials (email and password for account creation)</li>
              <li>Order history and preferences</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Automatically Collected Information</h3>
            <p className="leading-relaxed mb-4">
              When you visit our website, we automatically collect certain information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, time spent, click patterns)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              3. How We Use Your Information
            </h2>
            <p className="leading-relaxed mb-4">
              We use the information we collect for various purposes, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Processing and fulfilling your orders</li>
              <li>Communicating with you about your orders, products, and services</li>
              <li>Improving our website and customer experience</li>
              <li>Sending you marketing communications (with your consent)</li>
              <li>Preventing fraud and ensuring security</li>
              <li>Complying with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              4. Information Sharing and Disclosure
            </h2>
            <p className="leading-relaxed mb-4">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> With third-party vendors who perform services on our behalf (payment processing, shipping, email delivery)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              5. Data Security
            </h2>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal 
              information. However, no method of transmission over the Internet or electronic storage is 100% 
              secure. While we strive to use commercially acceptable means to protect your information, we 
              cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              6. Cookies and Tracking Technologies
            </h2>
            <p className="leading-relaxed mb-4">
              We use cookies and similar tracking technologies to track activity on our website and store 
              certain information. You can instruct your browser to refuse all cookies or to indicate when 
              a cookie is being sent. However, if you do not accept cookies, you may not be able to use 
              some portions of our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              7. Your Rights and Choices
            </h2>
            <p className="leading-relaxed mb-4">
              Depending on your location, you may have certain rights regarding your personal information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to access your personal information</li>
              <li>The right to rectify inaccurate information</li>
              <li>The right to delete your personal information</li>
              <li>The right to object to processing of your information</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
            <p className="leading-relaxed mt-4">
              To exercise these rights, please contact us using the information provided in the Contact section below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              8. Children's Privacy
            </h2>
            <p className="leading-relaxed">
              Our website is not intended for children under the age of 18. We do not knowingly collect 
              personal information from children. If you are a parent or guardian and believe your child 
              has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              9. Changes to This Privacy Policy
            </h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by 
              posting the new Privacy Policy on this page and updating the "Last updated" date. You are 
              advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              10. Contact Us
            </h2>
            <p className="leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 p-6 border border-gray-200">
              <p className="font-semibold mb-2">Bourgon Industries Pvt. Ltd.</p>
              <p className="mb-1">B - 30, Ambedkar Colony, Chhatarpur</p>
              <p className="mb-1">New Delhi - 110074, India</p>
              <p className="mb-1">Email: bourgonindustries@gmail.com</p>
              <p>Phone: +91 88008 30465</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

