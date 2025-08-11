import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      className={cn("h-6 w-6", className)}
    >
      <rect width="256" height="256" fill="none" />
      <path
        d="M40,88.00005,128,40.00005l88,48v64.00012c0,35.50526-27.36212,65.35249-62.03119,77.90158L128,216.00005l-25.96881-6.0983c-34.66907-12.54909-62.03119-42.39632-62.03119-77.90158Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
      <path
        d="M164.4,120a32,32,0,0,1-52.8,22.4L104,134.4a32,32,0,0,1-52.8-22.4,32,32,0,0,1,64-22.4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="16"
      />
    </svg>
  );
}
