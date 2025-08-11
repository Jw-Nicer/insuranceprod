
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
  GripVertical,
  Bot,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  fields: { name: "Name", description: "Description", url: "URL", recommendedModel: "Recommended Model" },
  placeholders: {
    name: "e.g. Content Summarizer",
    description: "A short description of what it does.",
    url: "https://chatgpt.com/g/...",
    search: "Search GPTs…",
    recommendedModel: "Select a model",
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
  { name: "Property", description: "A GPT for property insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682f3ba9bf488191888ac2594e45142f-property-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Auto", description: "A GPT for auto insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682e083b87088191a91d83422ea615c0-auto-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "General Liability", description: "A GPT for general liability insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682f1d81d58c81919f8d51c4b73337b7-general-liability-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Active Assailant", description: "A GPT for active assailant insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682e0a3774b48191801fd626744b7ef3-active-assailant-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Cyber", description: "A GPT for cyber insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682e02726ee4819188dbb126c478652b-cyber-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Marine", description: "A GPT for marine insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682e05b24304819182cdf66796b10461-marine-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Fine Arts", description: "A GPT for fine arts insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682dfb6cf5c0819191ca8a0d3fb0d1a0-fine-arts-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Kidnap and Ransom", description: "A GPT for kidnap and ransom insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682e024298508191ab2ce9f6b30e33fa-kidnap-and-ransom-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Pollution", description: "A GPT for pollution insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682f3d571f48819193934e0a47eec79d-pollution-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Primary Umbrella", description: "A GPT for primary umbrella insurance. Trained on Hartford data.", url: "https://chatgpt.com/g/g-682f43356c84819184355c85069c3c9e-primary-umbrella-insurance-gpt", recommendedModel: "GPT-4o" },
  { name: "Loss Run", description: "A GPT for loss run analysis. Trained on Hartford data.", url: "https://chatgpt.com/g/g-6865748e576081918fd4ac06b21696fd-loss-run-analyzer-2", recommendedModel: "GPT-4o" },
  { name: "GPT 4o", description: "A GPT for GPT 4o analysis. Trained on Hartford data.", url: "https://chatgpt.com/g/g-6865748e576081918fd4ac06b21696fd-loss-run-analyzer-3", recommendedModel: "GPT-4o" },
  { name: "GPT 5", description: "A GPT for GPT 5 analysis. Trained on Hartford data.", url: "https://chatgpt.com/g/g-6865748e576081918fd4ac06b21696fd-loss-run-analyzer-4", recommendedModel: "GPT-5" },
  { name: "GPT 5 Thinking", description: "A GPT for GPT 5 Thinking analysis. Trained on Hartford data.", url: "https://chatgpt.com/g/g-6865748e576081918fd4ac06b21696fd-loss-run-analyzer-5", recommendedModel: "GPT-5 Thinking" },
  { name: "GPT 5 Pro", description: "A GPT for GPT 5 Pro analysis. Trained on Hartford data.", url: "https://chatgpt.com/g/g-6865748e576081918fd4ac06b21696fd-loss-run-analyzer-6", recommendedModel: "GPT-5 Pro" },
];

const emptyGpt: Gpt = { name: "", description: "", url: "", recommendedModel: "" };

const recommendedModels = ["GPT-4", "GPT-4o", "GPT-4 Turbo", "GPT-5", "GPT-5 Thinking", "GPT-5 Pro"];

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
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="recommendedModel" className="text-right">{L.fields.recommendedModel}</Label>
          <Select value={activeGpt.recommendedModel || ""} onValueChange={(value) => setActiveGpt({ ...activeGpt, recommendedModel: value })}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder={L.placeholders.recommendedModel} />
            </SelectTrigger>
            <SelectContent>
              {recommendedModels.map((model) => (
                <SelectItem key={model} value={model}>{model}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
  isDraggable: boolean;
}> = ({ gpt, index, onEdit, onDelete, isDraggable }) => {
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
    <Card className="flex flex-col hover:shadow-lg transition-shadow duration-300 relative">
      <CardHeader className="flex-grow">
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
        <CardDescription className="pt-1 text-xs line-clamp-2 h-9">{gpt.description}</CardDescription>
        {gpt.recommendedModel && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <Bot className="h-4 w-4" />
            <span>{gpt.recommendedModel}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Content can be added here if needed */}
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

// Function to move an item in an array
function moveItem<T>(array: T[], from: number, to: number): T[] {
    const newArray = [...array];
    const [item] = newArray.splice(from, 1);
    newArray.splice(to, 0, item);
    return newArray;
}

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
  const [isDragging, setIsDragging] = React.useState(false);
  
  const dragItem = React.useRef<number | null>(null);
  const dragOverItem = React.useRef<number | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const filteredGpts = React.useMemo(() => gpts.filter(gpt =>
    gpt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    gpt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (gpt.recommendedModel || "").toLowerCase().includes(searchQuery.toLowerCase())
  ), [gpts, searchQuery]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragItem.current = position;
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, position: number) => {
    dragOverItem.current = position;
  };
  
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
        setIsDragging(false);
        return;
    }

    if (!searchQuery) {
        const reorderedGpts = moveItem(gpts, dragItem.current, dragOverItem.current);
        setGpts(reorderedGpts);
    } else {
        const draggedItem = filteredGpts[dragItem.current];
        const overItem = filteredGpts[dragOverItem.current];
        
        if (!draggedItem || !overItem) return;

        const originalDraggedIndex = gpts.findIndex(g => g.name === draggedItem.name && g.url === draggedItem.url);
        const originalOverIndex = gpts.findIndex(g => g.name === overItem.name && g.url === overItem.url);
        
        if (originalDraggedIndex === -1 || originalOverIndex === -1) return;
        
        const reorderedGpts = moveItem(gpts, originalDraggedIndex, originalOverIndex);
        setGpts(reorderedGpts);
    }
    
    dragItem.current = null;
    dragOverItem.current = null;
    setIsDragging(false);
  };

  const openAddDialog = () => {
    setEditingIndex(null);
    setActiveGpt(emptyGpt);
    setIsDialogOpen(true);
  };

  const openEditDialog = (index: number) => {
    const gptToEdit = filteredGpts[index];
    const originalIndex = gpts.findIndex(g => g.name === gptToEdit.name && g.url === gptToEdit.url);
    if (originalIndex !== -1) {
      setEditingIndex(originalIndex);
      setActiveGpt(gpts[originalIndex]);
      setIsDialogOpen(true);
    }
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
    const gptToDelete = filteredGpts[index];
    const originalIndex = gpts.findIndex(g => g.name === gptToDelete.name && g.url === gptToDelete.url);
    if (originalIndex !== -1) {
        setDeletingIndex(originalIndex);
    }
  }

  const confirmDelete = () => {
    if (deletingIndex !== null) {
      setGpts(gpts.filter((_, i) => i !== deletingIndex));
      setDeletingIndex(null);
    }
  };

  const isDraggable = !searchQuery;

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
                ) : gpts.length > 0 ? (
                     <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredGpts.map((gpt, index) => (
                           <motion.div
                                key={gpt.url}
                                layout
                                draggable={isDraggable}
                                onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, index)}
                                onDragEnter={(e) => handleDragEnter(e as unknown as React.DragEvent<HTMLDivElement>, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                className={`cursor-grab active:cursor-grabbing transition-opacity duration-300 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
                            >
                                <GptCard gpt={gpt} index={index} onEdit={openEditDialog} onDelete={startDelete} isDraggable={isDraggable} />
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
