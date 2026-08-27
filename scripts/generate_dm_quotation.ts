import { adminDb } from "../firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

async function run() {
  console.log("Generating Digital Marketing Quotation for The Reserve Gorumara...");

  const templateId = "Premium Digital Marketing";
  
  // 1. Create the template in serviceTemplates
  console.log(`Creating/Updating template: ${templateId}`);
  await adminDb.collection("serviceTemplates").doc(templateId).set({
    servicePackage: `
<p><strong>Scope of Work & Service Details:</strong></p>
<ul>
  <li><strong>Facebook & Instagram:</strong> 10 promotional posts per month</li>
  <li><strong>Target Locations:</strong> 20 locations</li>
  <li><strong>Monthly Reports:</strong> Monthly performance report</li>
  <li><strong>Instagram Performance:</strong> Target of up to 1 Million Views</li>
  <li><strong>Optimization:</strong> Regular optimization based on campaign performance</li>
</ul>
    `.trim(),
    projectDeliverables: `
<ul>
  <li>Monthly performance report to track campaign progress.</li>
  <li>Design and content creation included as per the agreed scope.</li>
</ul>
    `.trim(),
    importantNote: "Instagram views/reach depend on content performance, audience response and platform algorithms; 1 Million Views is a target, not a guaranteed result.",
    scheduleTimeFrame: "6 Months",
    projectPaymentTerms: `
<ul>
  <li><strong>Monthly Payment:</strong> ₹15,000/- per month</li>
  <li><strong>6-Month Package – One-Time Payment:</strong> ₹70,200/- (Payment in advance for the complete 6-month period)</li>
</ul>
<p><em>*The 6-month package is offered at a special discounted price.</em></p>
    `.trim(),
    sampleOrCaseStudies: "",
    termsAndConditions: "Any paid advertising budget, if required, will be charged separately."
  }, { merge: true });

  // 2. Create the Enquiry
  console.log("Creating Enquiry...");
  const enquiryRef = await adminDb.collection("enquiries").add({
    customerName: "The Reserve Gorumara",
    email: "admin07digitaldictionary@gmail.com",
    mobileNumber: "9733508600",
    serviceType: templateId,
    status: "quotation_sent",
    requirements: `
<p><strong>Premium Digital Marketing Requirements:</strong></p>
<p>Client requires an extensive Facebook & Instagram campaign targeting 20 locations with a strong emphasis on achieving up to 1 Million Views on Instagram. Must include comprehensive design and content creation.</p>
    `.trim(),
    createdAt: FieldValue.serverTimestamp()
  });

  console.log(`Created Enquiry: ${enquiryRef.id}`);

  // 3. Create the Quotation
  console.log("Creating Quotation...");
  const quotationRef = await adminDb.collection("quotations").add({
    serialNumber: `DD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
    enquiryId: enquiryRef.id,
    customerName: "The Reserve Gorumara",
    serviceType: templateId,
    price: 70200,
    status: "Sent",
    paymentStatus: "Payment Pending",
    createdAt: FieldValue.serverTimestamp()
  });

  console.log(`Created Quotation: ${quotationRef.id}`);
  console.log("Successfully generated Digital Marketing Quotation!");
}

run().catch(console.error);
