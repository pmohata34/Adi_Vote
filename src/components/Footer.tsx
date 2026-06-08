
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-gray-100 bg-white/80 backdrop-blur-md mt-auto py-6">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              CR
            </div>
            <span className="text-sm font-medium">Adamas CR Vote</span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
            <nav className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/verification" className="hover:text-primary transition-colors">
                Verify
              </Link>
              <Link to="/results" className="hover:text-primary transition-colors">
                Results
              </Link>
            </nav>
            
            <div className="h-4 w-px bg-gray-200 hidden md:block" />
            
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Adamas CR Voting System. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
