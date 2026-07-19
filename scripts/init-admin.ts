import { adminAuth } from "../firebase/admin";

async function initAdmin() {
  try {
    const email = "admin@digitaldictionary.com";
    const password = "admin123";

    // check if user exists
    try {
      const user = await adminAuth.getUserByEmail(email);
      console.log(`User ${email} already exists with UID: ${user.uid}`);
      
      // Update password just in case
      await adminAuth.updateUser(user.uid, { password });
      console.log("Password reset to default.");
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        const userRecord = await adminAuth.createUser({
          email,
          password,
          emailVerified: true,
        });
        console.log(`Successfully created new admin user: ${userRecord.uid}`);
      } else {
        throw e;
      }
    }
  } catch (error) {
    console.error("Error initializing admin:", error);
  }
}

initAdmin();
