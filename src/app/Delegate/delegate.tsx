import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import remarkGfm from 'remark-gfm'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ReactMarkdown from 'react-markdown'
import { parseQuery } from "@/lib/delegate-query"
import { useEthos } from "@/contexts/ethos"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

const DIRECTIVE = "Suggest a vote for the passed proposal based on the ethos of the user. The result must be a only a JSON with two elements: 'vote' which can be yes or no and 'reason' which is the explanation of the reasons considered for the voting decision. The JSON must be formatted as follows: {\"vote\": \"yes\", \"reason\": \"...\"}."

export function DrawerDialog({proposal}: any) {
  const { ethos } = useEthos();
  const [open, setOpen] = useState(false)
//   const [parsedSummary, setParsedSummary] = React.useState<string | undefined>(undefined);
  const [voteSuggestion, setVoteSuggestion] = useState<string | undefined>(undefined);
  const [voteReason, setVoteReason] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isDesktop = useIsMobile() === false

    // Run parseQuery whenever proposal changes
    useEffect(() => {
        // This effect now runs when 'open' state changes to true (when dialog opens)
        if (open) {
            setIsLoading(true);
            getVoteSuggestion();
        }
    }, [open, proposal])

   
    const getVoteSuggestion = async () => {
        try {
            // Create a unique key for caching based on the directive and proposal body
            const cacheKey = `${ethos}-${proposal.id}`;
            
            // Check if we have a cached response for this specific proposal
            const cachedResponse = localStorage.getItem(cacheKey);
            
            if (cachedResponse) {
                const decodedResponse = JSON.parse(cachedResponse)
                setVoteSuggestion(decodedResponse.vote);
                setVoteReason(decodedResponse.reason);
                setIsLoading(false);
            } else {
                const response = await parseQuery(`This is the user ethos: ${ethos}. ${DIRECTIVE}`, proposal.body);
                try {
                    const decodedResponse = JSON.parse(response)
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
    }


  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Suggest</Button>
        </DialogTrigger>
        <DialogContent className="md:max-w-[768px]">
          <DialogHeader>
            <DialogTitle>{proposal.title}</DialogTitle>
            {/* <DialogDescription>
                <Badge variant="outline">
                    {proposal.id}
                </Badge>
            </DialogDescription> */}
          </DialogHeader>
          {/* <ProposalAccordion body={parsedSummary} /> */}
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
                <h3 className="text-xl font-medium">Suggested Vote: <span className={`font-bold ${voteSuggestion === "yes" ? "text-green-600" : "text-red-600"}`}>{voteSuggestion?.toUpperCase()}</span></h3>
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
          {/* <ProfileForm /> */}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Proposal</DrawerTitle>
          <DrawerDescription>
            Make changes to your profile here. Click save when you're done.
          </DrawerDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function ProfileForm({ className }: React.ComponentProps<"form">) {
  return (
    <form className={cn("grid items-start gap-4", className)}>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" defaultValue="shadcn@example.com" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" defaultValue="@shadcn" />
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  )
}

function ProposalAccordion({body}: any) {
    return (
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>Proposal Summary</AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-60 rounded-md border">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
                {/* <ReactMarkdown>{body}</ReactMarkdown> */}
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }
