export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-gray-500 mb-12">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              1. Agreement to Terms
            </h2>
            <p className="leading-relaxed">
              By accessing or using the website of Bourgon Industries Pvt. Ltd. ("we," "our," or "us"), 
              you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, 
              please do not use our website or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              2. Use of Our Website
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Eligibility</h3>
            <p className="leading-relaxed mb-4">
              You must be at least 18 years old to use our website and make purchases. By using our website, 
              you represent and warrant that you meet this age requirement.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Account Registration</h3>
            <p className="leading-relaxed mb-4">
              You may be required to create an account to access certain features. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and current information</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              3. Products and Pricing
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Product Information</h3>
            <p className="leading-relaxed mb-4">
              We strive to provide accurate product descriptions, images, and pricing. However, we do not 
              warrant that product descriptions or other content on our website is accurate, complete, 
              reliable, current, or error-free.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Pricing</h3>
            <p className="leading-relaxed mb-4">
              All prices are listed in Indian Rupees (₹) unless otherwise stated. We reserve the right to 
              change prices at any time without prior notice. However, the price you pay will be the price 
              in effect at the time of your order placement.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Availability</h3>
            <p className="leading-relaxed">
              Product availability is subject to change. We reserve the right to limit quantities, discontinue 
              products, or refuse orders at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              4. Orders and Payment
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Order Acceptance</h3>
            <p className="leading-relaxed mb-4">
              Your order is an offer to purchase products from us. We reserve the right to accept or reject 
              your order for any reason, including product availability, errors in pricing or product information, 
              or suspected fraud.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Payment Methods</h3>
            <p className="leading-relaxed mb-4">
              We accept various payment methods, including credit/debit cards, UPI, and cash on delivery (COD). 
              For COD orders, a handling fee may apply. By placing an order, you agree to pay the total amount 
              specified, including any applicable fees and taxes.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.3 Payment Processing</h3>
            <p className="leading-relaxed">
              Payment processing is handled by secure third-party payment providers. We do not store your 
              complete payment card information on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              5. Shipping and Delivery
            </h2>
            <p className="leading-relaxed mb-4">
              We will make every effort to deliver products within the estimated delivery timeframes. However, 
              delivery times are estimates and not guaranteed. Factors such as shipping location, weather 
              conditions, and carrier delays may affect delivery times.
            </p>
            <p className="leading-relaxed">
              Risk of loss and title for products pass to you upon delivery to the carrier. You are responsible 
              for providing accurate shipping addresses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              6. Returns and Refunds
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Return Policy</h3>
            <p className="leading-relaxed mb-4">
              If you are not satisfied with your purchase, you may return eligible items within the timeframe 
              specified in our return policy. Items must be in their original condition, unused, and with all 
              original packaging and tags.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Refunds</h3>
            <p className="leading-relaxed">
              Refunds will be processed to the original payment method within a reasonable timeframe after we 
              receive and inspect the returned items. Shipping costs may not be refundable unless the return 
              is due to our error.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              7. Intellectual Property
            </h2>
            <p className="leading-relaxed">
              All content on our website, including text, graphics, logos, images, and software, is the property 
              of Bourgon Industries or its content suppliers and is protected by copyright and other intellectual 
              property laws. You may not reproduce, distribute, modify, or create derivative works from any 
              content without our express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              8. Prohibited Uses
            </h2>
            <p className="leading-relaxed mb-4">
              You agree not to use our website:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
              <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
              <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
              <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
              <li>To submit false or misleading information</li>
              <li>To upload or transmit viruses or any other type of malicious code</li>
              <li>To interfere with or circumvent the security features of our website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              9. Disclaimer of Warranties
            </h2>
            <p className="leading-relaxed">
              Our website and products are provided "as is" and "as available" without any warranties of any kind, 
              either express or implied. We do not warrant that our website will be uninterrupted, secure, or 
              error-free, or that defects will be corrected.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              10. Limitation of Liability
            </h2>
            <p className="leading-relaxed">
              To the fullest extent permitted by law, Bourgon Industries shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, or any loss of profits or revenues, 
              whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible 
              losses resulting from your use of our website or products.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              11. Indemnification
            </h2>
            <p className="leading-relaxed">
              You agree to indemnify and hold harmless Bourgon Industries and its officers, directors, employees, 
              and agents from and against any claims, liabilities, damages, losses, and expenses, including 
              reasonable legal fees, arising out of or in any way connected with your use of our website, 
              violation of these Terms, or violation of any rights of another.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              12. Governing Law
            </h2>
            <p className="leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India, without 
              regard to its conflict of law provisions. Any disputes arising under or in connection with these 
              Terms shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              13. Changes to Terms
            </h2>
            <p className="leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify you of any material changes 
              by posting the new Terms on this page and updating the "Last updated" date. Your continued use of 
              our website after such modifications constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              14. Severability
            </h2>
            <p className="leading-relaxed">
              If any provision of these Terms is found to be unenforceable or invalid, that provision shall be 
              limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain 
              in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              15. Contact Information
            </h2>
            <p className="leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
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

