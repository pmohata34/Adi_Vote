
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, LogIn, Loader2 } from "lucide-react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { toast } from "sonner";

// Demo admin credentials (in a real app, this would be handled securely)
const ADMIN_PASSWORD = "admin123"; // This is just for demo purposes

const AdminLogin = () => {
  const { currentUser, checkIfAdmin } = useAuth();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("You must be signed in to access admin features.");
      return;
    }
    
    if (password !== ADMIN_PASSWORD) {
      toast.error("Invalid admin password.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create admin document for the current user
      const adminRef = doc(db, "admins", currentUser.uid);
      const adminDoc = await getDoc(adminRef);
      
      if (!adminDoc.exists()) {
        await setDoc(adminRef, {
          email: currentUser.email,
          name: currentUser.displayName,
          createdAt: new Date()
        });
      }
      
      // Re-check admin status
      await checkIfAdmin();
      
      toast.success("Successfully logged in as admin!");
      window.location.href = "/admin"; // Redirect to admin dashboard
    } catch (error) {
      console.error("Error setting admin status:", error);
      toast.error("Failed to set admin status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <Card className="w-full max-w-md shadow-md animate-scale-in">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-semibold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter the admin password to access the election management dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleAdminLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Admin Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="text-xs text-muted-foreground">
              <p>Demo credentials (for testing only):</p>
              <p>Password: admin123</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || !password}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Login as Admin
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
