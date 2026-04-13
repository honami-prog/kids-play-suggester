'use client'

import { useState } from 'react'
import type { Child } from '@/lib/types'
import { formatAge, PHYSICAL_GOALS } from '@/lib/types'
import { saveChild } from '@/lib/db'

interface Props {
  kids: Child[]
  onUpdate: (kids: Child[]) => void
}

const PRESET_PREFERENCES = [
  '外遊びが好き', '絵を描くのが好き', '音楽が好き', '本が好き', '動物が好き',
  '電車・車が好き', '工作が好き', '料理を手伝いたい', '水遊びが好き', 'おままごとが好き',
  'ブロック遊びが好き', '体を動かすのが好き', 'お絵かきが好き', 'なりきり遊びが好き',
]

function ChildPreferences({
  child,
  onUpdate,
}: {
  child: Child
  onUpdate: (updated: Child) => void
}) {
  const [input, setInput] = useState('')

  // 旧データ互換：physicalGoals が undefined の場合は空配列
  const physicalGoals = child.physicalGoals ?? []

  const addPreference = async (pref: string) => {
    const trimmed = pref.trim()
    if (!trimmed || child.preferences.includes(trimmed)) return
    const updated = { ...child, preferences: [...child.preferences, trimmed] }
    await saveChild(updated)
    onUpdate(updated)
  }

  const removePreference = async (pref: string) => {
    const updated = { ...child, preferences: child.preferences.filter((p) => p !== pref) }
    await saveChild(updated)
    onUpdate(updated)
  }

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    await addPreference(input)
    setInput('')
  }

  const togglePhysicalGoal = async (goalId: string) => {
    const next = physicalGoals.includes(goalId)
      ? physicalGoals.filter((g) => g !== goalId)
      : [...physicalGoals, goalId]
    const updated = { ...child, physicalGoals: next }
    await saveChild(updated)
    onUpdate(updated)
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">
          🧒
        </div>
        <div>
          <p className="font-semibold text-gray-800">{child.name}</p>
          <p className="text-xs text-orange-600">{formatAge(child.birthDate)}</p>
        </div>
      </div>

      {/* 好みタグ */}
      <div>
        <p className="text-xs font-bold text-gray-600 mb-2">💭 好み・興味</p>

        {child.preferences.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {child.preferences.map((pref) => (
              <span
                key={pref}
                className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-full"
              >
                {pref}
                <button
                  onClick={() => removePreference(pref)}
                  className="text-orange-400 hover:text-red-500 transition-colors leading-none"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {child.preferences.length === 0 && (
          <p className="text-xs text-gray-400 mb-2">まだ設定されていません</p>
        )}

        {/* 自由入力 */}
        <form onSubmit={handleInputSubmit} className="flex gap-2 mb-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="好みを自由に入力"
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <button
            type="submit"
            className="bg-orange-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-orange-600 transition-colors"
          >
            追加
          </button>
        </form>

        {/* プリセット */}
        <div className="flex flex-wrap gap-1.5">
          {PRESET_PREFERENCES.filter((p) => !child.preferences.includes(p)).map((pref) => (
            <button
              key={pref}
              onClick={() => addPreference(pref)}
              className="text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 border border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
            >
              + {pref}
            </button>
          ))}
        </div>
      </div>

      {/* 身体能力目標 */}
      <div>
        <p className="text-xs font-bold text-gray-600 mb-2">💪 鍛えたい身体能力</p>
        <div className="flex flex-wrap gap-2">
          {PHYSICAL_GOALS.map((goal) => {
            const active = physicalGoals.includes(goal.id)
            return (
              <button
                key={goal.id}
                onClick={() => togglePhysicalGoal(goal.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  active
                    ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-orange-300 hover:text-orange-600'
                }`}
              >
                <span>{goal.icon}</span>
                <span>{goal.label}</span>
              </button>
            )
          })}
        </div>
        {physicalGoals.length > 0 && (
          <p className="text-xs text-orange-600 mt-2">
            選択中: {physicalGoals.map((id) => PHYSICAL_GOALS.find((g) => g.id === id)?.label).filter(Boolean).join('、')}
          </p>
        )}
      </div>
    </div>
  )
}

export default function PreferencesSettings({ kids, onUpdate }: Props) {
  const handleChildUpdate = (updated: Child) => {
    onUpdate(kids.map((c) => (c.id === updated.id ? updated : c)))
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-orange-800">好みと目標の設定</h2>
        <p className="text-sm text-gray-500">
          子供ごとの好みや鍛えたい能力を設定すると、より適した遊びが提案されます
        </p>
      </div>

      {kids.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">💭</div>
          <p className="text-sm">先に「子供」タブで子供を追加してください</p>
        </div>
      ) : (
        <div className="space-y-4">
          {kids.map((child) => (
            <ChildPreferences key={child.id} child={child} onUpdate={handleChildUpdate} />
          ))}
        </div>
      )}
    </div>
  )
}
