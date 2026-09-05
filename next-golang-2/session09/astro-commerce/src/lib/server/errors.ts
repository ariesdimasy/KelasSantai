/**
 * Error terstruktur untuk lapisan service (catalog/users/orders).
 * API route cukup menangkapnya lalu memakai `status` & `message`-nya —
 * jadi tidak ada logika HTTP yang bocor ke dalam service.
 */
export class ServiceError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly errors?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export const badRequest = (message: string, errors?: Record<string, string>) =>
  new ServiceError(400, message, errors);
export const unauthorized = (message = 'Silakan login terlebih dahulu') =>
  new ServiceError(401, message);
export const forbidden = (message = 'Anda tidak punya akses ke resource ini') =>
  new ServiceError(403, message);
export const notFound = (message = 'Data tidak ditemukan') => new ServiceError(404, message);
export const conflict = (message: string) => new ServiceError(409, message);
