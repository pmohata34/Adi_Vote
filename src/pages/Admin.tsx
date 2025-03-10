
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  ChevronRight, 
  UserPlus, 
  Users, 
  BarChart, 
  Settings, 
  FileDown, 
  AlertTriangle,
  CheckCircle2, 
  Download
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";
import AdminLogin from "../components/AdminLogin";
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  onSnapshot,
  where,
  orderBy,
  limit,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "sonner";

// Define types for our data
interface Candidate {
  id: string;
  name: string;
  bio: string;
  photoURL?: string;
  voteCount: number;
}

interface VoterData {
  id: string;
  email: string;
  name: string;
  hasVoted: boolean;
  votedAt?: any;
}

const Admin = () => {
  const { currentUser, isAdmin, checkIfAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voters, setVoters] = useState<VoterData[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [electionActive, setElectionActive] = useState(true);
  const [publicResults, setPublicResults] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // New candidate form state
  const [newCandidate, setNewCandidate] = useState({
    name: "",
    bio: "",
    photoURL: ""
  });
  
  // Check admin status and redirect if not an admin
  useEffect(() => {
    const verifyAdmin = async () => {
      if (currentUser) {
        const isUserAdmin = await checkIfAdmin();
        if (!isUserAdmin) {
          navigate("/");
          toast.error("You don't have permission to access the admin panel");
        }
      }
      setLoading(false);
    };
    
    verifyAdmin();
  }, [currentUser, navigate, checkIfAdmin]);

  // Fetch candidates, voters, and settings
  useEffect(() => {
    if (!isAdmin) return;
    
    // Fetch settings
    const fetchSettings = async () => {
      try {
        const settingsRef = collection(db, "settings");
        const settingsSnapshot = await getDocs(settingsRef);
        
        if (!settingsSnapshot.empty) {
          const settingsData = settingsSnapshot.docs[0].data();
          setElectionActive(settingsData.electionActive ?? true);
          setPublicResults(settingsData.publicResults ?? true);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      }
    };
    
    // Fetch candidates with real-time updates
    const candidatesUnsubscribe = onSnapshot(
      collection(db, "candidates"),
      (snapshot) => {
        const candidatesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Candidate));
        
        setCandidates(candidatesList);
      },
      (error) => {
        console.error("Error fetching candidates:", error);
        toast.error("Failed to load candidates");
      }
    );
    
    // Fetch voters with real-time updates
    const votersUnsubscribe = onSnapshot(
      collection(db, "voters"),
      (snapshot) => {
        const votersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as VoterData));
        
        setVoters(votersList);
        setTotalVotes(votersList.filter(v => v.hasVoted).length);
      },
      (error) => {
        console.error("Error fetching voters:", error);
        toast.error("Failed to load voters");
      }
    );
    
    fetchSettings();
    
    return () => {
      candidatesUnsubscribe();
      votersUnsubscribe();
    };
  }, [isAdmin]);

  // Add new candidate
  const handleAddCandidate = async () => {
    if (!newCandidate.name || !newCandidate.bio) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      // Generate a unique ID for the candidate
      const candidateRef = doc(collection(db, "candidates"));
      
      await setDoc(candidateRef, {
        name: newCandidate.name,
        bio: newCandidate.bio,
        photoURL: newCandidate.photoURL || null,
        voteCount: 0,
        createdAt: serverTimestamp()
      });
      
      // Reset form
      setNewCandidate({
        name: "",
        bio: "",
        photoURL: ""
      });
      
      toast.success("Candidate added successfully");
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast.error("Failed to add candidate");
    }
  };

  // Delete candidate
  const handleDeleteCandidate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;
    
    try {
      await deleteDoc(doc(db, "candidates", id));
      toast.success("Candidate deleted");
    } catch (error) {
      console.error("Error deleting candidate:", error);
      toast.error("Failed to delete candidate");
    }
  };

  // Update election settings
  const updateElectionSettings = async () => {
    try {
      const settingsRef = doc(collection(db, "settings"), "election");
      
      await setDoc(settingsRef, {
        electionActive,
        publicResults,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    }
  };

  // Export results to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = ["Name", "Bio", "Votes"];
    const candidatesData = candidates.map(c => [c.name, c.bio, c.voteCount]);
    
    const csvContent = [
      headers.join(","),
      ...candidatesData.map(row => row.join(","))
    ].join("\n");
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `election_results_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If not admin, show login screen
  if (!currentUser || !isAdmin) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <AdminLogin />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">
            Manage the CR election, candidates, and view voting statistics
          </p>
        </div>
        
        <Tabs defaultValue="dashboard">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="voters">Voters</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Votes</CardTitle>
                  <CardDescription>Current voting statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{totalVotes}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {voters.length > 0 
                      ? `${Math.round((totalVotes / voters.length) * 100)}% voter turnout` 
                      : "No registered voters yet"}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Candidates</CardTitle>
                  <CardDescription>Registered candidates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{candidates.length}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Election Status</CardTitle>
                  <CardDescription>Current state of the election</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${electionActive ? "bg-green-500" : "bg-red-500"}`}></div>
                    <span className="font-medium">
                      {electionActive ? "Active" : "Closed"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Voters */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Votes</CardTitle>
                <CardDescription>
                  The most recent votes cast in the election
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {voters
                    .filter(voter => voter.hasVoted)
                    .sort((a, b) => b.votedAt?.toDate() - a.votedAt?.toDate())
                    .slice(0, 5)
                    .map(voter => (
                      <div key={voter.id} className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0">
                        <div>
                          <div className="font-medium">{voter.name}</div>
                          <div className="text-sm text-muted-foreground">{voter.email}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {voter.votedAt?.toDate()
                            ? new Date(voter.votedAt.toDate()).toLocaleString()
                            : "Time not recorded"}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Candidates Tab */}
          <TabsContent value="candidates">
            <Card>
              <CardHeader>
                <CardTitle>Add New Candidate</CardTitle>
                <CardDescription>
                  Create a new candidate for the CR election
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Candidate Name</Label>
                    <Input 
                      id="name" 
                      value={newCandidate.name}
                      onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                      placeholder="Enter candidate name"
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="bio">Bio / Manifesto</Label>
                    <Textarea 
                      id="bio" 
                      value={newCandidate.bio}
                      onChange={(e) => setNewCandidate({...newCandidate, bio: e.target.value})}
                      placeholder="Brief description of the candidate"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="photoURL">Photo URL (Optional)</Label>
                    <Input 
                      id="photoURL" 
                      value={newCandidate.photoURL}
                      onChange={(e) => setNewCandidate({...newCandidate, photoURL: e.target.value})}
                      placeholder="https://example.com/photo.jpg"
                    />
                  </div>
                  <Button onClick={handleAddCandidate} className="w-full sm:w-auto">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Candidate
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Candidate List</h3>
              {candidates.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {candidates.map(candidate => (
                    <Card key={candidate.id}>
                      <CardContent className="p-4">
                        <div className="flex space-x-4">
                          <div className="h-12 w-12 rounded-full overflow-hidden bg-secondary flex items-center justify-center flex-shrink-0">
                            {candidate.photoURL ? (
                              <img 
                                src={candidate.photoURL} 
                                alt={candidate.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Users className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium line-clamp-1">{candidate.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {candidate.bio}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <div className="text-sm">
                                <span className="font-medium">{candidate.voteCount}</span> votes
                              </div>
                              <Button 
                                variant="destructive" 
                                size="sm" 
                                onClick={() => handleDeleteCandidate(candidate.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-muted/50 rounded-md">
                  <Users className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-medium text-lg">No Candidates Yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your first candidate above to get started
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Voters Tab */}
          <TabsContent value="voters">
            <Card>
              <CardHeader>
                <CardTitle>Registered Voters</CardTitle>
                <CardDescription>
                  Students who have registered to vote
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 mb-4">
                  <div className="text-sm font-medium">Summary</div>
                  <div className="flex gap-6">
                    <div>
                      <span className="text-2xl font-bold">{voters.length}</span>
                      <span className="text-xs text-muted-foreground ml-1">Total Registered</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold">{totalVotes}</span>
                      <span className="text-xs text-muted-foreground ml-1">Total Voted</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold">
                        {voters.length > 0 ? Math.round((totalVotes / voters.length) * 100) : 0}%
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">Turnout</span>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <div className="grid grid-cols-10 font-medium bg-muted p-3 text-sm">
                    <div className="col-span-4">Name / Email</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-3">Vote Time</div>
                  </div>
                  <div className="divide-y">
                    {voters.length > 0 ? (
                      voters.map(voter => (
                        <div key={voter.id} className="grid grid-cols-10 p-3 text-sm">
                          <div className="col-span-4">
                            <div className="font-medium">{voter.name}</div>
                            <div className="text-xs text-muted-foreground">{voter.email}</div>
                          </div>
                          <div className="col-span-3 flex items-center">
                            {voter.hasVoted ? (
                              <div className="flex items-center">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
                                <span>Voted</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <AlertTriangle className="h-4 w-4 text-amber-500 mr-1.5" />
                                <span>Not voted</span>
                              </div>
                            )}
                          </div>
                          <div className="col-span-3 text-muted-foreground">
                            {voter.votedAt ? new Date(voter.votedAt.toDate()).toLocaleString() : "—"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        No registered voters yet
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Election Settings</CardTitle>
                <CardDescription>
                  Control the election status and visibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="election-active" className="flex flex-col space-y-1">
                      <span>Election Status</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        {electionActive 
                          ? "Election is currently active and receiving votes" 
                          : "Election is closed and not accepting new votes"}
                      </span>
                    </Label>
                    <Switch
                      id="election-active"
                      checked={electionActive}
                      onCheckedChange={setElectionActive}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="public-results" className="flex flex-col space-y-1">
                      <span>Public Results</span>
                      <span className="font-normal text-sm text-muted-foreground">
                        {publicResults 
                          ? "Results are visible to all users in real-time" 
                          : "Results are only visible to admins until election ends"}
                      </span>
                    </Label>
                    <Switch
                      id="public-results"
                      checked={publicResults}
                      onCheckedChange={setPublicResults}
                    />
                  </div>
                  
                  <Button onClick={updateElectionSettings}>
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Results Tab */}
          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Election Results</CardTitle>
                <CardDescription>
                  Current standings in the CR election
                </CardDescription>
              </CardHeader>
              <CardContent>
                {candidates.length > 0 ? (
                  <div className="space-y-6">
                    {candidates
                      .sort((a, b) => b.voteCount - a.voteCount)
                      .map((candidate, index) => {
                        const percentage = totalVotes > 0 
                          ? Math.round((candidate.voteCount / totalVotes) * 100) 
                          : 0;
                          
                        return (
                          <div key={candidate.id}>
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium mr-2">
                                  {index + 1}
                                </div>
                                <span className="font-medium">{candidate.name}</span>
                              </div>
                              <div className="text-sm font-medium">
                                {candidate.voteCount} votes ({percentage}%)
                              </div>
                            </div>
                            
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                    })}
                    
                    <Button onClick={exportToCSV} className="mt-6">
                      <Download className="mr-2 h-4 w-4" />
                      Export Results
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <BarChart className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                    <h3 className="font-medium text-lg">No Results Yet</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add candidates and collect votes to see results
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
