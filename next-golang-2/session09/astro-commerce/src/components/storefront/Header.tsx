import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  User as UserIcon,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useHydrated } from '@/hooks/use-hydrated';
import { api } from '@/lib/api';
import { initials } from '@/lib/utils';
import type { SessionUser } from '@/lib/types';
import { selectTotalItems, useCartStore } from '@/stores/cart';
import { useSessionStore } from '@/stores/session';

interface HeaderProps {
  /** dikirim dari server (Astro.locals.user) — sumber kebenaran session */
  user: SessionUser | null;
  siteName: string;
  currentPath: string;
  /** kata kunci yang sedang aktif, untuk mengisi search bar */
  keyword?: string;
}

const NAV_LINKS = [
  { href: '/', label: 'Beranda' },
  { href: '/#produk', label: 'Produk' },
  { href: '/orders', label: 'Pesanan' },
];

export function Header({ user, siteName, currentPath, keyword = '' }: HeaderProps) {
  const hydrated = useHydrated();
  const totalItems = useCartStore(selectTotalItems);
  const syncSession = useSessionStore((state) => state.syncSession);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Samakan store React dengan session dari server (lihat src/stores/session.ts)
  useEffect(() => syncSession(user), [user, syncSession]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await api.auth.signOut();
      syncSession(null);
      window.location.href = '/';
    } catch (error) {
      setSigningOut(false);
      toast.error(error instanceof Error ? error.message : 'Gagal logout');
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-3">
        <a href="/" className="flex shrink-0 items-center gap-2 font-semibold">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Package className="size-5" />
          </span>
          <span className="hidden sm:inline">{siteName}</span>
        </a>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
                currentPath === link.href ? 'font-medium text-foreground' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Search bar: form GET biasa supaya hasil pencarian punya URL sendiri
            (bisa di-bookmark & di-index mesin pencari). */}
        <form action="/" method="get" className="relative ml-auto hidden max-w-xs flex-1 md:block">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            name="keyword"
            defaultValue={keyword}
            placeholder="Cari produk…"
            aria-label="Cari produk"
            className="pl-9"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button asChild variant="ghost" size="icon" className="relative" aria-label="Keranjang">
            <a href="/cart">
              <ShoppingCart className="size-5" />
              {hydrated && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </a>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu akun">
                  <Avatar>
                    <AvatarFallback>{initials(user.name) || 'U'}</AvatarFallback>
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
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <a href="/dashboard">
                      <LayoutDashboard /> Dashboard admin
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <a href="/home">
                    <Package /> Halaman saya
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/profile">
                    <UserIcon /> Profil
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
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <a href="/signin">Masuk</a>
              </Button>
              <Button asChild size="sm">
                <a href="/register">Daftar</a>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Buka menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t bg-background md:hidden">
          <div className="container-page flex flex-col gap-2 py-4">
            <form action="/" method="get" className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                name="keyword"
                defaultValue={keyword}
                placeholder="Cari produk…"
                className="pl-9"
              />
            </form>
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="rounded-md px-3 py-2 text-sm hover:bg-accent">
                {link.label}
              </a>
            ))}
            {!user && (
              <div className="flex gap-2 pt-2">
                <Button asChild variant="outline" className="flex-1">
                  <a href="/signin">Masuk</a>
                </Button>
                <Button asChild className="flex-1">
                  <a href="/register">Daftar</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
