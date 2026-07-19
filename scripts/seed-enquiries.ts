import { adminDb } from "../firebase/admin";

async function seed() {
  console.log("Seeding demo enquiries...");
  const enquiries = [
    {
      customerName: "Acme Innovations",
      serviceType: "Website Development",
      status: "in_progress",
      email: "contact@acmeinnovations.com",
      mobileNumber: "+1 234 567 8900",
      requirements: "Need a new scalable e-commerce platform built on Next.js.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
    },
    {
      customerName: "Jane Smith",
      serviceType: "SEO",
      status: "pending",
      email: "jane@smithlocal.com",
      mobileNumber: "+1 987 654 3210",
      requirements: "Looking to improve local search rankings for my plumbing business.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
    },
    {
      customerName: "TechNova Inc",
      serviceType: "Software Solutions",
      status: "pending",
      email: "info@technova.com",
      mobileNumber: "+1 555 123 4567",
      requirements: "Require a custom internal CRM development for our sales team.",
      createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    }
  ];

  const collectionRef = adminDb.collection("enquiries");
  
  let count = 0;
  for (const enquiry of enquiries) {
    await collectionRef.add(enquiry);
    count++;
  }

  console.log(`Successfully added ${count} demo enquiries!`);
}

seed().catch(console.error);
