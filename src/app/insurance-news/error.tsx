
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md bg-destructive/10 border-destructive">
        <CardHeader className="text-center">
          <div className="mx-auto bg-destructive/20 rounded-full p-3 w-fit">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-destructive mt-4">
            Something went wrong!
          </CardTitle>
          <CardDescription>
            An error occurred while loading the news feed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 p-3 rounded-md text-xs text-destructive-foreground/80 font-mono">
            <p className="font-bold">Error:</p>
            <p>{error.message}</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={() => reset()} className="w-full">
            Try again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    