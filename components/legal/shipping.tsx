export default function Shipping() {
  return (
    <div className="min-h-screen bg-white text-gray-900 pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-4">
          Shipping Policy
        </h1>
        <p className="text-sm text-gray-500 mb-12">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="prose prose-lg max-w-none space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              1. Shipping Information
            </h2>
            <p className="leading-relaxed mb-4">
              Bourgon Industries Pvt. Ltd. ships products across India. We strive to process and ship all orders 
              as quickly as possible while ensuring the safety and security of your products during transit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              2. Order Processing
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Processing Time</h3>
            <p className="leading-relaxed mb-4">
              Orders are typically processed within 1-2 business days (Monday through Saturday, excluding public holidays). 
              Processing time begins after we receive your order and payment confirmation.
            </p>
            <p className="leading-relaxed mb-4">
              During peak seasons, sale periods, or special promotions, processing times may be extended. We will 
              notify you via email if there are any delays in processing your order.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Order Confirmation</h3>
            <p className="leading-relaxed">
              Once your order is placed, you will receive an order confirmation email with your order number and 
              details. Please keep this email for your records.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              3. Shipping Methods and Delivery Times
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Standard Shipping</h3>
            <p className="leading-relaxed mb-4">
              We offer standard shipping to all locations in India. Estimated delivery times are:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li><strong>Metro Cities (Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Pune):</strong> 3-5 business days</li>
              <li><strong>Tier 1 & Tier 2 Cities:</strong> 5-7 business days</li>
              <li><strong>Other Locations:</strong> 7-10 business days</li>
            </ul>
            <p className="leading-relaxed mb-4">
              Please note that these are estimated delivery times and may vary based on:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your location</li>
              <li>Weather conditions</li>
              <li>Carrier delays</li>
              <li>Public holidays</li>
              <li>Remote or hard-to-reach areas</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Express Shipping</h3>
            <p className="leading-relaxed mb-4">
              Express shipping options may be available for select locations. If available, you will see this option 
              during checkout. Express shipping typically delivers within 1-3 business days to metro cities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              4. Shipping Charges
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">4.1 Shipping Fees</h3>
            <p className="leading-relaxed mb-4">
              Shipping charges are calculated based on:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Product weight and dimensions</li>
              <li>Delivery location</li>
              <li>Selected shipping method</li>
            </ul>
            <p className="leading-relaxed mb-4">
              Shipping charges will be displayed at checkout before you complete your purchase. We may offer free 
              shipping on orders above a certain value, which will be clearly indicated on our website.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">4.2 Cash on Delivery (COD)</h3>
            <p className="leading-relaxed">
              Cash on Delivery is available for select locations. A COD handling fee may apply, which will be 
              displayed at checkout. COD orders may have longer processing and delivery times.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              5. Tracking Your Order
            </h2>
            <p className="leading-relaxed mb-4">
              Once your order is shipped, you will receive a shipping confirmation email with:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Tracking number</li>
              <li>Carrier information</li>
              <li>Estimated delivery date</li>
              <li>Link to track your shipment</li>
            </ul>
            <p className="leading-relaxed">
              You can also track your order by visiting our "Track Order" page and entering your order number.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              6. Delivery Address
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Address Accuracy</h3>
            <p className="leading-relaxed mb-4">
              Please ensure that your delivery address is complete and accurate. We are not responsible for delays 
              or failed deliveries due to incorrect or incomplete addresses provided by you.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Address Changes</h3>
            <p className="leading-relaxed mb-4">
              If you need to change your delivery address, please contact us immediately at bourgonindustries@gmail.com 
              or +91 88008 30465. Address changes can only be accommodated if your order has not yet been shipped.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">6.3 Delivery Attempts</h3>
            <p className="leading-relaxed">
              Our shipping partners will make multiple attempts to deliver your order. If delivery cannot be completed 
              after multiple attempts, the package may be returned to us. In such cases, you may be charged for return 
              shipping and will need to contact us to arrange re-delivery.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              7. Delivery Issues
            </h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">7.1 Delayed Deliveries</h3>
            <p className="leading-relaxed mb-4">
              While we strive to deliver within estimated timeframes, delays may occur due to factors beyond our 
              control, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Weather conditions</li>
              <li>Natural disasters</li>
              <li>Carrier delays</li>
              <li>Public holidays</li>
              <li>Remote delivery locations</li>
            </ul>
            <p className="leading-relaxed">
              If your order is significantly delayed, please contact us and we will investigate and keep you informed.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">7.2 Lost or Damaged Packages</h3>
            <p className="leading-relaxed mb-4">
              If your package is lost or damaged during transit:
            </p>
            <ol className="list-decimal pl-6 space-y-2 mb-4">
              <li>Contact us immediately at bourgonindustries@gmail.com or +91 88008 30465</li>
              <li>Provide your order number and details</li>
              <li>For damaged packages, please take photos of the damaged packaging and product</li>
            </ol>
            <p className="leading-relaxed">
              We will investigate the issue and arrange for a replacement or refund as appropriate.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              8. International Shipping
            </h2>
            <p className="leading-relaxed">
              Currently, we only ship within India. International shipping may be available in the future. Please 
              check our website or contact us for updates on international shipping availability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              9. Risk of Loss
            </h2>
            <p className="leading-relaxed">
              Title and risk of loss for products pass to you upon delivery to the carrier. However, if a product 
              is lost or damaged during shipping due to our error or negligence, we will replace the product or 
              provide a full refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 mt-8">
              10. Contact Information
            </h2>
            <p className="leading-relaxed mb-4">
              For any questions about shipping, delivery, or to report issues, please contact us:
            </p>
            <div className="bg-gray-50 p-6 border border-gray-200">
              <p className="font-semibold mb-2">Bourgon Industries Pvt. Ltd.</p>
              <p className="mb-1">B - 30, Ambedkar Colony, Chhatarpur</p>
              <p className="mb-1">New Delhi - 110074, India</p>
              <p className="mb-1">Email: bourgonindustries@gmail.com</p>
              <p className="mb-1">Phone: +91 88008 30465</p>
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

