import * as React from "react";

const KEY = "user-profile";
const EVENT = "profile-changed";

export interface UserProfile {
  name: string;
  role: string;
  avatarDataUrl?: string;
}

export const DEFAULT_PROFILE: UserProfile = { name: "Paula", role: "Insurance Pro" };

export function getProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: UserProfile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
    window.dispatchEvent(new CustomEvent(EVENT, { detail: profile }));
  } catch {
    // ignore
  }
}

export function useProfile(): [UserProfile, (p: UserProfile) => void] {
  const [profile, setLocal] = React.useState<UserProfile>(DEFAULT_PROFILE);

  React.useEffect(() => {
    setLocal(getProfile());
    const handler = (e: Event) => {
      const ce = e as CustomEvent<UserProfile>;
      if (ce.detail) setLocal(ce.detail);
    };
    window.addEventListener(EVENT, handler);
    return () => window.removeEventListener(EVENT, handler);
  }, []);

  return [
    profile,
    (p: UserProfile) => {
      saveProfile(p);
      setLocal(p);
    },
  ];
}

export function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((s) => s[0]?.toUpperCase())
      .filter(Boolean)
      .slice(0, 2)
      .join("") || "?"
  );
}
