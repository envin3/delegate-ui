import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClockIcon, ExternalLinkIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DigestItem, DigestPeriod } from "../types";
import { formatDate } from "../services/fetchDigestData";

export function DigestCard({ item, period }: { item: DigestItem; period: DigestPeriod }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={item.sourceIcon} alt={item.source} />
                <AvatarFallback>{item.source.substring(0, 2)}</AvatarFallback>
              </Avatar>
              {item.source}
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-2">{item.category}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2">
        <div className="flex items-center text-sm text-gray-500">
          <ClockIcon className="mr-1 h-4 w-4" />
          {formatDate(item.date, period)}
        </div>
        <Button variant="ghost" size="sm" className="flex items-center" asChild>
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            Read more <ExternalLinkIcon className="ml-1 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}