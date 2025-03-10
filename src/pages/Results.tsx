
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import CandidateCard, { Candidate } from "../components/CandidateCard";
import { collection, getDocs, query, where, getDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";
import { Loader2, BarChart3, Trophy } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const Results = () => {
  const navigate = useNavigate();
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [electionEnded, setElectionEnded] = useState(false);
  const [totalVotes, setTotalVotes] = useState(0);
  const [winner, setWinner] = useState<Candidate | null>(null);
  
  // Fetch election results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Check if results are public
        const settingsRef = collection(db, "settings");
        const settingsSnapshot = await getDocs(settingsRef);
        
        let resultsPublic = true;
        let electionEnded = false;
        
        if (!settingsSnapshot.empty) {
          const settingsData = settingsSnapshot.docs[0].data();
          resultsPublic = settingsData.resultsPublic ?? true;
          electionEnded = settingsData.electionEnded ?? false;
          setElectionEnded(electionEnded);
          
          if (!resultsPublic && !electionEnded) {
            toast.info("Election results are not yet public.");
            setCandidates([]);
            setLoading(false);
            return;
          }
        }
        
        // Fetch candidates with vote counts
        const candidatesRef = collection(db, "candidates");
        const candidatesSnapshot = await getDocs(candidatesRef);
        
        let candidatesData = candidatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          voteCount: doc.data().voteCount || 0
        })) as Candidate[];
        
        // Count total votes
        const votersRef = collection(db, "voters");
        const votersQuery = query(votersRef, where("hasVoted", "==", true));
        const votersSnapshot = await getDocs(votersQuery);
        
        const totalVoteCount = votersSnapshot.size;
        setTotalVotes(totalVoteCount);
        
        // Sort candidates by vote count
        candidatesData = candidatesData.sort((a, b) => 
          (b.voteCount || 0) - (a.voteCount || 0)
        );
        
        // Determine winner if election ended
        if (electionEnded && candidatesData.length > 0) {
          setWinner(candidatesData[0]);
        }
        
        setCandidates(candidatesData);
      } catch (error) {
        console.error("Error fetching results:", error);
        toast.error("Failed to load election results. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-muted-foreground">Loading election results...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-10">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 animate-fade-in">
            {electionEnded ? "Election Completed" : "Live Results"}
          </div>
          <h1 className="text-3xl font-bold animate-slide-up">Election Results</h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
            {electionEnded 
              ? "The CR election has concluded. View the final results below." 
              : "View the current standings in the CR election. Results are updated in real-time."}
          </p>
        </div>
        
        {winner && (
          <div className="mb-12 animate-scale-in">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-2">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Election Winner</h2>
            </div>
            
            <div className="max-w-md mx-auto">
              <CandidateCard 
                candidate={winner} 
                showVotes={true} 
                isWinner={true}
              />
            </div>
          </div>
        )}
        
        {candidates.length > 0 && (
          <>
            <div className="mb-10 animate-fade-in" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center mb-4">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                <h2 className="text-xl font-semibold">Vote Distribution</h2>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={candidates.map(c => ({ name: c.name, votes: c.voteCount || 0 }))}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip 
                      formatter={(value) => [`${value} votes`, 'Votes']}
                      cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    />
                    <Bar dataKey="votes" fill="#3B82F6">
                      {candidates.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3B82F6' : '#93C5FD'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: "300ms" }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Candidate Results</h2>
                <div className="text-sm text-muted-foreground">
                  Total Votes: <span className="font-medium">{totalVotes}</span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {candidates.map((candidate, index) => (
                  <div 
                    key={candidate.id} 
                    className="stagger-item"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CandidateCard 
                      candidate={candidate} 
                      showVotes={true}
                      isWinner={electionEnded && index === 0}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {candidates.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Results Available Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Election results haven't been made public yet. Please check back later.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Results;
