/**
 * Client HTTP untuk sisi browser. Semua request menuju Astro API route
 * (`/api/...`), bukan langsung ke fiber-api — lihat penjelasan di src/lib/fiber.ts.
 */
import type {
  ApiEnvelope,
  Category,
  Order,
  PaginationMeta,
  Product,
  ProductQuery,
  User,
} from './types';
import type {
  CategoryInput,
  CheckoutInput,
  ProductInput,
  ProfileInput,
  RegisterInput,
  SignInInput,
  UserCreateInput,
  UserUpdateInput,
} from './schemas';

/** Error dari API, lengkap dengan error per-field untuk ditempel di form. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResult<T> {
  data: T;
  meta?: PaginationMeta;
  warning?: string;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  let response: Response;
  try {
    response = await fetch(path, {
      credentials: 'same-origin',
      ...init,
    });
  } catch {
    throw new ApiError(0, 'Tidak bisa menghubungi server. Cek koneksi Anda.');
  }

  let body: ApiEnvelope<T> = { success: response.ok };
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text) as ApiEnvelope<T>;
    } catch {
      throw new ApiError(response.status, 'Response server tidak valid');
    }
  }

  if (!response.ok || body.success === false) {
    throw new ApiError(response.status, body.error ?? 'Permintaan gagal', body.errors);
  }

  return { data: body.data as T, meta: body.meta, warning: body.warning };
}

function jsonInit(method: string, payload?: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  };
}

/** Nama query string mengikuti fiber-api: category_id, keyword, page, limit. */
function toQueryString(query: ProductQuery): string {
  const params = new URLSearchParams();

  if (query.keyword) params.set('keyword', query.keyword);
  if (query.categoryId) params.set('category_id', String(query.categoryId));
  if (query.page && query.page > 1) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  if (query.sort && query.sort !== 'newest') params.set('sort', query.sort);

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  auth: {
    signIn: (payload: SignInInput) => request<{ user: User }>('/api/auth/login', jsonInit('POST', payload)),
    register: (payload: RegisterInput) =>
      request<{ user: User }>('/api/auth/register', jsonInit('POST', payload)),
    signOut: () => request<null>('/api/auth/logout', jsonInit('POST')),
    me: () => request<{ user: User | null }>('/api/auth/me'),
    updateProfile: (payload: ProfileInput) =>
      request<{ user: User }>('/api/auth/me', jsonInit('PUT', payload)),
  },

  products: {
    list: (query: ProductQuery = {}) => request<Product[]>(`/api/v1/products${toQueryString(query)}`),
    get: (id: number) => request<Product>(`/api/products/${id}`),
    create: (payload: ProductInput) => request<Product>('/api/products', jsonInit('POST', payload)),
    update: (id: number, payload: ProductInput) =>
      request<Product>(`/api/products/${id}`, jsonInit('PUT', payload)),
    remove: (id: number) => request<null>(`/api/products/${id}`, { method: 'DELETE' }),
    uploadImage: (id: number, file: File) => {
      const form = new FormData();
      form.append('image', file);
      return request<Product>(`/api/products/${id}/image`, { method: 'POST', body: form });
    },
    deleteImage: (id: number) =>
      request<Product>(`/api/products/${id}/image`, { method: 'DELETE' }),
  },

  categories: {
    list: (withCount = false) =>
      request<Category[]>(`/api/categories${withCount ? '?with_count=1' : ''}`),
    create: (payload: CategoryInput) => request<Category>('/api/categories', jsonInit('POST', payload)),
    update: (id: number, payload: CategoryInput) =>
      request<Category>(`/api/categories/${id}`, jsonInit('PUT', payload)),
    remove: (id: number) => request<null>(`/api/categories/${id}`, { method: 'DELETE' }),
  },

  users: {
    list: (keyword = '') =>
      request<User[]>(`/api/users${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}`),
    create: (payload: UserCreateInput) => request<User>('/api/users', jsonInit('POST', payload)),
    update: (id: number, payload: UserUpdateInput) =>
      request<User>(`/api/users/${id}`, jsonInit('PUT', payload)),
    remove: (id: number) => request<null>(`/api/users/${id}`, { method: 'DELETE' }),
  },

  orders: {
    list: () => request<Order[]>('/api/orders'),
    create: (payload: CheckoutInput) => request<Order>('/api/orders', jsonInit('POST', payload)),
  },
};
