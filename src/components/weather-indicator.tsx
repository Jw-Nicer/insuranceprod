"use client";

import * as React from "react";
import {
  Sun,
  Moon,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Louisville, Kentucky
const LAT = 38.2527;
const LON = -85.7585;
const TZ = "America/Kentucky/Louisville";
const REFRESH_MS = 2 * 60 * 60 * 1000; // 2 hours

const API_URL =
  `https://api.open-meteo.com/v1/forecast` +
  `?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,weather_code,is_day` +
  `&hourly=temperature_2m,weather_code` +
  `&temperature_unit=fahrenheit` +
  `&timezone=${encodeURIComponent(TZ)}` +
  `&forecast_days=1`;

interface CurrentWeather {
  temp: number;
  code: number;
  isDay: boolean;
}

interface HourlyPoint {
  hour: number;
  temp: number;
  code: number;
}

interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyPoint[];
  fetchedAt: number;
}

interface WeatherStyle {
  label: string;
  icon: React.ElementType;
  tint: string;
  bg: string;
}

// WMO weather codes → label + lucide icon + tailwind tint + gradient backdrop
const WEATHER_MAP: Record<number, WeatherStyle> = {
  0:  { label: "Clear",          icon: Sun,            tint: "text-amber-400",  bg: "from-amber-500/20 via-orange-500/10 to-transparent" },
  1:  { label: "Mostly clear",   icon: Sun,            tint: "text-amber-400",  bg: "from-amber-500/15 via-yellow-500/10 to-transparent" },
  2:  { label: "Partly cloudy",  icon: CloudSun,       tint: "text-amber-300",  bg: "from-amber-400/15 via-sky-400/10 to-transparent" },
  3:  { label: "Overcast",       icon: Cloud,          tint: "text-slate-400",  bg: "from-slate-500/15 via-slate-400/5 to-transparent" },
  45: { label: "Fog",            icon: CloudFog,       tint: "text-slate-400",  bg: "from-slate-500/20 via-slate-300/10 to-transparent" },
  48: { label: "Rime fog",       icon: CloudFog,       tint: "text-slate-400",  bg: "from-slate-500/20 via-slate-300/10 to-transparent" },
  51: { label: "Light drizzle",  icon: CloudDrizzle,   tint: "text-blue-400",   bg: "from-blue-500/20 via-cyan-400/10 to-transparent" },
  53: { label: "Drizzle",        icon: CloudDrizzle,   tint: "text-blue-400",   bg: "from-blue-500/20 via-cyan-400/10 to-transparent" },
  55: { label: "Heavy drizzle",  icon: CloudDrizzle,   tint: "text-blue-500",   bg: "from-blue-500/25 via-cyan-400/10 to-transparent" },
  61: { label: "Light rain",     icon: CloudRain,      tint: "text-blue-400",   bg: "from-blue-500/25 via-cyan-400/10 to-transparent" },
  63: { label: "Rain",           icon: CloudRain,      tint: "text-blue-500",   bg: "from-blue-500/25 via-cyan-400/10 to-transparent" },
  65: { label: "Heavy rain",     icon: CloudRain,      tint: "text-blue-600",   bg: "from-blue-600/30 via-cyan-500/15 to-transparent" },
  71: { label: "Light snow",     icon: CloudSnow,      tint: "text-sky-300",    bg: "from-sky-400/20 via-cyan-300/10 to-transparent" },
  73: { label: "Snow",           icon: CloudSnow,      tint: "text-sky-400",    bg: "from-sky-400/25 via-cyan-300/10 to-transparent" },
  75: { label: "Heavy snow",     icon: CloudSnow,      tint: "text-sky-500",    bg: "from-sky-500/30 via-cyan-400/15 to-transparent" },
  77: { label: "Snow grains",    icon: CloudSnow,      tint: "text-sky-400",    bg: "from-sky-400/20 via-cyan-300/10 to-transparent" },
  80: { label: "Showers",        icon: CloudRain,      tint: "text-blue-400",   bg: "from-blue-500/20 via-cyan-400/10 to-transparent" },
  81: { label: "Showers",        icon: CloudRain,      tint: "text-blue-500",   bg: "from-blue-500/25 via-cyan-400/10 to-transparent" },
  82: { label: "Heavy showers",  icon: CloudRain,      tint: "text-blue-600",   bg: "from-blue-600/30 via-cyan-500/15 to-transparent" },
  85: { label: "Snow showers",   icon: CloudSnow,      tint: "text-sky-400",    bg: "from-sky-400/25 via-cyan-300/10 to-transparent" },
  86: { label: "Snow showers",   icon: CloudSnow,      tint: "text-sky-500",    bg: "from-sky-500/30 via-cyan-400/15 to-transparent" },
  95: { label: "Thunderstorm",   icon: CloudLightning, tint: "text-violet-400", bg: "from-violet-500/25 via-fuchsia-500/10 to-transparent" },
  96: { label: "Thunder + hail", icon: CloudLightning, tint: "text-violet-500", bg: "from-violet-600/30 via-fuchsia-500/10 to-transparent" },
  99: { label: "Thunder + hail", icon: CloudLightning, tint: "text-violet-500", bg: "from-violet-600/30 via-fuchsia-500/10 to-transparent" },
};

