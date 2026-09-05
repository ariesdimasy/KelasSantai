import { useCallback, useEffect, useRef, useState } from 'react';
import { PackageOpen, Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductCard } from './ProductCard';
import { api } from '@/lib/api';
import type { Category, PaginationMeta, Product, ProductQuery } from '@/lib/types';

interface ProductBrowserProps {
  /** hasil render server — supaya konten produk sudah ada di HTML pertama (SEO) */
  initialProducts: Product[];
  initialMeta: PaginationMeta;
  initialQuery: Required<Pick<ProductQuery, 'keyword' | 'categoryId' | 'sort' | 'page'>>;
  categories: Category[];
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'price-asc', label: 'Harga termurah' },
  { value: 'price-desc', label: 'Harga termahal' },
  { value: 'name-asc', label: 'Nama A-Z' },
] as const;

const ALL_CATEGORIES = 'all';

export function ProductBrowser({
  initialProducts,
  initialMeta,
  initialQuery,
  categories,
}: ProductBrowserProps) {
  const [products, setProducts] = useState(initialProducts);
  const [meta, setMeta] = useState(initialMeta);
  const [query, setQuery] = useState(initialQuery);
  const [keywordDraft, setKeywordDraft] = useState(initialQuery.keyword);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** render pertama memakai data dari server; jangan fetch ulang percuma */
  const firstRender = useRef(true);

  const load = useCallback(async (next: typeof initialQuery) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.products.list({ ...next, limit: initialMeta.limit });
      setProducts(result.data);
      if (result.meta) setMeta(result.meta);
      if (result.warning) setError(result.warning);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  }, [initialMeta.limit]);

  // Debounce input pencarian: tunggu 350 ms setelah user berhenti mengetik
  useEffect(() => {
    if (keywordDraft === query.keyword) return;
    const timer = setTimeout(() => {
      setQuery((current) => ({ ...current, keyword: keywordDraft, page: 1 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [keywordDraft, query.keyword]);

  // Ambil data + sinkronkan URL setiap filter berubah, supaya bisa di-share/refresh
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const params = new URLSearchParams();
    if (query.keyword) params.set('keyword', query.keyword);
    if (query.categoryId) params.set('category_id', String(query.categoryId));
    if (query.sort !== 'newest') params.set('sort', query.sort);
    if (query.page > 1) params.set('page', String(query.page));

    const qs = params.toString();
    window.history.replaceState({}, '', qs ? `/?${qs}#produk` : '/');

    void load(query);
  }, [query, load]);

  const activeFilter = Boolean(query.keyword) || query.categoryId > 0 || query.sort !== 'newest';

  function resetFilter() {
    setKeywordDraft('');
    setQuery({ keyword: '', categoryId: 0, sort: 'newest', page: 1 });
  }

  return (
    <section id="produk" className="container-page scroll-mt-20 py-10">
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Katalog produk</h2>
            <p className="text-sm text-muted-foreground">
              {meta.total} produk tersedia
              {query.keyword && <> untuk “{query.keyword}”</>}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-muted-foreground" />
            <Select
              value={query.sort}
              onValueChange={(value) =>
                setQuery((current) => ({ ...current, sort: value as typeof current.sort, page: 1 }))
              }
            >
              <SelectTrigger className="w-44" aria-label="Urutkan produk">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={keywordDraft}
              onChange={(event) => setKeywordDraft(event.target.value)}
              placeholder="Cari nama produk, deskripsi, atau kategori…"
              aria-label="Cari produk"
              className="pl-9"
            />
            {keywordDraft && (
              <button
                type="button"
                onClick={() => setKeywordDraft('')}
                aria-label="Hapus kata kunci"
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <Select
            value={query.categoryId ? String(query.categoryId) : ALL_CATEGORIES}
            onValueChange={(value) =>
              setQuery((current) => ({
                ...current,
                categoryId: value === ALL_CATEGORIES ? 0 : Number(value),
                page: 1,
              }))
            }
          >
            <SelectTrigger className="sm:w-56" aria-label="Filter kategori">
              <SelectValue placeholder="Semua kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES}>Semua kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeFilter && (
            <Button variant="ghost" onClick={resetFilter}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="gap-3 py-0">
              <Skeleton className="aspect-4/3 rounded-b-none" />
              <div className="space-y-2 p-4 pt-0">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="grid place-items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <PackageOpen className="size-10 text-muted-foreground" />
          <p className="font-medium">Produk tidak ditemukan</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Coba kata kunci lain atau hapus filter kategori.
          </p>
          {activeFilter && (
            <Button variant="outline" onClick={resetFilter}>
              Tampilkan semua produk
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Navigasi halaman">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1 || loading}
            onClick={() => setQuery((current) => ({ ...current, page: current.page - 1 }))}
          >
            Sebelumnya
          </Button>

          <span className="px-2 text-sm text-muted-foreground">
            Halaman {meta.page} dari {meta.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= meta.totalPages || loading}
            onClick={() => setQuery((current) => ({ ...current, page: current.page + 1 }))}
          >
            Berikutnya
          </Button>
        </nav>
      )}
    </section>
  );
}
