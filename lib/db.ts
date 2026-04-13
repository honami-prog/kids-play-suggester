import { openDB, IDBPDatabase } from 'idb'
import type { Child, Toy, Suggestion, AppSettings } from './types'

const DB_NAME = 'kids-play-suggester'
const DB_VERSION = 2

interface KidsDB {
  children: {
    key: string
    value: Child
    indexes: { 'by-name': string }
  }
  toys: {
    key: string
    value: Toy
  }
  suggestions: {
    key: string
    value: Suggestion
    indexes: { 'by-childId': string | null; 'by-createdAt': string }
  }
  settings: {
    key: string
    value: AppSettings
  }
}

let dbPromise: Promise<IDBPDatabase<KidsDB>> | null = null

function getDB(): Promise<IDBPDatabase<KidsDB>> | null {
  if (typeof window === 'undefined') {
    console.debug('[DB] サーバーサイドのため IndexedDB はスキップ')
    return null
  }
  if (!dbPromise) {
    console.log('[DB] IndexedDB を開きます:', DB_NAME, 'version', DB_VERSION)
    dbPromise = openDB<KidsDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        console.log(`[DB] upgrade: ${oldVersion} → ${newVersion}`)
        if (!db.objectStoreNames.contains('children')) {
          const cs = db.createObjectStore('children', { keyPath: 'id' })
          cs.createIndex('by-name', 'name')
          console.log('[DB] objectStore "children" を作成しました')
        }
        if (!db.objectStoreNames.contains('toys')) {
          db.createObjectStore('toys', { keyPath: 'id' })
          console.log('[DB] objectStore "toys" を作成しました')
        }
        if (!db.objectStoreNames.contains('suggestions')) {
          const ss = db.createObjectStore('suggestions', { keyPath: 'id' })
          ss.createIndex('by-childId', 'childId')
          ss.createIndex('by-createdAt', 'createdAt')
          console.log('[DB] objectStore "suggestions" を作成しました')
        }
        // v2: settings ストア追加
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
          console.log('[DB] objectStore "settings" を作成しました')
        }
      },
      blocked() {
        console.warn('[DB] 別タブで旧バージョンが開かれているため blocked 状態です')
      },
      blocking() {
        console.warn('[DB] このタブが旧バージョンをブロックしています')
      },
      terminated() {
        console.error('[DB] IndexedDB 接続が予期せず終了しました。再接続のため dbPromise をリセットします')
        dbPromise = null
      },
    }).then((db) => {
      console.log('[DB] IndexedDB オープン成功:', DB_NAME)
      return db
    }).catch((err) => {
      console.error('[DB] IndexedDB のオープンに失敗しました:', err)
      dbPromise = null
      throw err
    })
  }
  return dbPromise
}

// DB の状態を確認するデバッグ用関数（開発時に console から呼び出し可能）
export async function debugDB(): Promise<void> {
  console.group('[DB] デバッグ情報')
  try {
    const db = await getDB()
    if (!db) {
      console.warn('DB が null です（サーバーサイド）')
      return
    }
    const children = await db.getAll('children')
    const toys = await db.getAll('toys')
    const suggestions = await db.getAll('suggestions')
    const settings = await db.getAll('settings')
    console.log('children:', children)
    console.log('toys:', toys)
    console.log('suggestions:', suggestions)
    console.log('settings:', settings)
  } catch (err) {
    console.error('デバッグ中にエラー:', err)
  } finally {
    console.groupEnd()
  }
}

// Children
export async function getChildren(): Promise<Child[]> {
  try {
    const db = await getDB()
    if (!db) return []
    const result = await db.getAll('children')
    console.log(`[DB] getChildren: ${result.length} 件取得`)
    return result
  } catch (err) {
    console.error('[DB] getChildren エラー:', err)
    return []
  }
}

export async function saveChild(child: Child): Promise<void> {
  try {
    const db = await getDB()
    if (!db) {
      console.warn('[DB] saveChild: DB が null のため保存できません')
      return
    }
    await db.put('children', child)
    console.log('[DB] saveChild 成功:', child.id, child.name)
  } catch (err) {
    console.error('[DB] saveChild エラー:', err)
    throw err
  }
}

export async function deleteChild(id: string): Promise<void> {
  try {
    const db = await getDB()
    if (!db) return
    await db.delete('children', id)
    console.log('[DB] deleteChild 成功:', id)
  } catch (err) {
    console.error('[DB] deleteChild エラー:', err)
    throw err
  }
}

