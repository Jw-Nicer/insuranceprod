
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PlusCircle, ArrowUpRight, Sheet, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { AppShell } from '@/components/app-shell';
import type { Gpt } from '@/types';

const initialGpts: Gpt[] = [
  {
    name: 'Property',
    description: 'A GPT for property insurance. Trained on Hartford data.',
    url: 'https://chatgpt.com/g/g-682f3ba9bf488191888ac2594e45142f-property-insurance-gpt',
  },
  {
    name: 'Active Assailant',
    description: 'A GPT for active assailant insurance. Trained on Hartford data.',
    url: 'https://chatgpt.com/g/g-682e0a3774b48191801fd626744b7ef3-active-assailant-insurance-gpt',
  },
  {
    name: 'Cyber',
    description: 'A GPT for cyber insurance. Trained on Hartford data.',
    url: 'https://chatgpt.com/g/g-682e02726ee4819188dbb126c478652b-cyber-insurance-gpt',
  },
  {
    name: 'Marine',
    description: 'A GPT for marine insurance. Trained on Hartford data.',
    url: 'https://chatgpt.com/g/g-682e05b24304819182cdf66796b10461-marine-insurance-gpt',
  },
  {
    name: 'Auto',
    description: 'A GPT for auto insurance. Trained on Hartford data.',
    url: 'https://chatgpt.com/g/g-682e083b87088191a91d83422ea615c0-auto-insurance-gpt',
  },
  {
    name: 'Fine Arts',
    description: 'A GPT for fine arts insurance. Trained on Hartford data.',
    url: 'https://chatgpt.com/g/g-682dfb6cf5c0819191ca8a0d3fb0d1a0-fine-arts-insurance-gpt',
  },
  {
    name: 'General Liability',
    description: 'A GPT for general liability insurance. Trained on Hartford data.',
    url: 'https://chatgpt.com/g/g-682f1d81d58c81919f8d51c4b73337b7-general-liability-insurance-gpt',
  },
  {
    name: 'Kidnap and Ransom',
    description: 'A GPT for kidnap and ransom insurance. Trained on Hartford data.',
    url: 'https://chatgpt.com/g/g-682e024298508191ab2ce9f6b30e33fa-kidnap-and-ransom-insurance-gpt',
  },
  {
    name: 'Pollution',
    description: 'A GPT for pollution insurance. Trained on Hartford data.',
    url: 'https://chatgpt.com/g/g-682f3d571f48819193934e0a47eec79d-pollution-insurance-gpt',
  },
  {
    name: 'Primary Umbrella',
    description: 'A GPT for primary umbrella insurance. Trained on Hartford data.',
    url: 'https://chatgpt.com/g/g-682f43356c84819184355c85069c3c9e-primary-umbrella-insurance-gpt',
  },
  {
    name: 'Loss Run',
    description: 'A GPT for loss run analysis. Trained on Hartford data.',
    url: 'https://chatgpt.com/g/g-6865748e576081918fd4ac06b21696fd-loss-run-analyzer-2',
  },
];

const emptyGpt: Gpt = { name: '', description: '', url: '' };

export default function GptsPage() {
  const [gpts, setGpts] = useState<Gpt[]>(initialGpts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeGpt, setActiveGpt] = useState<Gpt>(emptyGpt);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const openAddDialog = () => {
    setEditingIndex(null);
    setActiveGpt(emptyGpt);
    setIsDialogOpen(true);
  };

  const openEditDialog = (index: number) => {
    setEditingIndex(index);
    setActiveGpt(gpts[index]);
    setIsDialogOpen(true);
  };

  const handleSaveGpt = () => {
    if (activeGpt.name && activeGpt.url) {
      const updatedGpts = [...gpts];
      if (editingIndex !== null) {
        updatedGpts[editingIndex] = activeGpt;
      } else {
        updatedGpts.push(activeGpt);
      }
      setGpts(updatedGpts);
      setIsDialogOpen(false);
    }
  };

  const handleDeleteGpt = () => {
    if (deletingIndex !== null) {
      setGpts(gpts.filter((_, i) => i !== deletingIndex));
      setDeletingIndex(null);
    }
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight">
            GPT Collection
          </h1>
          <p className="text-muted-foreground mt-1">
            A curated list of helpful GPTs for your organization.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://erauk-my.sharepoint.com/:x:/r/personal/jnicer_eragroup_com/Documents/Enhance%20Insurance%20GPTs/Insurance%20GPTs%20Development%20Tracker.xlsx?d=wa227041a57f44de6b5803d6a484ce7e6&csf=1&web=1&e=yBiWLE"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline">
              <Sheet className="mr-2 h-4 w-4" />
              Development Tracker
            </Button>
          </a>
          <Button onClick={openAddDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add GPT
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {gpts.map((gpt, index) => (
          <Card
            key={index}
            className="flex flex-col hover:shadow-lg transition-shadow duration-300"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{gpt.name}</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(index)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeletingIndex(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this GPT from the collection.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeletingIndex(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteGpt}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <CardDescription className="h-10 pt-1">
                {gpt.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow"></CardContent>
            <CardFooter>
              <a
                href={gpt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="outline" className="w-full">
                  Open GPT
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit GPT' : 'Add New GPT'}</DialogTitle>
            <DialogDescription>
              {editingIndex !== null ? 'Update the details for this GPT.' : 'Enter the details for the new GPT you want to add.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={activeGpt.name}
                onChange={(e) =>
                  setActiveGpt({ ...activeGpt, name: e.target.value })
                }
                className="col-span-3"
                placeholder="e.g. Content Summarizer"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={activeGpt.description}
                onChange={(e) =>
                  setActiveGpt({ ...activeGpt, description: e.target.value })
                }
                className="col-span-3"
                placeholder="A short description of what it does."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                value={activeGpt.url}
                onChange={(e) =>
                  setActiveGpt({ ...activeGpt, url: e.target.value })
                }
                className="col-span-3"
                placeholder="https://chat.openai.com/g/..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSaveGpt}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

    