import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { parseQuery } from "@/lib/delegate-query"
import { useEthos } from "@/contexts/ethos"
import { useEffect, useState } from "react"
import { useAgents } from "@/contexts/AgentContext"
import { SquarePen, Check, X } from "lucide-react" // Import the required icons
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const DIRECTIVE = "Suggest a vote for the passed proposal based on the ethos of the user. The result must be a only a JSON with two elements: 'vote' which can be yes or no and 'reason' which is the explanation of the reasons considered for the voting decision. The JSON must be formatted as follows: {\"vote\": \"yes\", \"reason\": \"...\"}."

// Shared content component to avoid duplication
const SuggestionContent = ({ isLoading, voteSuggestion, voteReason, isAgentEnabled }) => (
  <>
    {isLoading ? (
      <div className="flex items-center justify-center py-8">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    ) : (
      <div className="space-y-4 py-4">
        {voteSuggestion ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className={`flex items-center justify-center h-24 w-24 rounded-full ${
              voteSuggestion === "yes" ? "bg-green-100" : "bg-red-100"
            }`}>
              {voteSuggestion === "yes" ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h3 className="text-xl font-medium">
              {isAgentEnabled ? "Agent will vote" : "Suggested Vote"}: 
              <span className={`font-bold ${voteSuggestion === "yes" ? "text-green-600" : "text-red-600"}`}>
                {" "}{voteSuggestion?.toUpperCase()}
              </span>
            </h3>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium">Unable to generate suggestion</h3>
          </div>
        )}
        
        <div className="rounded-md bg-muted p-4">
          <h4 className="mb-2 font-medium">Reasoning:</h4>
          <p className="text-sm text-muted-foreground">{voteReason}</p>
        </div>
      </div>
    )}
  </>
);

// Content for manual voting dialog
const ManualVoteContent = ({ onVoteYes, onVoteNo }) => (
  <div className="space-y-6 py-4">
    <p className="text-center text-muted-foreground">
      Please select your vote for this proposal:
    </p>
    <div className="flex justify-center gap-4">
      <Button 
        onClick={onVoteYes} 
        variant="outline" 
        className="flex-1 max-w-xs border-green-300 hover:bg-green-50 hover:text-green-700 cursor-pointer"
      >
        <Check className="mr-2 h-5 w-5 text-green-500" />
        Vote Yes
      </Button>
      <Button 
        onClick={onVoteNo}
        variant="outline"
        className="flex-1 max-w-xs border-red-300 hover:bg-red-50 hover:text-red-700 cursor-pointer"
      >
        <X className="mr-2 h-5 w-5 text-red-500" />
        Vote No
      </Button>
    </div>
  </div>
);

export function DrawerDialog({proposal, isAgentEnabled, voteStatus}: any) {
  const { ethos } = useEthos();
  const [open, setOpen] = useState(false);
  const [manualVoteOpen, setManualVoteOpen] = useState(false);
  const [voteSuggestion, setVoteSuggestion] = useState<string | undefined>(undefined);
  const [voteReason, setVoteReason] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isDesktop = useIsMobile() === false;

  // Run parseQuery whenever proposal changes
  useEffect(() => {
    // This effect now runs when 'open' state changes to true (when dialog opens)
    if (open) {
      setIsLoading(true);
      getVoteSuggestion();
    }
  }, [open, proposal]);

  const getVoteSuggestion = async () => {
    try {
      // Create a unique key for caching based on the directive and proposal body
      const cacheKey = `${ethos}-${proposal.id}`;
      
      // Check if we have a cached response for this specific proposal
      const cachedResponse = localStorage.getItem(cacheKey);
      
      if (cachedResponse) {
        const decodedResponse = JSON.parse(cachedResponse);
        setVoteSuggestion(decodedResponse.vote);
        setVoteReason(decodedResponse.reason);
        setIsLoading(false);
      } else {
        const response = await parseQuery(`This is the user ethos: ${ethos}. ${DIRECTIVE}`, proposal.body);
        try {
          const decodedResponse = JSON.parse(response);
          setVoteSuggestion(decodedResponse.vote);
          setVoteReason(decodedResponse.reason);
          setIsLoading(false);
          localStorage.setItem(cacheKey, response);
        } catch (error) {
          setVoteSuggestion(undefined);
          setVoteReason('Request failed.');
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error parsing query:', error);
    }
  };
  
  const handleManualVote = (vote: string) => {
    // Here you would implement the actual voting logic
    console.log(`Manual vote submitted: ${vote}`);
    // Close the manual vote dialog
    setManualVoteOpen(false);
    // You could show a success notification here
  };

  // Preview Vote + Manual Vote button for desktop
  const SuggestButtons = () => (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => setOpen(true)}>
        {voteStatus === 'yes' || voteStatus === 'no' 
          ? "Show Agent Reason" 
          : "Preview Agent Vote"}
      </Button>
      {isAgentEnabled && proposal.state?.toLowerCase() === 'active' && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="cursor-pointer" 
                onClick={() => setManualVoteOpen(true)}
              >
                <SquarePen className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Vote Manually</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <>
        {/* Preview Vote Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {isAgentEnabled ? (
              <SuggestButtons />
            ) : (
              <Button variant="outline" size="sm" className="cursor-pointer">
                {voteStatus === 'yes' || voteStatus === 'no' 
                  ? "Show Agent Reason" 
                  : "Suggest"}
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className="md:max-w-[768px]">
            <DialogHeader>
              <DialogTitle>{proposal.title}</DialogTitle>
            </DialogHeader>
            
            <SuggestionContent 
              isLoading={isLoading}
              voteSuggestion={voteSuggestion}
              voteReason={voteReason}
              isAgentEnabled={isAgentEnabled}
            />
          </DialogContent>
        </Dialog>

        {/* Manual Vote Dialog */}
        <Dialog open={manualVoteOpen} onOpenChange={setManualVoteOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Vote Manually</DialogTitle>
              <DialogDescription>
                {proposal.title}
              </DialogDescription>
            </DialogHeader>
            
            <ManualVoteContent 
              onVoteYes={() => handleManualVote('yes')}
              onVoteNo={() => handleManualVote('no')}
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      {/* Preview Vote Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {isAgentEnabled ? (
            <div className="flex gap-2">
              <Button variant="outline" className="cursor-pointer">
                {voteStatus === 'yes' || voteStatus === 'no' 
                  ? "Show Agent Reason" 
                  : "Preview Agent Vote"}
              </Button>
              {proposal.state?.toLowerCase() === 'active' && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="cursor-pointer p-2" 
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the Preview drawer
                          setManualVoteOpen(true);
                        }}
                      >
                        <SquarePen className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Vote Manually</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          ) : (
            <Button variant="outline" className="cursor-pointer">Suggest</Button>
          )}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{proposal.title}</DrawerTitle>
          </DrawerHeader>
          
          <div className="px-4">
            <SuggestionContent 
              isLoading={isLoading}
              voteSuggestion={voteSuggestion}
              voteReason={voteReason}
              isAgentEnabled={isAgentEnabled}
            />
          </div>
          
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline" className="cursor-pointer">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Manual Vote Drawer */}
      <Drawer open={manualVoteOpen} onOpenChange={setManualVoteOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Vote Manually</DrawerTitle>
            <DrawerDescription>{proposal.title}</DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4">
            <ManualVoteContent 
              onVoteYes={() => handleManualVote('yes')}
              onVoteNo={() => handleManualVote('no')}
            />
          </div>
          
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline" className="cursor-pointer">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
