"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BookOpen, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      
      router.refresh();
      router.push("/dashboard");
    } catch (error: any) {
      setError("root", { 
        type: "manual", 
        message: "Invalid email or password. Please try again." 
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Abstract Background Design */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[5%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md"
      >
        <Card className="border-border/50 shadow-2xl bg-card/80 backdrop-blur-xl">
          <CardHeader className="space-y-3 items-center text-center pb-6">
            <div className="w-full max-w-[300px] h-32 flex items-center justify-center mb-6 mx-auto">
              <img 
                src="/logo.png?v=4" 
                alt="Digital Dictionary Logo" 
                className="w-full h-auto max-h-full object-contain" 
              />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>
              Sign in to manage the Digital Dictionary platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  placeholder="admin@example.com" 
                  className="bg-background/50" 
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm font-medium text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button variant="link" className="p-0 h-auto text-xs text-muted-foreground hover:text-primary" type="button">
                    Forgot password?
                  </Button>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-background/50" 
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-sm font-medium text-destructive">{errors.password.message}</p>
                )}
              </div>
              {errors.root && (
                <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium text-center">
                  {errors.root.message}
                </div>
              )}
              <Button type="submit" className="w-full h-11 text-base font-medium" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-border/50 pt-6 text-sm text-muted-foreground">
            Protected by production-grade security.
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
