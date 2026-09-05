import { ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AddToCartButton } from './AddToCartButton';
import { formatIDR, truncate } from '@/lib/utils';
import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const href = `/products/${product.id}`;

  return (
    <Card className="group gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
      <a href={href} className="block aspect-4/3 overflow-hidden bg-muted" aria-label={product.name}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            width={480}
            height={360}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground">
            <ImageIcon className="size-10" />
          </div>
        )}
      </a>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          {product.category && (
            <Badge variant="secondary" className="shrink-0">
              {product.category.name}
            </Badge>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge variant="outline" className="shrink-0 text-amber-600">
              sisa {product.stock}
            </Badge>
          )}
          {product.stock <= 0 && (
            <Badge variant="destructive" className="shrink-0">
              habis
            </Badge>
          )}
        </div>

        <h3 className="leading-snug font-medium">
          <a href={href} className="hover:text-primary hover:underline">
            {product.name}
          </a>
        </h3>

        <p className="text-sm text-muted-foreground">{truncate(product.description, 70)}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="font-semibold text-primary">{formatIDR(product.price)}</span>
          <AddToCartButton product={product} />
        </div>
      </div>
    </Card>
  );
}
