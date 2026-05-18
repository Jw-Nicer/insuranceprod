"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/profile";

// Renders the user's uploaded photo when available, otherwise their initials
// in a gradient circle. Pass `square` for a rounded-lg square (sidebar), or
// leave it off for a rounded-lg pill (topbar) — both are squared rectangles
// here since the avatars in this app are not circular.

export function AvatarWithImage({
  name,
  src,
  size = 32,
  textSize = "text-[11px]",
  className,
}: {
  name: string;
  src?: string;
  size?: number;
  textSize?: string;
  className?: string;
}) {
  if (src) {
    return (
      <span
        className={cn(
          "relative block shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10 shadow-md shadow-primary/20",
          className,
        )}
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-600 text-white font-bold shadow-md shadow-primary/20 ring-1 ring-white/10",
        textSize,
        className,
      )}
      style={{ width: size, height: size }}
    >
      {initials(name)}
    </span>
  );
}
