'use client'

import { useState, useEffect, useRef } from 'react'
import type { Child, Toy, Suggestion, AppSettings, ParentCondition } from '@/lib/types'
import { isConditionForToday } from '@/lib/types'
import { getSuggestions, saveAllSuggestions, toggleFavorite, clearOldSuggestions } from '@/lib/db'
import { generateSuggestions } from '@/lib/suggest'
import { generateFromDB } from '@/lib/suggestions-db'
import ModeHome from './ModeHome'

interface Props {
  kids: Child[]
  toys: Toy[]
  settings: AppSettings
  onSettingsUpdate: (s: AppSettings) => void
  onUpdateToys: (toys: Toy[]) => void
}

// ─── 片手モード: スワイプ式カードビュー ──────────────────────

function SuggestionCard({ suggestion, onToggleFavorite }: {
  suggestion: Suggestion
  onToggleFavorite: (id: string) => void
}) {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${suggestion.favorite ? 'border-yellow-300' : 'border-orange-100'}`}>
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-gray-800 flex-1 text-lg">{suggestion.title}</h4>
        <button
          onClick={() => onToggleFavorite(suggestion.id)}
          className="flex-shrink-0 text-3xl transition-transform hover:scale-110 active:scale-95"
        >
          {suggestion.favorite ? '⭐' : '☆'}
        </button>
      </div>
      <div className="flex gap-2 mt-2 flex-wrap">
        {suggestion.durationMinutes != null && (
          <span className="text-sm text-gray-400">⏱ {suggestion.durationMinutes}分</span>
        )}
        {suggestion.isIndoor != null && (
          <span className="text-sm text-gray-400">{suggestion.isIndoor ? '🏠 室内' : '🌳 屋外'}</span>
        )}
      </div>
      <p className="text-base text-gray-600 mt-3 leading-relaxed">{suggestion.description}</p>
      {suggestion.materials.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestion.materials.map((m, i) => (
            <span key={i} className="text-sm bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full border border-orange-100">
              🧰 {m}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function OneHandCardView({
  suggestions,
  onToggleFavorite,
}: {
  suggestions: Suggestion[]
  onToggleFavorite: (id: string) => void
}) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number>(0)
  const [sliding, setSliding] = useState<'left' | 'right' | null>(null)

  const current = suggestions[index]
  if (!current) return null

  const goNext = () => {
    if (index >= suggestions.length - 1) return
    setSliding('left')
    setTimeout(() => { setIndex((i) => i + 1); setSliding(null) }, 150)
  }
  const goPrev = () => {
    if (index <= 0) return
    setSliding('right')
    setTimeout(() => { setIndex((i) => i - 1); setSliding(null) }, 150)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-gray-500 font-medium">{index + 1} / {suggestions.length}</span>
        <div className="flex gap-1">
          {suggestions.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-orange-500' : 'w-1.5 bg-gray-300'}`}
            />
          ))}
        </div>
        <div className="w-12" />
      </div>

      <div
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          const d = e.changedTouches[0].clientX - touchStartX.current
          if (d < -50) goNext()
          else if (d > 50) goPrev()
        }}
        className={`transition-all duration-150 select-none ${
          sliding === 'left' ? '-translate-x-4 opacity-0' :
          sliding === 'right' ? 'translate-x-4 opacity-0' : 'translate-x-0 opacity-100'
        }`}
      >
        <SuggestionCard suggestion={current} onToggleFavorite={onToggleFavorite} />
      </div>

      <div className="flex gap-3 pt-1">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="flex-1 py-4 rounded-2xl text-lg font-bold border-2 transition-all disabled:opacity-30 border-orange-200 text-orange-600 bg-white hover:bg-orange-50"
        >
          ← 前へ
        </button>
        <button
          onClick={goNext}
          disabled={index === suggestions.length - 1}
          className="flex-1 py-4 rounded-2xl text-lg font-bold border-2 transition-all disabled:opacity-30 border-orange-500 text-white bg-orange-500 hover:bg-orange-600"
        >
          次へ →
        </button>
      </div>
      <p className="text-center text-xs text-gray-400">← スワイプでも切り替えられます →</p>
    </div>
  )
}

// ─── メインコンポーネント（データ管理） ──────────────────────

export default function PlaySuggestions({ kids: children, toys, settings, onSettingsUpdate, onUpdateToys }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conditionExpanded, setConditionExpanded] = useState(false)

  const { oneHandMode, conditionEnabled, condition, mode } = settings

  useEffect(() => {
    getSuggestions().then(setSuggestions)
  }, [])

  const handleGenerate = async () => {
    if (children.length === 0) {
      setError('先に「子供」タブで子供を登録してください')
      return
    }
    const useAI = (settings.suggestionSource ?? 'db') === 'ai'
    if (useAI && !settings.anthropicApiKey) {
      setError('設定（右上の⚙️）からGemini APIキーを入力してください')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await clearOldSuggestions()
      const effectiveCondition = conditionEnabled && isConditionForToday(condition) ? condition : null
      const count = settings.suggestionCount ?? 5
      let newSuggestions
      if (useAI) {
        newSuggestions = await generateSuggestions(
          settings.anthropicApiKey,
          children,
          toys,
          mode,
          effectiveCondition,
          count,
        )
      } else {
        newSuggestions = generateFromDB(children, toys, mode, effectiveCondition, count)
      }
      await saveAllSuggestions(newSuggestions)
      setSuggestions(await getSuggestions())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async (id: string) => {
    const updated = await toggleFavorite(id)
    if (updated) setSuggestions((prev) => prev.map((s) => (s.id === id ? updated : s)))
  }

  const handleConditionSave = (c: ParentCondition) => {
    onSettingsUpdate({ ...settings, condition: c })
  }

  // 片手モード: 全提案をフラットにスワイプ表示
  if (oneHandMode && suggestions.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-orange-800">遊び提案</h2>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">片手モード</span>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || children.length === 0}
          className="w-full py-5 rounded-2xl font-bold text-white text-lg shadow-lg transition-all disabled:opacity-50"
          style={{ background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #f97316, #fb923c)' }}
        >
          {loading ? '⟳ 考えています...' : '✨ 新しい提案をもらう'}
        </button>
        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">{error}</div>}
        <OneHandCardView suggestions={suggestions} onToggleFavorite={handleToggleFavorite} />
      </div>
    )
  }

  // 通常モード: ModeHome に委譲
  return (
    <ModeHome
      mode={mode}
      suggestions={suggestions}
      kids={children}
      toys={toys}
      settings={settings}
      loading={loading}
      error={error}
      conditionExpanded={conditionExpanded}
      onGenerate={handleGenerate}
      onToggleFavorite={handleToggleFavorite}
      onConditionSave={handleConditionSave}
      onConditionToggle={() => setConditionExpanded((v) => !v)}
      onUpdateToys={onUpdateToys}
      onSettingsUpdate={onSettingsUpdate}
    />
  )
}
