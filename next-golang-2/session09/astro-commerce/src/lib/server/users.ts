/**
 * Service user + autentikasi.
 *
 * fiber-api belum punya models/user.go, jadi tabel user disimpan di store lokal
 * (`.data/db.json`). Password TIDAK pernah disimpan/dikirim dalam bentuk asli —
 * hanya hash scrypt, dan hash itu tidak pernah keluar dari modul ini.
 */
import type { Role, SessionUser, User } from '@/lib/types';
import { badRequest, conflict, forbidden, notFound, unauthorized } from './errors';
import { hashPassword, verifyPassword } from './password';
import { type StoredUser, getDb, mutateDb, nextId } from './store';

/** Buang passwordHash sebelum data dikirim keluar. */
function toUser(stored: StoredUser): User {
  return {
    id: stored.id,
    name: stored.name,
    email: stored.email,
    role: stored.role,
    createdAt: stored.createdAt,
    updatedAt: stored.updatedAt,
  };
}

export function toSessionUser(user: User): SessionUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function listUsers(keyword = ''): Promise<User[]> {
  const db = await getDb();
  const needle = keyword.trim().toLowerCase();

  return db.users
    .filter(
      (user) =>
        !needle ||
        user.name.toLowerCase().includes(needle) ||
        user.email.toLowerCase().includes(needle),
    )
    .map(toUser)
    .sort((a, b) => a.id - b.id);
}

export async function getUser(id: number): Promise<User | null> {
  const db = await getDb();
  const found = db.users.find((user) => user.id === id);
  return found ? toUser(found) : null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
}): Promise<User> {
  const db = await getDb();
  if (db.users.some((user) => user.email === input.email)) {
    throw conflict('Email sudah terdaftar');
  }

  const passwordHash = await hashPassword(input.password);

  const created = await mutateDb((current) => {
    // cek ulang di dalam mutasi — mencegah dua request kembar lolos bersamaan
    if (current.users.some((user) => user.email === input.email)) return null;

    const now = new Date().toISOString();
    const user: StoredUser = {
      id: nextId(current, 'user'),
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      createdAt: now,
      updatedAt: now,
    };
    current.users.push(user);
    return user;
  });

  if (!created) throw conflict('Email sudah terdaftar');
  return toUser(created);
}

export async function updateUser(
  id: number,
  input: { name: string; email: string; password?: string; role?: Role },
): Promise<User> {
  const db = await getDb();
  const target = db.users.find((user) => user.id === id);
  if (!target) throw notFound('User tidak ditemukan');

  if (db.users.some((user) => user.email === input.email && user.id !== id)) {
    throw conflict('Email sudah dipakai user lain');
  }

  // Jangan sampai tidak ada admin yang tersisa.
  if (input.role && input.role !== 'admin' && target.role === 'admin') {
    const admins = db.users.filter((user) => user.role === 'admin').length;
    if (admins <= 1) throw badRequest('Minimal harus ada satu admin');
  }

  const passwordHash = input.password ? await hashPassword(input.password) : undefined;

  const updated = await mutateDb((current) => {
    const user = current.users.find((item) => item.id === id);
    if (!user) return null;

    user.name = input.name;
    user.email = input.email;
    if (input.role) user.role = input.role;
    if (passwordHash) user.passwordHash = passwordHash;
    user.updatedAt = new Date().toISOString();
    return user;
  });

  if (!updated) throw notFound('User tidak ditemukan');
  return toUser(updated);
}

export async function deleteUser(id: number, actorId: number): Promise<void> {
  const db = await getDb();
  const target = db.users.find((user) => user.id === id);
  if (!target) throw notFound('User tidak ditemukan');

  if (id === actorId) throw forbidden('Anda tidak bisa menghapus akun sendiri');

  if (target.role === 'admin') {
    const admins = db.users.filter((user) => user.role === 'admin').length;
    if (admins <= 1) throw badRequest('Minimal harus ada satu admin');
  }

  await mutateDb((current) => {
    current.users = current.users.filter((user) => user.id !== id);
  });
}

/** Login: email + password -> SessionUser. Pesan error dibuat samar agar tidak membocorkan email mana yang terdaftar. */
export async function authenticate(email: string, password: string): Promise<SessionUser> {
  const db = await getDb();
  const stored = db.users.find((user) => user.email === email);
  if (!stored) throw unauthorized('Email atau password salah');

  const valid = await verifyPassword(password, stored.passwordHash);
  if (!valid) throw unauthorized('Email atau password salah');

  return toSessionUser(toUser(stored));
}

/** Registrasi publik dari storefront — role selalu "user". */
export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<SessionUser> {
  const user = await createUser({ ...input, role: 'user' });
  return toSessionUser(user);
}
