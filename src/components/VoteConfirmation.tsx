
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Loader2, User } from 'lucide-react';
import type { Candidate } from './CandidateCard';

interface VoteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  onConfirm: () => Promise<void>;
}

const VoteConfirmation = ({
  isOpen,
  onClose,
  candidate,
  onConfirm
}: VoteConfirmationProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirm = async () => {
    if (!candidate) return;
    
    setIsSubmitting(true);
    
    try {
      await onConfirm();
      setIsSuccess(true);
      
      // Auto close after success
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error confirming vote:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!candidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Your Vote</DialogTitle>
          <DialogDescription>
            You are about to cast your vote for this candidate. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="py-6 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-medium text-lg">Vote Confirmed!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your vote for {candidate.name} has been recorded.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-start space-x-4 py-4">
              <div className="h-16 w-16 rounded-md overflow-hidden bg-secondary flex-shrink-0">
                {candidate.photoURL ? (
                  <img
                    src={candidate.photoURL}
                    alt={candidate.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-medium">{candidate.name}</h4>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{candidate.bio}</p>
              </div>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  "Confirm Vote"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default VoteConfirmation;
