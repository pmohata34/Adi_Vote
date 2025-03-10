
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { pathname } = useLocation();
  
  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Add animation class to the main content
  useEffect(() => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.classList.add("fade-in-up");
      
      // Remove animation class after animation completes
      const timeout = setTimeout(() => {
        mainContent.classList.remove("fade-in-up");
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main 
        id="main-content" 
        className="flex-1 pt-24 pb-16 px-6"
      >
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