// Toys
export async function getToys(): Promise<Toy[]> {
  try {
    const db = await getDB()
    if (!db) return []
    const result = await db.getAll('toys')
    console.log(`[DB] getToys: ${result.length} 件取得`)
    return result
  } catch (err) {
    console.error('[DB] getToys エラー:', err)
    return []
  }
}

export async function saveToy(toy: Toy): Promise<void> {
  try {
    const db = await getDB()
    if (!db) {
      console.warn('[DB] saveToy: DB が null のため保存できません')
      return
    }
    await db.put('toys', toy)
    console.log('[DB] saveToy 成功:', toy.id, toy.name)
  } catch (err) {
    console.error('[DB] saveToy エラー:', err)
    throw err
  }
}

export async function deleteToy(id: string): Promise<void> {
  try {
    const db = await getDB()
    if (!db) return
    await db.delete('toys', id)
    console.log('[DB] deleteToy 成功:', id)
  } catch (err) {
    console.error('[DB] deleteToy エラー:', err)
    throw err
  }
}

// Suggestions
export async function getSuggestions(): Promise<Suggestion[]> {
  try {
    const db = await getDB()
    if (!db) return []
    const all = await db.getAll('suggestions')
    console.log(`[DB] getSuggestions: ${all.length} 件取得`)
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  } catch (err) {
    console.error('[DB] getSuggestions エラー:', err)
    return []
  }
}

export async function saveSuggestion(suggestion: Suggestion): Promise<void> {
  try {
    const db = await getDB()
    if (!db) {
      console.warn('[DB] saveSuggestion: DB が null のため保存できません')
      return
    }
    await db.put('suggestions', suggestion)
    console.log('[DB] saveSuggestion 成功:', suggestion.id)
  } catch (err) {
    console.error('[DB] saveSuggestion エラー:', err)
    throw err
  }
}

export async function saveAllSuggestions(suggestions: Suggestion[]): Promise<void> {
  try {
    const db = await getDB()
    if (!db) {
      console.warn('[DB] saveAllSuggestions: DB が null のため保存できません')
      return
    }
    const tx = db.transaction('suggestions', 'readwrite')
    await Promise.all(suggestions.map((s) => tx.store.put(s)))
    await tx.done
    console.log(`[DB] saveAllSuggestions 成功: ${suggestions.length} 件`)
  } catch (err) {
    console.error('[DB] saveAllSuggestions エラー:', err)
    throw err
  }
}

export async function toggleFavorite(id: string): Promise<Suggestion | null> {
  try {
    const db = await getDB()
    if (!db) return null
    const tx = db.transaction('suggestions', 'readwrite')
    const suggestion = await tx.store.get(id)
    if (!suggestion) return null
    suggestion.favorite = !suggestion.favorite
    await tx.store.put(suggestion)
    await tx.done
    console.log('[DB] toggleFavorite 成功:', id, '→ favorite:', suggestion.favorite)
    return suggestion
  } catch (err) {
    console.error('[DB] toggleFavorite エラー:', err)
    return null
  }
}

export async function clearOldSuggestions(): Promise<void> {
  try {
    const db = await getDB()
    if (!db) return
    const all = await db.getAll('suggestions')
    const nonFavorites = all.filter((s) => !s.favorite)
    const tx = db.transaction('suggestions', 'readwrite')
    await Promise.all(nonFavorites.map((s) => tx.store.delete(s.id)))
    await tx.done
    console.log(`[DB] clearOldSuggestions 成功: ${nonFavorites.length} 件削除`)
  } catch (err) {
    console.error('[DB] clearOldSuggestions エラー:', err)
    throw err
  }
}

// Settings
export async function getSettings(): Promise<AppSettings | null> {
  try {
    const db = await getDB()
    if (!db) return null
    const result = await db.get('settings', 'app')
    console.log('[DB] getSettings:', result ?? '未設定')
    return result ?? null
  } catch (err) {
    console.error('[DB] getSettings エラー:', err)
    return null
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    const db = await getDB()
    if (!db) {
      console.warn('[DB] saveSettings: DB が null のため保存できません')
      return
    }
    await db.put('settings', settings)
    console.log('[DB] saveSettings 成功')
  } catch (err) {
    console.error('[DB] saveSettings エラー:', err)
    throw err
  }
}
