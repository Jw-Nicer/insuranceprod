
"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  ArrowUpRight,
  Sheet as SheetIcon,
  Pencil,
  Trash2,
  Search,
  MoreHorizontal,
  ExternalLink,
  Copy as CopyIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/app-shell";
import type { Gpt } from "@/types";
import { useLocalStorage } from "@/hooks/use-local-storage";

/************************************
 * Labels (i18n-ready)
 ************************************/
const L = {
  title: "GPT Collection",
  subtitle: "A curated list of helpful GPTs for your organization.",
  tracker: "Development Tracker",
  add: "Add GPT",
  edit: "Edit GPT",
  addNew: "Add New GPT",
  updateDetails: "Update the details for this GPT.",
  enterDetails: "Enter details for the new GPT you want to add.",
  fields: { name: "Name", description: "Description", url: "URL" },
  placeholders: {
    name: "e.g. Content Summarizer",
    description: "A short description of what it does.",
    url: "https://chatgpt.com/g/...",
    search: "Search GPTs…",
  },
  actions: { cancel: "Cancel", save: "Save", open: "Open GPT", edit: "Edit", delete: "Delete", copyLink: "Copy link" },
  confirmDeleteTitle: "Delete GPT?",
  confirmDeleteDesc: "This action cannot be undone and will remove this GPT from the collection.",
  badges: { curated: "Curated", external: "External" },
  empty: { title: "No GPTs yet", desc: "Add your first GPT to get started.", cta: "Create GPT" },
  count: (n: number) => `${n} item${n === 1 ? "" : "s"}`,
  copied: "Link copied!",
};

/************************************
 * Seed data
 ************************************/
const initialGpts: Gpt[] = [
  { name: "Property", description: "A GPT for property insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682f3ba9bf488191888ac2594e45142f-property-insurance-gpt" },
  { name: "Auto", description: "A GPT for auto insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682e083b87088191a91d83422ea615c0-auto-insurance-gpt" },
  { name: "General Liability", description: "A GPT for general liability insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682f1d81d58c81919f8d51c4b73337b7-general-liability-insurance-gpt" },
  { name: "Active Assailant", description: "A GPT for active assailant insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682e0a3774b48191801fd626744b7ef3-active-assailant-insurance-gpt" },
  { name: "Cyber", description: "A GPT for cyber insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682e02726ee4819188dbb126c478652b-cyber-insurance-gpt" },
  { name: "Marine", description: "A GPT for marine insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682e05b24304819182cdf66796b10461-marine-insurance-gpt" },
  { name: "Fine Arts", description: "A GPT for fine arts insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682dfb6cf5c0819191ca8a0d3fb0d1a0-fine-arts-insurance-gpt" },
  { name: "Kidnap and Ransom", description: "A GPT for kidnap and ransom insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682e024298508191ab2ce9f6b30e33fa-kidnap-and-ransom-insurance-gpt" },
  { name: "Pollution", description: "A GPT for pollution insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682f3d571f48819193934e0a47eec79d-pollution-insurance-gpt" },
  { name: "Primary Umbrella", description: "A GPT for primary umbrella insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682f43356c84819184355c85069c3c9e-primary-umbrella-insurance-gpt" },
  { name: "Loss Run", description: "A GPT for loss run analysis. Trained on Hartford data.", url: "https://chatgpt.com/g/g-6865748e576081918fd4ac06b21696fd-loss-run-analyzer-2" },
];

const emptyGpt: Gpt = { name: "", description: "", url: "" };

/************************************
 * GPT Dialog
 ************************************/
const GptDialog: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeGpt: Gpt;
  setActiveGpt: (gpt: Gpt) => void;
  onSave: () => void;
  editingIndex: number | null;
}> = ({ isOpen, onOpenChange, activeGpt, setActiveGpt, onSave, editingIndex }) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{editingIndex !== null ? L.edit : L.addNew}</DialogTitle>
        <DialogDescription>
          {editingIndex !== null ? L.updateDetails : L.enterDetails}
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">{L.fields.name}</Label>
          <Input id="name" value={activeGpt.name} onChange={(e) => setActiveGpt({ ...activeGpt, name: e.target.value })} className="col-span-3" placeholder={L.placeholders.name} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">{L.fields.description}</Label>
          <Textarea id="description" value={activeGpt.description} onChange={(e) => setActiveGpt({ ...activeGpt, description: e.target.value })} className="col-span-3" placeholder={L.placeholders.description} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="url" className="text-right">{L.fields.url}</Label>
          <Input id="url" value={activeGpt.url} onChange={(e) => setActiveGpt({ ...activeGpt, url: e.target.value })} className="col-span-3" placeholder={L.placeholders.url} />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild><Button type="button" variant="secondary">{L.actions.cancel}</Button></DialogClose>
        <Button onClick={onSave}>{L.actions.save}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

/************************************
 * GPT Card
 ************************************/
