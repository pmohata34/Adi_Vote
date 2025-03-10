
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound, ArrowLeft, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const OTPVerification = () => {
  const { currentUser, loading, verificationEmail, verifyOTP, resendOTP, emailVerificationStep } = useAuth();
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  
  // Handle redirection
  useEffect(() => {
    if (currentUser) {
      navigate("/voting");
    } else if (emailVerificationStep === 0) {
      navigate("/verification");
    } else if (emailVerificationStep === 2) {
      navigate("/voting");
    }
  }, [currentUser, emailVerificationStep, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await verifyOTP(otp);
      if (success) {
        navigate("/voting");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await resendOTP();
    } finally {
      setIsResending(false);
    }
  };

  const handleBack = () => {
    navigate("/verification");
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto py-10 md:py-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-fade-in">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold animate-slide-up">Verify Your Email</h1>
          <p className="text-muted-foreground mt-3 animate-slide-up" style={{ animationDelay: "100ms" }}>
            Enter the verification code sent to <strong>{verificationEmail}</strong>
          </p>
        </div>
        
        <div className="bg-white rounded-xl p-6 md:p-8 shadow-md border border-gray-100 animate-scale-in" style={{ animationDelay: "200ms" }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="one-time-code"
                  className="text-center text-lg tracking-widest"
                  required
                />
              </div>
            </div>
            
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                className="w-full btn-hover shadow-sm"
                disabled={isSubmitting || otp.length !== 6}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </Button>
            </div>
          </form>
          
          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={isSubmitting}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResendOTP}
              disabled={isResending}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              {isResending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-1 h-4 w-4" />
              )}
              Resend Code
            </Button>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <h3 className="font-medium">Didn't receive a code?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Check your spam folder or click "Resend Code" to get a new verification code.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OTPVerification;