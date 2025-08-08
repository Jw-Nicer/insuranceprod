import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={cn("h-6 w-6", className)}
    >
      <rect width="256" height="256" fill="none" />
      <line
        x1="96"
        y1="96"
        x2="160"
        y2="160"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="24"
      />
      <line
        x1="160"
        y1="96"
        x2="96"
        y2="160"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="24"
      />
      <path
        d="M168,40.7a96,96,0,1,1-80,0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="24"
      />
    </svg>
  );
}