import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={cn("h-6 w-6", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="16"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M40 88L128 40l88 48v64c0 35.5-27.4 65.4-62 77.9L128 216l-26-6.1c-34.6-12.5-62-42.4-62-77.9V88z" />
    </svg>
  );
}
