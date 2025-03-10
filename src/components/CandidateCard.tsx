
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { User } from 'lucide-react';

export interface Candidate {
  id: string;
  name: string;
  photoURL: string;
  bio: string;
  voteCount?: number;
}

interface CandidateCardProps {
  candidate: Candidate;
  onVote?: (candidateId: string) => void;
  showVotes?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
  isWinner?: boolean;
}

const CandidateCard = ({
  candidate,
  onVote,
  showVotes = false,
  isSelected = false,
  disabled = false,
  isWinner = false
}: CandidateCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card 
      className={`overflow-hidden transition-all duration-300 ${
        isSelected 
          ? 'ring-2 ring-primary shadow-md' 
          : isHovered 
            ? 'shadow-md transform scale-[1.01]' 
            : 'shadow-sm'
      } ${isWinner ? 'border-primary/40 bg-primary/5' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative pt-[100%] overflow-hidden bg-secondary">
        {isWinner && (
          <div className="absolute top-2 right-2 z-10 bg-primary text-white text-xs font-semibold py-1 px-2 rounded-full">
            Winner
          </div>
        )}
        {candidate.photoURL ? (
          <img
            src={candidate.photoURL}
            alt={candidate.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out-expo"
            style={{ 
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <User className="h-20 w-20 text-muted-foreground/50" />
          </div>
        )}
      </div>
      
      <CardContent className="p-5">
        <h3 className="font-medium text-lg">{candidate.name}</h3>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
          {candidate.bio}
        </p>
        
        {showVotes && candidate.voteCount !== undefined && (
          <div className="mt-4 flex items-center">
            <div className="w-full bg-secondary rounded-full h-2 mr-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${Math.min(100, candidate.voteCount)}%` }}
              />
            </div>
            <span className="text-sm font-medium">
              {candidate.voteCount}
            </span>
          </div>
        )}
      </CardContent>
      
      {onVote && (
        <CardFooter className="p-4 pt-0">
          <Button
            onClick={() => onVote(candidate.id)}
            className={`w-full transition-all duration-300 ${
              isSelected ? 'bg-primary' : 'bg-secondary text-foreground hover:bg-primary/90 hover:text-primary-foreground'
            }`}
            disabled={disabled}
          >
            {isSelected ? 'Selected' : 'Vote'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CandidateCard;
