import { type SubmitEvent, useState } from 'react';
import { CheckCircle2, CreditCard, Loader2, Truck, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Field } from '@/components/common/Field';
import { useHydrated } from '@/hooks/use-hydrated';
import { ApiError, api } from '@/lib/api';
import { checkoutSchema, fieldErrors } from '@/lib/schemas';
import { formatIDR } from '@/lib/utils';
import type { Order, SessionUser } from '@/lib/types';
import { selectSubtotal, useCartStore } from '@/stores/cart';

const FREE_SHIPPING_THRESHOLD = 500_000;
const SHIPPING_COST = 20_000;

const PAYMENT_METHODS = [
  { value: 'transfer', label: 'Transfer bank', description: 'Verifikasi otomatis (simulasi)', Icon: CreditCard },
  { value: 'ewallet', label: 'E-wallet', description: 'OVO / GoPay / Dana', Icon: Wallet },
  { value: 'cod', label: 'Bayar di tempat', description: 'Bayar saat barang tiba', Icon: Truck },
] as const;

interface CheckoutFormProps {
  user: SessionUser;
}

export function CheckoutForm({ user }: CheckoutFormProps) {
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore(selectSubtotal);
  const clear = useCartStore((state) => state.clear);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'ewallet' | 'cod'>('transfer');
  const [order, setOrder] = useState<Order | null>(null);

  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    const payload = {
      name: String(form.get('name') ?? ''),
      phone: String(form.get('phone') ?? ''),
      address: String(form.get('address') ?? ''),
      city: String(form.get('city') ?? ''),
      postalCode: String(form.get('postalCode') ?? ''),
      note: String(form.get('note') ?? ''),
      paymentMethod,
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    };

    // Validasi di browser dulu supaya error langsung terlihat tanpa request.
    const parsed = checkoutSchema.safeParse(payload);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      toast.error('Periksa kembali data pengiriman');
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      const result = await api.orders.create(parsed.data);
      clear();
      setOrder(result.data);
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setErrors(submitError.errors ?? {});
        toast.error(submitError.message);
      } else {
        toast.error('Checkout gagal, coba lagi');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (order) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <CardContent className="space-y-4 pt-2">
          <CheckCircle2 className="mx-auto size-12 text-success" />
          <div>
            <h2 className="text-xl font-semibold">Pesanan berhasil dibuat</h2>
            <p className="text-sm text-muted-foreground">
              Nomor pesanan <span className="font-medium text-foreground">{order.code}</span>
            </p>
          </div>

          <div className="space-y-2 rounded-lg border p-4 text-left text-sm">
            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  {item.name} × {item.quantity}
                </span>
                <span>{formatIDR(item.price * item.quantity)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{formatIDR(order.total)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild variant="outline">
              <a href="/#produk">Belanja lagi</a>
            </Button>
            <Button asChild>
              <a href="/orders">Lihat pesanan saya</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hydrated && items.length === 0) {
    return (
      <Card className="mx-auto max-w-md text-center">
        <CardContent className="space-y-4 pt-2">
          <p className="font-medium">Keranjang kosong</p>
          <p className="text-sm text-muted-foreground">
            Tambahkan produk dulu sebelum checkout.
          </p>
          <Button asChild>
            <a href="/#produk">Lihat produk</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Alamat pengiriman</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Nama penerima" error={errors.name} required>
              <Input id="name" name="name" defaultValue={user.name} autoComplete="name" />
            </Field>

            <Field id="phone" label="Nomor telepon" error={errors.phone} required>
              <Input id="phone" name="phone" placeholder="0812xxxxxxx" autoComplete="tel" />
            </Field>

            <Field id="address" label="Alamat lengkap" error={errors.address} required className="sm:col-span-2">
              <Textarea
                id="address"
                name="address"
                rows={3}
                placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                autoComplete="street-address"
              />
            </Field>

            <Field id="city" label="Kota / Kabupaten" error={errors.city} required>
              <Input id="city" name="city" autoComplete="address-level2" />
            </Field>

            <Field id="postalCode" label="Kode pos" error={errors.postalCode} required>
              <Input id="postalCode" name="postalCode" inputMode="numeric" maxLength={5} autoComplete="postal-code" />
            </Field>

            <Field
              id="note"
              label="Catatan (opsional)"
              error={errors.note}
              className="sm:col-span-2"
            >
              <Textarea id="note" name="note" rows={2} placeholder="Titip ke tetangga, warna, dll" />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metode pembayaran</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3">
            {PAYMENT_METHODS.map(({ value, label, description, Icon }) => (
              <label
                key={value}
                className={`flex cursor-pointer flex-col gap-1 rounded-lg border p-4 text-sm transition-colors ${
                  paymentMethod === value ? 'border-primary bg-primary/5' : 'hover:bg-accent'
                }`}
              >
                <span className="flex items-center gap-2 font-medium">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={value}
                    checked={paymentMethod === value}
                    onChange={() => setPaymentMethod(value)}
                    className="sr-only"
                  />
                  <Icon className="size-4" />
                  {label}
                </span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle>Ringkasan pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {item.name} × {item.quantity}
              </span>
              <span>{formatIDR(item.price * item.quantity)}</span>
            </div>
          ))}

          <Separator />

          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatIDR(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ongkir</span>
            <span>{shippingCost === 0 ? 'Gratis' : formatIDR(shippingCost)}</span>
          </div>

          <Separator />

          <div className="flex justify-between text-base font-semibold">
            <span>Total bayar</span>
            <span className="text-primary">{formatIDR(subtotal + shippingCost)}</span>
          </div>

          {errors.items && <p className="text-xs text-destructive">{errors.items}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={submitting || items.length === 0}>
            {submitting && <Loader2 className="animate-spin" />}
            {submitting ? 'Memproses…' : 'Buat pesanan'}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Total dihitung ulang di server berdasarkan harga terbaru.
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
