import { useState } from 'react';
import { LogOut, Menu, Store, User as UserIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { api } from '@/lib/api';
import { initials } from '@/lib/utils';
import type { SessionUser } from '@/lib/types';

interface DashboardTopbarProps {
  user: SessionUser;
  title: string;
  menu: Array<{ href: string; label: string }>;
  currentPath: string;
}

export function DashboardTopbar({ user, title, menu, currentPath }: DashboardTopbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await api.auth.signOut();
      window.location.href = '/signin';
    } catch (error) {
      setSigningOut(false);
      toast.error(error instanceof Error ? error.message : 'Gagal logout');
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 md:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Menu dashboard"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold">{title}</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Selamat bekerja, {user.name.split(' ')[0]}
          </p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge variant="secondary" className="hidden sm:inline-flex">
            role: {user.role}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Menu akun">
                <Avatar>
                  <AvatarFallback>{initials(user.name) || 'A'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/profile">
                  <UserIcon /> Profil
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/">
                  <Store /> Storefront
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                disabled={signingOut}
                onSelect={(event) => {
                  event.preventDefault();
                  void handleSignOut();
                }}
              >
                <LogOut /> {signingOut ? 'Keluar…' : 'Keluar'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t bg-background px-4 py-3 lg:hidden">
          {menu.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm ${
                currentPath === item.href ? 'bg-primary/10 font-medium text-primary' : 'hover:bg-accent'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
