
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn, Loader2, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const Verification = () => {
  const { currentUser, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/voting");
    }
  }, [currentUser, navigate]);

  return (
    <Layout>
      <div className="max-w-md mx-auto py-10 md:py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-fade-in">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold animate-slide-up">Student Verification</h1>
          <p className="text-muted-foreground mt-3 animate-slide-up" style={{ animationDelay: "100ms" }}>
            Verify your identity using your college email account to participate in the CR election.
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-md border border-gray-100 animate-scale-in" style={{ animationDelay: "200ms" }}>
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-medium">Get Started</h2>
              <p className="text-sm text-muted-foreground">
                Sign in with your college email address to verify your eligibility to vote.
              </p>
            </div>
            
            <div className="border-t border-gray-100 pt-6">
              <Button
                onClick={signInWithGoogle}
                size="lg"
                className="w-full btn-hover shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Continue with Google
                  </>
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Note: You must use your college email address to verify your identity.
              </p>
            </div>
          </div>
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
