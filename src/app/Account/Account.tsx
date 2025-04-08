import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useAccount } from 'wagmi'
import { useEthos } from '@/contexts/ethos'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useState } from "react"

function Account() {
  const account = useAccount()
  const { ethos, setEthos } = useEthos();
  const [draftEthos, setDraftEthos] = useState(ethos);  
  
  const handleSave = () => {
    setEthos(draftEthos);
    toast("Ethos", {
      description: `Ethos upadated`,
    });
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <Card className="mx-4 lg:mx-6">
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
          </CardHeader>
          <CardContent>
          Address: {account.address}
            <br />
          Status: {account.status}
          </CardContent>
        </Card>
        <Card className="mx-4 lg:mx-6">
          <CardHeader>
            <CardTitle>Ethos</CardTitle>
          </CardHeader>
          <CardContent>
          <div className="space-y-4">
            {/* <h2 className="text-xl font-bold">Your Delegation Ethos</h2> */}
            <p className="text-muted-foreground text-sm">
              Define your guiding principles for DAO governance.
            </p>
            
            <Textarea
              value={draftEthos}
              onChange={(e) => setDraftEthos(e.target.value)}
              placeholder={ethos}
              className="min-h-[150px]"
            />
            
            <Button onClick={handleSave}>Save Ethos</Button>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Account