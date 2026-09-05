import { ImageIcon, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useHydrated } from '@/hooks/use-hydrated';
import { formatIDR } from '@/lib/utils';
import type { SessionUser } from '@/lib/types';
import { selectSubtotal, useCartStore } from '@/stores/cart';

/** Harus sama dengan aturan di src/lib/server/orders.ts */
const FREE_SHIPPING_THRESHOLD = 500_000;
const SHIPPING_COST = 20_000;

interface CartViewProps {
  user: SessionUser | null;
}

export function CartView({ user }: CartViewProps) {
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore(selectSubtotal);
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);

  // Sebelum hydration, isi localStorage belum diketahui -> tampilkan skeleton
  if (!hydrated) {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="grid place-items-center gap-3 rounded-xl border border-dashed py-20 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" />
        <p className="font-medium">Keranjang masih kosong</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Yuk pilih produk dulu, nanti muncul di sini.
        </p>
        <Button asChild>
          <a href="/#produk">Mulai belanja</a>
        </Button>
      </div>
    );
  }

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const checkoutHref = user ? '/checkout' : '/signin?redirect=%2Fcheckout';

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.productId} className="gap-0 py-4">
            <CardContent className="flex gap-4">
              <a
                href={`/products/${item.productId}`}
                className="size-20 shrink-0 overflow-hidden rounded-md bg-muted"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center text-muted-foreground">
                    <ImageIcon className="size-6" />
                  </div>
                )}
              </a>

              <div className="min-w-0 flex-1">
                <a
                  href={`/products/${item.productId}`}
                  className="font-medium hover:text-primary hover:underline"
                >
                  {item.name}
                </a>
                <p className="text-sm text-muted-foreground">{formatIDR(item.price)} / item</p>

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center rounded-md border">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Kurangi ${item.name}`}
                      onClick={() => decrement(item.productId)}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-9 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Tambah ${item.name}`}
                      disabled={item.quantity >= item.stock}
                      onClick={() => increment(item.productId)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove(item.productId)}
                  >
                    <Trash2 /> Hapus
                  </Button>
                </div>

                {item.quantity >= item.stock && (
                  <p className="mt-2 text-xs text-amber-600">
                    Jumlah sudah mencapai stok tersedia ({item.stock})
                  </p>
                )}
              </div>

              <div className="shrink-0 text-right font-semibold">
                {formatIDR(item.price * item.quantity)}
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground">
          <Trash2 /> Kosongkan keranjang
        </Button>
      </div>

      <Card className="lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatIDR(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ongkir</span>
            <span>{shippingCost === 0 ? 'Gratis' : formatIDR(shippingCost)}</span>
          </div>

          {shippingCost > 0 && (
            <p className="rounded-md bg-muted p-2 text-xs text-muted-foreground">
              Belanja {formatIDR(FREE_SHIPPING_THRESHOLD - subtotal)} lagi untuk gratis ongkir.
            </p>
          )}

          <Separator />

          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span className="text-primary">{formatIDR(subtotal + shippingCost)}</span>
          </div>

          <Button asChild size="lg" className="w-full">
            <a href={checkoutHref}>{user ? 'Lanjut checkout' : 'Masuk untuk checkout'}</a>
          </Button>

          {!user && (
            <p className="text-center text-xs text-muted-foreground">
              Keranjang tetap tersimpan setelah Anda login.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
