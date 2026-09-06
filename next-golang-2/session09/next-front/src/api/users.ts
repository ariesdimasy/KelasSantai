import { listEnvelopeSchema } from '../schema/common'
import { userSchema } from '../schema/auth'
import { request } from './client'

export type UserListParams = {
  keyword?: string
  role?: 'admin' | 'user'
  isActive?: boolean
  page?: number
  limit?: number
}

/** GET /users — admin saja, berpaginasi. */
export async function listUsers(params: UserListParams = {}) {
  const raw = await request<unknown>({
    method: 'GET',
    url: '/users',
    params: {
      keyword: params.keyword || undefined,
      role: params.role || undefined,
      // Dikirim hanya kalau memang difilter — kalau selalu dikirim,
      // "semua user" jadi tidak mungkin.
      is_active: params.isActive === undefined ? undefined : String(params.isActive),
      page: params.page ?? 1,
      limit: params.limit ?? 10,
    },
  })

  const parsed = listEnvelopeSchema(userSchema).parse(raw)
  return { items: parsed.data, meta: parsed.meta ?? null }
}
