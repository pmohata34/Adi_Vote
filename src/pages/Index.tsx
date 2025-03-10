
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, BarChart3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

const Index = () => {
  const { currentUser, hasVoted } = useAuth();
  const [electionActive, setElectionActive] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalCandidates, setTotalCandidates] = useState(0);
  
  // Fetch election stats
  useEffect(() => {
    const fetchElectionStats = async () => {
      try {
        // Check if election is active
        const settingsRef = collection(db, "settings");
        const settingsSnapshot = await getDocs(settingsRef);
        
        if (!settingsSnapshot.empty) {
          const settingsData = settingsSnapshot.docs[0].data();
          setElectionActive(settingsData.electionActive ?? true);
        }
        
        // Get total candidates
        const candidatesRef = collection(db, "candidates");
        const candidatesSnapshot = await getDocs(candidatesRef);
        setTotalCandidates(candidatesSnapshot.size);
        
        // Get total votes
        const votersRef = collection(db, "voters");
        const votersQuery = query(votersRef, where("hasVoted", "==", true));
        const votersSnapshot = await getDocs(votersQuery);
        setTotalVotes(votersSnapshot.size);
      } catch (error) {
        console.error("Error fetching election stats:", error);
      }
    };
    
    fetchElectionStats();
  }, []);

  return (
    <Layout>
      <section className="py-10 md:py-16">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-center">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6 animate-fade-in">
              {electionActive ? "Election In Progress" : "Election Completed"}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight animate-slide-up">
              College CR Election
              <span className="text-primary">.</span>
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground animate-slide-up" style={{ animationDelay: "100ms" }}>
              Cast your vote for the next Class Representative in our secure and transparent online voting system.
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8 animate-slide-up" style={{ animationDelay: "200ms" }}>
              {currentUser ? (
                hasVoted ? (
                  <Link to="/results">
                    <Button size="lg" className="shadow-md btn-hover">
                      <BarChart3 className="mr-2 h-5 w-5" /> 
                      View Results
                    </Button>
                  </Link>
                ) : (
                  <Link to="/voting">
                    <Button size="lg" className="shadow-md btn-hover">
                      Cast Your Vote <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )
              ) : (
                <Link to="/verification">
                  <Button size="lg" className="shadow-md btn-hover">
                    Start Verification <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              )}
              
              <Link to="/results">
                <Button variant="outline" size="lg" className="shadow-sm">
                  View Results
                </Button>
              </Link>
            </div>
            
            {electionActive && (
              <div className="mt-6 text-muted-foreground text-sm animate-fade-in" style={{ animationDelay: "300ms" }}>
                {totalVotes > 0 && (
                  <p className="flex items-center justify-center md:justify-start">
                    <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-500" />
                    <span>{totalVotes} votes cast so far</span>
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-lg"></div>
              <div className="glass-panel rounded-2xl overflow-hidden relative shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                  alt="College students voting" 
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="text-3xl font-bold">{totalCandidates}</div>
                <div className="text-sm text-muted-foreground">Candidates</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <div className="text-3xl font-bold">{totalVotes}</div>
                <div className="text-sm text-muted-foreground">Total Votes</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Our CR voting system provides a seamless, secure experience for electing your class representative.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Verify Your Identity",
              description: "Sign in with your college email to get verified as an eligible voter.",
              icon: "👤",
              delay: 0
            },
            {
              title: "Cast Your Vote",
              description: "Vote for your preferred candidate securely. Each student can vote only once.",
              icon: "🗳️",
              delay: 150
            },
            {
              title: "View Results",
              description: "Check live election results and see who's leading the race.",
              icon: "📊",
              delay: 300
            }
          ].map((step, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 stagger-item flex flex-col items-center text-center"
              style={{ animationDelay: `${step.delay}ms` }}
            >
              <div className="text-3xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-medium mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Index;
