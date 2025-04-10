import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useEffect, useState } from "react"
import { AlertCircle, Copy, CircleFadingPlus, CircleMinus } from "lucide-react"
import { getHDAccountByAddress, predictKmsAdapterAddress } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAgents } from "@/contexts/AgentContext"
import { DaoConfigItem } from "@/lib/constants"
import { useSubscriptions } from "@/contexts/subscriptions"
import { toast } from "sonner"

export function Delegate({ dao }: { dao: DaoConfigItem }) {
  const [open, setOpen] = useState(false)
  const [kmsAdapterAddress, setKmsAdapterAddress] = useState<string>('');
  const [delegateAddress, setDelegateAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isDesktop = useIsMobile() === false
  const [error, setError] = useState<string | null>(null);
  const { addAgent, hasAgent, removeAgent } = useAgents();
  const { addSubscription, removeSubscription } = useSubscriptions()

  useEffect(() => {
    async function fetchKmsAdapter() {
      setIsLoading(true);
      setError(null);
      try {
        console.log('aaa');
        const kmsAddress = await predictKmsAdapterAddress();
        setKmsAdapterAddress(kmsAddress);
        const account = getHDAccountByAddress(kmsAddress);
        setDelegateAddress(account.address);
      } catch (err) {
        console.error('Error predicting KMS adapter address:', err);
        setError('Failed to predict KMS adapter address');
      } finally {
        setIsLoading(false);
      }
    }

    if (open) {
      fetchKmsAdapter();
    }
  }, [open]);

  // Add function to handle adding the agent
  const handleAddAgent = () => {
    addAgent(dao);
    addSubscription(dao);
    toast("Agent started", {
      description: `You've started an Agent for ${dao.name}`,
    });
    setOpen(false);
  };
  
  // Handle button click based on agent status
  const handleButtonClick = () => {
    if (hasAgent(dao)) {
      removeAgent(dao);
      removeSubscription(dao);
      toast("Agent stopped", {
        description: `You've stopped an Agent for ${dao.name}`,
      });
    } else {
      setOpen(true);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-3 text-sm text-muted-foreground">Loading KMS adapter...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-4">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={() => {
              setIsLoading(true);
              setError(null);
              predictKmsAdapterAddress()
                .then(address => {
                  setKmsAdapterAddress(address);
                  setError(null);
                })
                .catch(err => {
                  console.error('Error predicting KMS adapter address:', err);
                  setError('Failed to predict KMS adapter address');
                })
                .finally(() => {
                  setIsLoading(false);
                });
            }}
          >
            Retry
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center space-y-4 py-6">
        <div className="bg-white p-4 rounded-md shadow-sm">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(delegateAddress)}`}
            alt="KMS Adapter Address QR Code"
            width={200}
            height={200}
            className="rounded-md"
          />
        </div>
        
        <div className="flex w-full items-center gap-2 max-w-md">
          <code className="text-xs sm:text-sm font-mono bg-muted p-2 rounded flex-1 truncate">
            {delegateAddress}
          </code>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(delegateAddress);
            }}
            title="Copy address"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (isDesktop) {
    return (
      <>
        <Button variant="outline" onClick={handleButtonClick}>
          {!hasAgent(dao) ? (
            <>
              <CircleFadingPlus className="h-4 w-4 mr-1" />
              Voting Agent
            </>
          ) : (
            <>
              <CircleMinus className="h-4 w-4 mr-1" />
              Stop Agent
            </>
          )}
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="md:max-w-[768px]">
            <DialogHeader>
              <DialogTitle>Voting Agent Setup</DialogTitle>
            </DialogHeader>
            {renderContent()}
            
            {/* Add buttons at the bottom */}
            {!isLoading && !error && (
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Maybe Later
                </Button>
                <Button onClick={handleAddAgent}>
                  All Done
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={handleButtonClick}>
        {!hasAgent(dao) ? (
          <>
            <CircleFadingPlus className="h-4 w-4 mr-1" />
            Voting Agent
          </>
        ) : (
          <>
            <CircleMinus className="h-4 w-4 mr-1" />
            Stop Agent
          </>
        )}
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Voting Agent Setup</DrawerTitle>
            <DrawerDescription>
              Delegate your voting power through Davos
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            {renderContent()}
          </div>
          <DrawerFooter className="pt-2">
            {!isLoading && !error ? (
              <div className="flex flex-col gap-2 w-full">
                <Button onClick={handleAddAgent}>
                  All Done
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline">Maybe Later</Button>
                </DrawerClose>
              </div>
            ) : (
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}


