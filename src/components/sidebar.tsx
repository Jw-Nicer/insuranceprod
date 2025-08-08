import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuBadge,
} from '@/components/ui/sidebar';
import {
  Bot,
  Calculator,
  FileText,
  Heart,
  LayoutGrid,
  Newspaper,
  PieChart,
  ShieldCheck,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground font-bold rounded-md p-2 flex items-center justify-center text-lg">
                IA
            </div>
            <h2 className="text-lg font-semibold text-sidebar-foreground">
                InsuranceAssist
            </h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ANALYSIS</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/" passHref>
                <SidebarMenuButton isActive={pathname === '/'}>
                  <LayoutGrid />
                  Dashboard
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/loss-run-metrics" passHref>
                <SidebarMenuButton isActive={pathname === '/loss-run-metrics'}>
                  <PieChart />
                  Metrics
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>TOOLS</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
               <Link href="/loss-run" passHref>
                <SidebarMenuButton isActive={pathname === '/loss-run'}>
                  <FileText />
                  Loss Run
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <ShieldCheck />
                Viability Assessment
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Calculator />
                Insurance Calculator
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton>
                <Bot />
                GPT Collection
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton>
                <User />
                Professional Liability
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton>
                <Heart />
                Health Insurance
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>INSURANCE NEWS</SidebarGroupLabel>
           <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Newspaper />
                Latest News
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </>
  );
}
