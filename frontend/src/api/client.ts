import { Character, RulesClass, RulesLineage, RulesHeritage, RulesBackground } from '../types/character'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API error ${res.status}: ${text}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const listCharacters = (): Promise<Character[]> =>
  request('/api/characters')

export const createCharacter = (data: Partial<Character>): Promise<Character> =>
  request('/api/characters', { method: 'POST', body: JSON.stringify(data) })

export const getCharacter = (id: string): Promise<Character> =>
  request(`/api/characters/${id}`)

export const patchCharacter = (id: string, data: Partial<Character>): Promise<Character> =>
  request(`/api/characters/${id}`, { method: 'PATCH', body: JSON.stringify(data) })

export const deleteCharacter = (id: string): Promise<void> =>
  request(`/api/characters/${id}`, { method: 'DELETE' })

export const getRules = async () => {
  const [classes, lineages, heritages, backgrounds] = await Promise.all([
    request<RulesClass[]>('/api/rules/classes'),
    request<RulesLineage[]>('/api/rules/lineages'),
    request<RulesHeritage[]>('/api/rules/heritages'),
    request<RulesBackground[]>('/api/rules/backgrounds'),
  ])
  return { classes, lineages, heritages, backgrounds }
}
