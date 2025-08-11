
'use client';

import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BotMessageSquare, Newspaper, Bookmark as BookmarkIcon, ArrowRight } from 'lucide-react';

const QuickLinkCard = ({
  title,
  description,
  href,
  icon: Icon,
  linkText,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  linkText: string;
}) => (
  <Card className="flex flex-col hover:shadow-lg transition-shadow">
    <CardHeader className="flex-row items-start gap-4 space-y-0">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
    </CardHeader>
    <CardFooter className="mt-auto">
      <Button asChild className="w-full">
        <Link href={href}>
          {linkText}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </CardFooter>
  </Card>
);

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Your Insurance Assistant</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Navigate to key sections of your application from here.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLinkCard
            title="GPT Collection"
            description="Explore and manage your organization's curated list of custom GPTs."
            href="/gpts"
            icon={BotMessageSquare}
            linkText="Go to Collection"
          />
          <QuickLinkCard
            title="Latest News"
            description="Stay updated with the latest headlines from across the insurance industry."
            href="/"
            icon={Newspaper}
            linkText="View News"
          />
          <QuickLinkCard
            title="Bookmarks & Notes"
            description="Save important links, articles, and research notes in one place."
            href="/bookmarks"
            icon={BookmarkIcon}
            linkText="Open Bookmarks"
          />
        </div>
      </div>
    </AppShell>
  );
}