const GptCard: React.FC<{
  gpt: Gpt;
  index: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
}> = ({ gpt, index, onEdit, onDelete }) => {
  const { toast } = useToast();

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(gpt.url);
      toast({ title: L.copied });
    } catch (err) {
      toast({ variant: "destructive", title: "Copy failed", description: "Could not copy the link." });
    }
  };

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-base font-semibold">{gpt.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(index)}><Pencil className="mr-2 h-4 w-4" /> {L.actions.edit}</DropdownMenuItem>
              <DropdownMenuItem onClick={copyUrl}><CopyIcon className="mr-2 h-4 w-4" /> {L.actions.copyLink}</DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(index)}>
                  <Trash2 className="mr-2 h-4 w-4" /> {L.actions.delete}
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="h-10 pt-1 text-xs">{gpt.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex gap-2">
          <Badge variant="outline">{L.badges.curated}</Badge>
          <Badge variant="outline">{L.badges.external}</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <a href={gpt.url} target="_blank" rel="noopener noreferrer">
            {L.actions.open} <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};


/************************************
 * Empty State
 ************************************/
const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
    <div className="text-center py-20">
      <h2 className="text-xl font-semibold mb-2">{L.empty.title}</h2>
      <p className="text-muted-foreground mb-4">{L.empty.desc}</p>
      <Button onClick={onAdd}>
        <PlusCircle className="mr-2 h-4 w-4" /> {L.empty.cta}
      </Button>
    </div>
);

/************************************
 * Main Page
 ************************************/
export default function GptsPage() {
  const [gpts, setGpts] = useLocalStorage<Gpt[]>("gpts:list", initialGpts);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [activeGpt, setActiveGpt] = React.useState<Gpt>(emptyGpt);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = React.useState<number | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const filteredGpts = gpts.filter(gpt =>
    gpt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gpt.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddDialog = () => {
    setEditingIndex(null);
    setActiveGpt(emptyGpt);
    setIsDialogOpen(true);
  };

  const openEditDialog = (index: number) => {
    const originalIndex = gpts.findIndex(g => g.name === filteredGpts[index].name);
    setEditingIndex(originalIndex);
    setActiveGpt(gpts[originalIndex]);
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

  const startDelete = (index: number) => {
     const originalIndex = gpts.findIndex(g => g.name === filteredGpts[index].name);
    setDeletingIndex(originalIndex);
  }

  const confirmDelete = () => {
    if (deletingIndex !== null) {
      setGpts(gpts.filter((_, i) => i !== deletingIndex));
      setDeletingIndex(null);
    }
  };

  return (
    <AppShell>
      <TooltipProvider>
        <div className="flex flex-col h-full">
            {/* Header */}
            <header className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight">{L.title}</h1>
                <p className="text-muted-foreground mt-1 text-sm">{L.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                <Button variant="outline" asChild>
                    <a href="https://erauk-my.sharepoint.com/:x:/r/personal/jnicer_eragroup_com/Documents/Enhance%20Insurance%20GPTs/Insurance%20GPTs%20Development%20Tracker.xlsx?d=wa227041a57f44de6b5803d6a484ce7e6&csf=1&web=1&e=yBiWLE" target="_blank" rel="noopener noreferrer">
                        <SheetIcon className="mr-2 h-4 w-4" /> {L.tracker}
                    </a>
                </Button>
                <Button onClick={openAddDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" /> {L.add}
                </Button>
                </div>
            </header>
            
            {/* Search & Meta */}
            <div className="flex items-center justify-between mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder={L.placeholders.search} className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="text-sm text-muted-foreground pr-2">
                    {L.count(filteredGpts.length)}
                </div>
            </div>

            <Separator className="mb-6" />

            {/* Grid */}
            <div className="flex-1">
            <AlertDialog>
                <AnimatePresence>
                {!mounted ? (
                  <p className="py-12 text-center text-gray-500">Loading...</p>
                ) : filteredGpts.length > 0 ? (
                    <motion.div 
                        layout 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                    {filteredGpts.map((gpt, index) => (
                        <motion.div layout key={gpt.name}>
                            <GptCard gpt={gpt} index={index} onEdit={openEditDialog} onDelete={startDelete} />
                        </motion.div>
                    ))}
                    </motion.div>
                ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <EmptyState onAdd={openAddDialog} />
                    </motion.div>
                )}
                </AnimatePresence>

                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>{L.confirmDeleteTitle}</AlertDialogTitle>
                    <AlertDialogDescription>{L.confirmDeleteDesc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setDeletingIndex(null)}>{L.actions.cancel}</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete}>{L.actions.delete}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </div>
        </div>

        {/* Dialogs */}
        <GptDialog 
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            activeGpt={activeGpt}
            setActiveGpt={setActiveGpt}
            onSave={handleSaveGpt}
            editingIndex={editingIndex}
        />
      </TooltipProvider>
    </AppShell>
  );
}

    