function styleFor(code: number, isDay = true): WeatherStyle {
  const cfg = WEATHER_MAP[code] ?? WEATHER_MAP[3];
  // Swap the sun for a moon at night on clear/mostly-clear codes
  if (!isDay && (code === 0 || code === 1)) {
    return { ...cfg, icon: Moon, tint: "text-indigo-300", bg: "from-indigo-500/20 via-violet-500/10 to-transparent" };
  }
  return cfg;
}

const TIME_POINTS: { hour: number; label: string }[] = [
  { hour: 8,  label: "8a"  },
  { hour: 14, label: "2p"  },
  { hour: 18, label: "6p"  },
  { hour: 22, label: "10p" },
];

async function fetchWeather(): Promise<WeatherData | null> {
  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();

    const current: CurrentWeather = {
      temp: Math.round(data.current?.temperature_2m ?? 0),
      code: Number(data.current?.weather_code ?? 3),
      isDay: data.current?.is_day === 1,
    };

    const times: string[] = data.hourly?.time ?? [];
    const temps: number[] = data.hourly?.temperature_2m ?? [];
    const codes: number[] = data.hourly?.weather_code ?? [];

    const hourly: HourlyPoint[] = TIME_POINTS.map(({ hour }) => {
      const idx = times.findIndex((t) => new Date(t).getHours() === hour);
      if (idx === -1) return { hour, temp: current.temp, code: current.code };
      return {
        hour,
        temp: Math.round(temps[idx] ?? current.temp),
        code: Number(codes[idx] ?? current.code),
      };
    });

    return { current, hourly, fetchedAt: Date.now() };
  } catch {
    return null;
  }
}

function useLouisvilleWeather() {
  const [data, setData] = React.useState<WeatherData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let alive = true;
    async function load() {
      const fresh = await fetchWeather();
      if (alive) {
        setData(fresh);
        setLoading(false);
      }
    }
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return { data, loading };
}

export function WeatherIndicator({ isCollapsed }: { isCollapsed: boolean }) {
  const { data, loading } = useLouisvilleWeather();

  if (loading || !data) {
    return (
      <div className={cn("p-2", isCollapsed && "flex justify-center")}>
        <div
          className={cn(
            "animate-pulse rounded-xl bg-muted/30",
            isCollapsed ? "h-10 w-10" : "h-[124px] w-full",
          )}
        />
      </div>
    );
  }

  const cur = styleFor(data.current.code, data.current.isDay);
  const CurIcon = cur.icon;

  if (isCollapsed) {
    return (
      <div className="p-2 flex justify-center">
        <div
          className={cn(
            "relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ring-1 ring-white/5",
            cur.bg,
          )}
          title={`Louisville, KY · ${data.current.temp}°F · ${cur.label}`}
        >
          <CurIcon className={cn("h-4 w-4", cur.tint)} />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-background px-1 py-px text-[8px] font-bold leading-none ring-1 ring-border">
            {data.current.temp}°
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2">
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-gradient-to-br p-3 ring-1 ring-white/5",
          cur.bg,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
            <MapPin className="h-2.5 w-2.5" />
            Louisville
          </div>
          <div className="flex items-center gap-1 text-[9px] text-muted-foreground/60">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            Live
          </div>
        </div>

        {/* Current */}
        <div className="mt-1.5 flex items-center gap-2.5">
          <CurIcon className={cn("h-8 w-8", cur.tint)} />
          <div className="leading-tight">
            <div className="text-xl font-bold tracking-tight">{data.current.temp}°F</div>
            <div className="text-[10px] text-muted-foreground/80">{cur.label}</div>
          </div>
        </div>

        {/* Time-of-day chips */}
        <div className="mt-3 grid grid-cols-4 gap-1">
          {data.hourly.map((h, i) => {
            const cfg = styleFor(h.code, h.hour >= 7 && h.hour < 20);
            const Icon = cfg.icon;
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-0.5 rounded-lg bg-background/40 px-1 py-1.5 ring-1 ring-white/5"
                title={`${TIME_POINTS[i].label}: ${h.temp}°F · ${cfg.label}`}
              >
                <span className="text-[9px] font-medium text-muted-foreground/70">
                  {TIME_POINTS[i].label}
                </span>
                <Icon className={cn("h-3 w-3", cfg.tint)} />
                <span className="text-[10px] font-bold tabular-nums">{h.temp}°</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
