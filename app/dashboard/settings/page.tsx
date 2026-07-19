"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateAdminCredentials } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await updateAdminCredentials(
        user.uid, 
        email || undefined, 
        password || undefined
      );
      
      if (res.success) {
        setMessage("Credentials updated successfully. Please use them next time you log in.");
        setEmail("");
        setPassword("");
      } else {
        setError(res.error || "Failed to update credentials.");
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Admin Credentials</CardTitle>
            <CardDescription>
              Update your login email and password. Since there is only one admin account, this will overwrite your current login credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-email">Current Email</Label>
                <Input 
                  id="current-email" 
                  value={user?.email || "Loading..."} 
                  disabled 
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2 pt-2">
                <Label htmlFor="new-email">New Email (Optional)</Label>
                <Input 
                  id="new-email" 
                  type="email" 
                  placeholder="Enter new email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password (Optional)</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  placeholder="Enter new password (min 6 characters)" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {message && <p className="text-sm font-medium text-green-600">{message}</p>}
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}

              <Button type="submit" disabled={isLoading || (!email && !password)}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Credentials
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
