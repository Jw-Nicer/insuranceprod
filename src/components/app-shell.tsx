'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BotMessageSquare,
  Calculator,
  FileText,
  HeartPulse,
  LayoutDashboard,
  LifeBuoy,
  Newspaper,
  Scale,
  ShieldCheck,
  BarChart2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  isLive?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: 'Analysis',
    items: [
      {
        href: '/',
        label: 'Dashboard',
        icon: LayoutDashboard,
        isLive: true,
      },
      {
        href: '/loss-run-metrics',
        label: 'Metrics',
        icon: BarChart2,
        isLive: true,
      },
      {
        href: '/benchmarking',
        label: 'Benchmarking',
        icon: Scale,
      },
    ],
  },
  {
    title: 'Tools',
    items: [
      {
        href: '/loss-run',
        label: 'Loss Run',
        icon: FileText,
        isLive: true,
      },
      {
        href: '/viability-assessment',
        label: 'Viability Assessment',
        icon: ShieldCheck,
      },
      {
        href: '/insurance-calculator',
        label: 'Insurance Calculator',
        icon: Calculator,
      },
      {
        href: '/gpts',
        label: 'GPT Collection',
        icon: BotMessageSquare,
      },
      {
        href: '/professional-liability',
        label: 'Professional Liability',
        icon: LifeBuoy,
      },
      {
        href: '/health-insurance',
        label: 'Health Insurance',
        icon: HeartPulse,
      },
    ],
  },
  {
    title: 'Insurance News',
    items: [
      {
        href: '/insurance-news',
        label: 'Latest News',
        icon: Newspaper,
        isLive: true,
      },
    ],
  },
];

const NavLink = ({ item, pathname }: { item: NavItem; pathname: string }) => {
  const content = (
    <Button
      variant={pathname === item.href ? 'secondary' : 'ghost'}
      className="w-full justify-start"
      disabled={!item.isLive}
    >
      <item.icon className="mr-3 h-5 w-5" />
      <span className="flex-1 text-left">{item.label}</span>
    </Button>
  );

  if (!item.isLive) {
    return (
      <div className="cursor-not-allowed" title="Coming soon">
        {content}
      </div>
    );
  }

  return <Link href={item.href}>{content}</Link>;
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full">
      <aside className="hidden w-64 flex-col border-r bg-card p-4 sm:flex">
        <div className="flex items-center gap-3 mb-8">
          <Logo className="h-10 w-10" />
          <span className="text-xl font-bold text-foreground">InsuranceAssist</span>
        </div>
        <nav className="flex flex-col gap-4">
          {navigation.map((group) => (
            <div key={group.title}>
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.title}
              </h3>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <NavLink key={item.href} item={item} pathname={pathname} />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}