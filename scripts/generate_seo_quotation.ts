import { adminDb } from "../firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

async function run() {
  console.log("Generating SEO Quotation for The Reserve Gorumara...");

  const templateId = "Premium SEO";
  
  // 1. Create the template in serviceTemplates
  console.log(`Creating/Updating template: ${templateId}`);
  await adminDb.collection("serviceTemplates").doc(templateId).set({
    servicePackage: `
<p><strong>6-Month SEO Projection:</strong></p>
<ul>
  <li><strong>Month 1:</strong> Technical SEO, website audit, keyword mapping, on-page optimization &rarr; <em>Foundation & indexing improvement</em></li>
  <li><strong>Month 2:</strong> Content optimization, local SEO, citations and authority building &rarr; <em>Initial ranking movement</em></li>
  <li><strong>Month 3:</strong> Content expansion, link building and Google Business Profile optimization &rarr; <em>Improved keyword visibility</em></li>
  <li><strong>Month 4:</strong> Authority building, content refinement and competitor analysis &rarr; <em>Stronger organic presence</em></li>
  <li><strong>Month 5:</strong> Ranking consolidation, CTR optimization and local search strengthening &rarr; <em>Higher search visibility</em></li>
  <li><strong>Month 6:</strong> Performance optimization, ranking stabilization and growth strategy &rarr; <em>Sustainable SEO growth</em></li>
</ul>
    `.trim(),
    projectDeliverables: `
<ul>
  <li>Complete website SEO audit and technical recommendations</li>
  <li>Keyword research, mapping and on-page optimization for 5 target keywords</li>
  <li>Meta title, meta description, heading and content optimization</li>
  <li>Local SEO and Google Business Profile optimization support</li>
  <li>High-quality content planning and optimization</li>
  <li>Off-page SEO, citation and authority-building activities</li>
  <li>Monthly performance tracking and SEO progress reporting</li>
  <li>Competitor monitoring and ongoing optimization</li>
</ul>
    `.trim(),
    importantNote: "SEO rankings and traffic are influenced by search-engine algorithms and competition; therefore, projections are indicative and not a guaranteed ranking promise.",
    scheduleTimeFrame: "6 Months",
    projectPaymentTerms: "100% one-time payment for the complete 6-month campaign.",
    sampleOrCaseStudies: "",
    termsAndConditions: "Any major website development, paid advertising budget, photography/video production or third-party paid tools, if required, will be outside this quotation unless specifically agreed in writing."
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
<p><strong>Target Keywords:</strong></p>
<ol>
  <li>Resort in Gorumara</li>
  <li>Resort in Lataguri</li>
  <li>Gorumara Resort</li>
  <li>Best Resort in Gorumara</li>
  <li>Resort near Gorumara National Park</li>
</ol>
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
    price: 700200,
    status: "Sent",
    paymentStatus: "Payment Pending",
    createdAt: FieldValue.serverTimestamp()
  });

  console.log(`Created Quotation: ${quotationRef.id}`);
  console.log("Successfully generated!");
}

run().catch(console.error);
