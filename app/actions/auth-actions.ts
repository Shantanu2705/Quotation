"use server";

import { adminAuth } from "@/firebase/admin";

export async function updateAdminCredentials(uid: string, newEmail?: string, newPassword?: string) {
  try {
    const updatePayload: any = {};
    if (newEmail) updatePayload.email = newEmail;
    if (newPassword) updatePayload.password = newPassword;

    if (Object.keys(updatePayload).length > 0) {
      await adminAuth.updateUser(uid, updatePayload);
      return { success: true };
    }
    
    return { success: false, error: "No changes provided." };
  } catch (error: any) {
    console.error("Error updating credentials:", error);
    return { success: false, error: error.message };
  }
}
