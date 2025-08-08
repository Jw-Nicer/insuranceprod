'use client';

import { AppShell } from '@/components/app-shell';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';

interface NewsItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  enclosure: object;
  categories: string[];
}

const RSS_URL = 'https://api.rss2json.com/v1/api.json?rss_url=https://www.insurancejournal.com/news/national/feed/';

// A simple regex to strip HTML tags
const stripHtml = (html: string) => {
    if(!html) return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
};

export default function InsuranceNewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getNews() {
        try {
            const response = await fetch(RSS_URL, {
                next: { revalidate: 86400 } // Revalidate once every 24 hours
            });

            if (!response.ok) {
              throw new Error('Failed to fetch news feed.');
            }

            const data = await response.json();

            if (data.status !== 'ok') {
              throw new Error('Failed to parse news feed.');
            }
            setNews(data.items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    }
    getNews();
  }, []);



  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
              <h1 className="text-3xl font-bold tracking-tight">Insurance News</h1>
              <p className="text-muted-foreground mt-1">
              The latest headlines from the insurance industry, updated daily.
              </p>
          </div>
      </div>
      
      {loading && <p>Loading news...</p>}

      {error && (
          <Card>
              <CardHeader>
                  <CardTitle className="text-destructive">Error</CardTitle>
                  <CardDescription>Could not load the news feed.</CardDescription>
              </CardHeader>
              <CardContent>
                  <p>{error}</p>
              </CardContent>
          </Card>
      )}

      {!error && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(news as NewsItem[]).map((item) => (
              <Card key={item.guid} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                      <CardTitle className="text-lg leading-snug">{item.title}</CardTitle>
                      <CardDescription className="pt-1">{formatDate(item.pubDate)}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                          {stripHtml(item.description)}
                      </p>
                  </CardContent>
                  <CardFooter>
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="w-full">
                          <Button variant="outline" className="w-full">
                              Read Full Article
                              <ArrowUpRight className="ml-2 h-4 w-4" />
                          </Button>
                      </a>
                  </CardFooter>
              </Card>
          ))}
          </div>
      )}
    </AppShell>
  );
}
