
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Loader2, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const Verification = () => {
  const { currentUser, loading, initiateEmailVerification, emailVerificationStep } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/voting");
    } else if (emailVerificationStep === 1) {
      navigate("/otp-verification");
    } else if (emailVerificationStep === 2) {
      navigate("/voting");
    }
  }, [currentUser, emailVerificationStep, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await initiateEmailVerification(email);
      if (success) {
        navigate("/otp-verification");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto py-10 md:py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-fade-in">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold animate-slide-up">Student Verification</h1>
          <p className="text-muted-foreground mt-3 animate-slide-up" style={{ animationDelay: "100ms" }}>
            Verify your identity using your Adamas University email account to participate in the Adamas CR election.
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-md border border-gray-100 animate-scale-in" style={{ animationDelay: "200ms" }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-medium">Get Started</h2>
              <p className="text-sm text-muted-foreground">
                Enter your Adamas University email address to verify your eligibility to vote.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">College Email</Label>
                <Input
                  id="email"
                  placeholder="youremail@stu.adamasuniversity.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use your Adamas University email ending with @stu.adamasuniversity.ac.in or @adamasuniversity.ac.in
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <Button
                type="submit"
                size="lg"
                className="w-full btn-hover shadow-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Continue with Email
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <h3 className="font-medium">Why verification is required</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Verification ensures that only eligible students can participate in the election, maintaining fairness and integrity.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <h3 className="font-medium">Your privacy matters</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We only use your email to verify your eligibility. Your vote remains anonymous and private.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Verification;
