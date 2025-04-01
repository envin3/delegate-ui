import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import arbitrumLogo from "/arbitrum-arb-logo.svg"
import aaveLogo from "/aave-aave-logo.svg"
import gnosisLogo from "/gnosis-gno-gno-logo.svg"
import safeLogo from "/safe-logo.svg"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartEngagement } from "./chart-engagement"
import { Github, Globe, Twitter } from "lucide-react"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @2xl/main:grid-cols-2 @6xl/main:grid-cols-3 @7xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            Snapshot DAO
          </CardDescription>
          <CardAction>
            <Badge variant="outline">
              4 Active Proposal
            </Badge>
          </CardAction>
          <CardTitle className="flex text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
            <div className="flex size-16 items-center justify-center mr-4">
            <img src={arbitrumLogo} className="shrink-0" alt="Arbitrum logo" />
            </div>
          <div className="grid flex-1 text-left text-3xl leading-tight">
            <span className="truncate font-bold">Arbitrum</span>
            <Badge variant="outline">
              <Globe/>
              <Twitter/>
              <Github/>
            </Badge>
          </div>
          </CardTitle>
        </CardHeader>
        <ChartEngagement activeUsers={1260} angle={320} />
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Users
            <Badge variant="outline">
              321k
            </Badge>
          </div>
          <div className="line-clamp-1 flex gap-2 font-medium">
            Proposals
            <Badge variant="outline">
              364
            </Badge>
          </div>
          <div className="line-clamp-1 flex gap-2 font-medium">
            Votes
            <Badge variant="outline">
              5.6m
            </Badge>
          </div>
          {/* <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div> */}
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            Snapshot DAO
          </CardDescription>
          <CardAction>
            <Badge variant="outline">
              3 Active Proposal
            </Badge>
          </CardAction>
          <CardTitle className="flex text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
            <div className="flex size-16 items-center justify-center mr-4">
            <img src={aaveLogo} className="shrink-0" alt="Aave logo" />
            </div>
          <div className="grid flex-1 text-left text-3xl leading-tight">
            <span className="truncate font-bold">Aave</span>
            <Badge variant="outline">
              <Globe/>
              <Twitter/>
              <Github/>
            </Badge>
          </div>
          </CardTitle>
        </CardHeader>
        <ChartEngagement activeUsers={781} angle={230}/>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Users
            <Badge variant="outline">
              156k
            </Badge>
          </div>
          <div className="line-clamp-1 flex gap-2 font-medium">
            Proposals
            <Badge variant="outline">
              809
            </Badge>
          </div>
          <div className="line-clamp-1 flex gap-2 font-medium">
            Votes
            <Badge variant="outline">
              3.2m
            </Badge>
          </div>
          {/* <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div> */}
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            Snapshot DAO
          </CardDescription>
          <CardAction>
            <Badge variant="outline">
              No Active Proposal
            </Badge>
          </CardAction>
          <CardTitle className="flex text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
            <div className="flex size-16 items-center justify-center mr-4">
            <img src={gnosisLogo} className="shrink-0" alt="Gnosis logo" />
            </div>
          <div className="grid flex-1 text-left text-3xl leading-tight">
            <span className="truncate font-bold">Gnosis</span>
            <Badge variant="outline">
              <Globe/>
              <Twitter/>
              <Github/>
            </Badge>
          </div>
          </CardTitle>
        </CardHeader>
        <ChartEngagement activeUsers={38} angle={110}/>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Users
            <Badge variant="outline">
              17k
            </Badge>
          </div>
          <div className="line-clamp-1 flex gap-2 font-medium">
            Proposals
            <Badge variant="outline">
              53
            </Badge>
          </div>
          <div className="line-clamp-1 flex gap-2 font-medium">
            Votes
            <Badge variant="outline">
              23k
            </Badge>
          </div>
          {/* <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div> */}
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>
            Snapshot DAO
          </CardDescription>
          <CardAction>
            <Badge variant="outline">
              No Active Proposal
            </Badge>
          </CardAction>
          <CardTitle className="flex text-xl font-semibold tabular-nums @[250px]/card:text-2xl">
            <div className="flex size-16 items-center justify-center mr-4">
            <img src={safeLogo} className="shrink-0" alt="Gnosis logo" />
            </div>
          <div className="grid flex-1 text-left text-3xl leading-tight">
            <span className="truncate font-bold">Safe</span>
            <Badge variant="outline">
              <Globe/>
              <Twitter/>
              <Github/>
            </Badge>
          </div>
          </CardTitle>
        </CardHeader>
        <ChartEngagement activeUsers={238} angle={190}/>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Users
            <Badge variant="outline">
              12k
            </Badge>
          </div>
          <div className="line-clamp-1 flex gap-2 font-medium">
            Proposals
            <Badge variant="outline">
              211
            </Badge>
          </div>
          <div className="line-clamp-1 flex gap-2 font-medium">
            Votes
            <Badge variant="outline">
              46k
            </Badge>
          </div>
          {/* <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div> */}
        </CardFooter>
      </Card>
      {/* <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card> */}
    </div>
  )
}
