import { useState } from 'react';
import { Check, Minus, Plus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useHydrated } from '@/hooks/use-hydrated';
import type { Product } from '@/lib/types';
import { selectItemQuantity, useCartStore } from '@/stores/cart';

interface AddToCartButtonProps {
  product: Product;
  /** "detail" menampilkan pemilih jumlah, "card" hanya tombol tambah */
  layout?: 'card' | 'detail';
  className?: string;
}

export function AddToCartButton({ product, layout = 'card', className }: AddToCartButtonProps) {
  const hydrated = useHydrated();
  const add = useCartStore((state) => state.add);
  const inCart = useCartStore(selectItemQuantity(product.id));
  const [quantity, setQuantity] = useState(1);

  const soldOut = product.stock <= 0 || !product.isActive;
  const maxReached = hydrated && inCart >= product.stock;

  function handleAdd() {
    add(product, layout === 'detail' ? quantity : 1);
    toast.success(`${product.name} masuk keranjang`, {
      action: { label: 'Lihat keranjang', onClick: () => (window.location.href = '/cart') },
    });
  }

  if (soldOut) {
    return (
      <Button disabled variant="secondary" className={className}>
        Stok habis
      </Button>
    );
  }

  if (layout === 'card') {
    return (
      <Button onClick={handleAdd} disabled={maxReached} className={className} size="sm">
        {maxReached ? <Check /> : <ShoppingCart />}
        {maxReached ? 'Maksimal stok' : 'Tambah'}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-md border">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Kurangi jumlah"
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          disabled={quantity <= 1}
        >
          <Minus className="size-4" />
        </Button>
        <span aria-live="polite" className="w-10 text-center text-sm font-medium">
          {quantity}
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Tambah jumlah"
          onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
          disabled={quantity >= product.stock}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <Button onClick={handleAdd} size="lg" disabled={maxReached}>
        <ShoppingCart />
        Masukkan keranjang
      </Button>

      {hydrated && inCart > 0 && (
        <span className="text-sm text-muted-foreground">{inCart} sudah di keranjang</span>
      )}
    </div>
  );
}
