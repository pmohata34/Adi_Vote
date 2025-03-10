import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
  IdTokenResult
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { toast } from "sonner";
import { getFunctions, httpsCallable } from 'firebase/functions';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;
  hasVoted: boolean;
  emailVerificationStep: number;
  verificationEmail: string;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setHasVoted: (value: boolean) => void;
  checkIfAdmin: () => Promise<boolean>;
  initiateEmailVerification: (email: string) => Promise<boolean>;
  verifyOTP: (otp: string) => Promise<boolean>;
  resendOTP: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Email domain validation
const isValidStudentEmail = (email: string) => {
  return email.endsWith('@stu.adamasuniversity.ac.in');
};

const isValidFacultyEmail = (email: string) => {
  return email.endsWith('@adamasuniversity.ac.in');
};

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  
  // Email verification state
  const [emailVerificationStep, setEmailVerificationStep] = useState(0);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [currentOTP, setCurrentOTP] = useState("");

  const functions = getFunctions();
  const sendOTPEmail = httpsCallable(functions, 'sendOTPEmail');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Check if user has admin role
        await checkIfAdmin();
        
        // Check if user has already voted
        const userRef = doc(db, "voters", user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && userDoc.data().hasVoted) {
          setHasVoted(true);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // This function will initiate the email verification process
  const initiateEmailVerification = async (email: string): Promise<boolean> => {
    try {
      // Validate email domain
      if (!isValidStudentEmail(email) && !isValidFacultyEmail(email)) {
        toast.error("Please use your college email address");
        return false;
      }

      // Generate OTP
      const otp = generateOTP();
      setCurrentOTP(otp);
      
      // Send OTP via Cloud Function with error handling
      const result = await sendOTPEmail({ email, otp });
      
      if (!result.data?.success) {
        throw new Error('Failed to send email');
      }
      
      // Store email for verification
      setVerificationEmail(email);
      setEmailVerificationStep(1);
      toast.success(`Verification code sent to ${email}`);
      
      return true;
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      toast.error(error.message || "Failed to send verification code");
      return false;
    }
  };

  // This function verifies the OTP entered by the user
  const verifyOTP = async (otp: string): Promise<boolean> => {
    try {
      if (otp === currentOTP) {
        // OTP is correct, create a user record
        // In a real app, you would create the user in Firebase Auth here
        // For demo, we'll just simulate successful verification
        
        const userData = {
          email: verificationEmail,
          name: verificationEmail.split('@')[0],
          hasVoted: false,
          createdAt: new Date(),
          isVerified: true
        };
        
        // In a real app, this would be tied to Firebase Auth user
        // For demo, we'll use localStorage to persist the login state
        localStorage.setItem('verifiedUser', JSON.stringify(userData));
        
        // Reset verification state
        setEmailVerificationStep(2);
        toast.success("Email verified successfully!");
        
        // Create a simulated user object with all required User properties
        const mockUser: User = {
          uid: verificationEmail,
          email: verificationEmail,
          displayName: verificationEmail.split('@')[0],
          emailVerified: true,
          isAnonymous: false,
          metadata: {},
          providerData: [],
          refreshToken: '',
          tenantId: null,
          photoURL: null,
          phoneNumber: null,
          providerId: 'custom',
          delete: async () => {},
          getIdToken: async () => '',
          getIdTokenResult: async (): Promise<IdTokenResult> => ({
            token: '',
            signInProvider: '',
            expirationTime: '',
            issuedAtTime: '',
            claims: {},
            authTime: '',
            signInSecondFactor: null,
            firebase: {
              sign_in_provider: '',
              sign_in_second_factor: null,
              identities: {}
            }
          }),
          reload: async () => {},
          toJSON: () => ({})
        };
        
        setCurrentUser(mockUser);
        
        // Check if admin (faculty email)
        if (isValidFacultyEmail(verificationEmail)) {
          setIsAdmin(true);
        }
        
        return true;
      } else {
        toast.error("Invalid verification code. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify code. Please try again.");
      return false;
    }
  };

  // Resend OTP function
  const resendOTP = async (): Promise<boolean> => {
    try {
      // Generate new OTP
      const otp = generateOTP();
      setCurrentOTP(otp);
      
      // In a real app, send this OTP to the user's email
      console.log(`Resent OTP for ${verificationEmail}: ${otp}`);
      toast.success(`New verification code sent to ${verificationEmail}`);
      
      return true;
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend verification code. Please try again.");
      return false;
    }
  };

  // This function is kept for compatibility but won't use Google sign-in
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      toast.error("Google sign-in is not available. Please use email verification.");
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // For Firebase
      if (currentUser && auth.currentUser) {
        await firebaseSignOut(auth);
      }
      
      // For our custom auth
      localStorage.removeItem('verifiedUser');
      setCurrentUser(null);
      setIsAdmin(false);
      setHasVoted(false);
      setEmailVerificationStep(0);
      setVerificationEmail("");
      setCurrentOTP("");
      
      toast.success("Successfully signed out!");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const checkIfAdmin = async (): Promise<boolean> => {
    if (!currentUser) {
      setIsAdmin(false);
      return false;
    }
    
    try {
      // For Firebase auth admin check
      if (auth.currentUser) {
        const adminRef = doc(db, "admins", currentUser.uid);
        const adminDoc = await getDoc(adminRef);
        
        if (adminDoc.exists()) {
          setIsAdmin(true);
          return true;
        }
      }
      
      // For custom email-based auth
      // Faculty emails are automatically admins
      if (currentUser.email && isValidFacultyEmail(currentUser.email)) {
        setIsAdmin(true);
        return true;
      }
      
      setIsAdmin(false);
      return false;
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
      return false;
    }
  };

  const value = {
    currentUser,
    loading,
    isAdmin,
    hasVoted,
    emailVerificationStep,
    verificationEmail,
    signInWithGoogle,
    signOut,
    setHasVoted,
    checkIfAdmin,
    initiateEmailVerification,
    verifyOTP,
    resendOTP
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};