export default function CancellationRefunds() {
  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-20">
      <div className="w-full px-6">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-4">
          Cancellation & Refunds
        </h1>
        <p className="text-sm text-gray-500 mb-12">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              1. Cancellation Policy
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">1.1 Order Cancellation by Customer</h3>
            <p className="leading-relaxed mb-4">
              You may cancel your order before it has been shipped. To cancel an order, please contact our customer 
              care team at cc-projectindustries@gmail.com or call us at +91 88008 30465 & +91 88008 30467. Please provide your order number 
              for faster processing.
            </p>
            <p className="leading-relaxed mb-4">
              Once your order has been shipped, cancellation is not possible. However, you may return the product 
              as per our return policy outlined below.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">1.2 Order Cancellation by cc-project Industries</h3>
            <p className="leading-relaxed mb-4">
              We reserve the right to cancel any order at any time for reasons including, but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Product unavailability</li>
              <li>Pricing errors</li>
              <li>Suspected fraudulent activity</li>
              <li>Inability to deliver to the provided address</li>
              <li>Violation of our Terms of Service</li>
            </ul>
            <p className="leading-relaxed">
              If we cancel your order, we will notify you via email and process a full refund to your original 
              payment method within 5-7 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              2. Return Policy
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Return Eligibility</h3>
            <p className="leading-relaxed mb-4">
              You may return products within 7 days of delivery, provided that:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>The product is unused, unopened, and in its original condition</li>
              <li>All original packaging, tags, labels, and accessories are included</li>
              <li>The product is not damaged, altered, or customized</li>
              <li>You have a valid proof of purchase (order confirmation or invoice)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Non-Returnable Items</h3>
            <p className="leading-relaxed mb-4">
              The following items are not eligible for return:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Customized or personalized products</li>
              <li>Products damaged due to misuse or negligence</li>
              <li>Products without original packaging or tags</li>
              <li>Products returned after the 7-day return period</li>
              <li>Gift cards or promotional items (unless specified)</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.3 Return Process</h3>
            <p className="leading-relaxed mb-4">
              To initiate a return:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mb-4">
              <li>Contact our customer care team at cc-projectindustries@gmail.com or +91 88008 30465 & +91 88008 30467 with your order number</li>
              <li>Provide a reason for the return</li>
              <li>Our team will review your request and provide return authorization and instructions</li>
              <li>Pack the product securely in its original packaging</li>
              <li>Ship the product back to the address provided by our team</li>
            </ol>
            <p className="leading-relaxed">
              You are responsible for return shipping costs unless the return is due to our error (wrong product, 
              defective item, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              3. Refund Policy
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Refund Processing</h3>
            <p className="leading-relaxed mb-4">
              Once we receive and inspect the returned product, we will process your refund. Refunds will be 
              issued to the original payment method used for the purchase. Processing times are as follows:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Credit/Debit Cards:</strong> 5-7 business days after we receive the returned product</li>
              <li><strong>UPI:</strong> 3-5 business days after we receive the returned product</li>
              <li><strong>Cash on Delivery (COD):</strong> Refund will be processed via bank transfer within 7-10 business days</li>
            </ul>
            <p className="leading-relaxed mb-4">
              Please note that it may take additional time for the refund to appear in your account, depending 
              on your bank or payment provider.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Refund Amount</h3>
            <p className="leading-relaxed mb-4">
              The refund amount will include:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>The full product price</li>
              <li>Original shipping charges (if the return is due to our error or a defective product)</li>
            </ul>
            <p className="leading-relaxed mb-4">
              The refund amount will NOT include:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Return shipping costs (unless the return is due to our error)</li>
              <li>Any handling or processing fees (if applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              4. Defective or Damaged Products
            </h2>
            <p className="leading-relaxed mb-4">
              If you receive a defective or damaged product, please contact us immediately at cc-projectindustries@gmail.com 
              or +91 88008 30465 & +91 88008 30467. Please provide:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Your order number</li>
              <li>Photos of the defect or damage</li>
              <li>A description of the issue</li>
            </ul>
            <p className="leading-relaxed">
              We will arrange for a replacement or full refund, including all shipping costs. In such cases, we will 
              provide a prepaid return shipping label.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              5. Exchange Policy
            </h2>
            <p className="leading-relaxed mb-4">
              We currently do not offer direct exchanges. If you wish to exchange a product:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mb-4">
              <li>Return the original product as per our return policy</li>
              <li>Once the return is processed and refunded, place a new order for the desired product</li>
            </ol>
            <p className="leading-relaxed">
              This ensures you receive the correct product and allows us to process your request efficiently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              6. Contact Information
            </h2>
            <p className="leading-relaxed mb-4">
              For any questions, concerns, or to initiate a return or cancellation, please contact us:
            </p>
            <div className="bg-gray-50 p-6 border border-gray-200">
              <p className="font-semibold mb-2">cc-project Industries Pvt. Ltd.</p>
              <p className="mb-1">22  R VANI VIHAR UTTAM NAGAR</p>
              <p className="mb-1">NEW DELHI  110059, India</p>
              <p className="mb-1">Email: cc-projectindustries@gmail.com</p>
              <p className="mb-1">Phone: +91 88008 30465 & +91 88008 30467</p>
              <p className="mt-4 text-sm text-gray-600">
                Customer Care Hours: Monday - Saturday, 9:00 AM - 7:00 PM IST
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

