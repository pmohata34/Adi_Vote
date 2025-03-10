
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { User, LogOut, Home, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const Header = () => {
  const { currentUser, signOut, isAdmin } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm" 
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
              <span className="animate-scale-in">CR</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">VoteVolution</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm transition-colors hover:text-primary ${
                location.pathname === "/" ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link 
              to="/verification" 
              className={`text-sm transition-colors hover:text-primary ${
                location.pathname === "/verification" ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              Verify
            </Link>
            <Link 
              to="/results" 
              className={`text-sm transition-colors hover:text-primary ${
                location.pathname === "/results" ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              Results
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`text-sm transition-colors hover:text-primary ${
                  location.pathname.startsWith("/admin") ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center">
                <div className="flex flex-col items-end mr-2">
                  <span className="text-sm font-medium truncate max-w-[120px]">
                    {currentUser.displayName}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {currentUser.email}
                  </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                  {currentUser.photoURL ? (
                    <img 
                      src={currentUser.photoURL} 
                      alt={currentUser.displayName || "User"} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Link to="/verification">
              <Button size="sm" className="btn-hover">
                <User className="h-4 w-4 mr-1.5" />
                Sign In
                <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
