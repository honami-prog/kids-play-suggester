'use client'

import { useState } from 'react'
import type {
  Child,
  Toy,
  Suggestion,
  AppSettings,
  ParentCondition,
  TimeSlot,
  AppMode,
} from '@/lib/types'
import {
  DEVELOPMENT_AREAS,
  TIME_SLOTS,
  currentTimeSlot,
} from '@/lib/types'
import { saveToy } from '@/lib/db'
import ConditionInput from './ConditionInput'

export interface ModeHomeProps {
  suggestions: Suggestion[]
  kids: Child[]
  toys: Toy[]
  settings: AppSettings
  loading: boolean
  error: string | null
  conditionExpanded: boolean
  onGenerate: () => void
  onToggleFavorite: (id: string) => void
  onConditionSave: (c: ParentCondition) => void
  onConditionToggle: () => void
  onUpdateToys: (toys: Toy[]) => void
  onSettingsUpdate: (s: AppSettings) => void
}

// ─── 共通 UI パーツ ──────────────────────────────────────────

function GenerateButton({
  loading,
  disabled,
  onClick,
  label = '遊びを提案してもらう',
  large,
}: {
  loading: boolean
  disabled: boolean
  onClick: () => void
  label?: string
  large?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className={`w-full font-bold text-white shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl ${
        large ? 'py-6 text-xl' : 'py-4 text-base'
      }`}
      style={{ background: loading ? '#e5e7eb' : 'linear-gradient(135deg, #f97316, #fb923c)' }}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin text-xl">⟳</span>
          AIが考えています...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <span className="text-xl">✨</span>
          {label}
        </span>
      )}
    </button>
  )
}

function ErrorBanner({ error }: { error: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
      {error}
    </div>
  )
}

function NoChildBanner() {
  return (
    <div className="text-center py-4 text-sm text-gray-400 bg-gray-50 rounded-xl">
      「子供」タブで子供を登録すると提案できます
    </div>
  )
}

// ─── 標準提案カード ──────────────────────────────────────────

function SuggestionCard({
  suggestion: s,
  onToggleFavorite,
  index,
  compact,
}: {
  suggestion: Suggestion
  onToggleFavorite: (id: string) => void
  index?: number
  compact?: boolean
}) {
  if (compact) {
    return (
      <div
        className={`bg-white rounded-2xl px-4 py-3 shadow-sm border flex items-center gap-3 ${
          s.favorite ? 'border-yellow-300' : 'border-orange-100'
        }`}
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">{s.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {s.durationMinutes != null && (
              <span className="text-xs text-gray-500">⏱ {s.durationMinutes}分</span>
            )}
            {s.isIndoor != null && (
              <span className="text-xs text-gray-500">{s.isIndoor ? '🏠 室内' : '🌳 屋外'}</span>
            )}
            {s.materials.length > 0 ? (
              <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100">
                🧰 道具あり
              </span>
            ) : (
              <span className="text-xs bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full border border-gray-100">
                道具不要
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite(s.id)}
          className="flex-shrink-0 text-xl hover:scale-110 active:scale-95 transition-transform"
        >
          {s.favorite ? '⭐' : '☆'}
        </button>
      </div>
    )
  }

  return (
    <div
      className={`bg-white rounded-2xl p-4 shadow-sm border ${
        s.favorite ? 'border-yellow-300' : 'border-orange-100'
      }`}
    >
      <div className="flex items-start gap-3">
        {index != null && (
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-600 font-bold text-sm flex items-center justify-center">
            {index + 1}
          </span>
        )}
        <div className="flex-1 min-w-0">
          {s.developmentArea && (() => {
            const area = DEVELOPMENT_AREAS.find((a) => a.id === s.developmentArea)
            return area ? (
              <span className={`text-xs ${area.text} ${area.bg} px-2 py-0.5 rounded-full inline-block mb-1.5`}>
                {area.icon} {area.label}
              </span>
            ) : null
          })()}
          <p className="font-semibold text-gray-800 text-sm">{s.title}</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {s.durationMinutes != null && (
              <span className="text-xs text-gray-400">⏱{s.durationMinutes}分</span>
            )}
            {s.isIndoor != null && (
              <span className="text-xs text-gray-400">{s.isIndoor ? '🏠' : '🌳'}</span>
            )}
            {s.isQuiet && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">静か</span>
            )}
            {s.materials.length === 0 && (
              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">道具不要</span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{s.description}</p>
          {s.materials.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {s.materials.map((m, i) => (
                <span key={i} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-100">
                  🧰 {m}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => onToggleFavorite(s.id)}
          className="flex-shrink-0 text-xl hover:scale-110 active:scale-95 transition-transform"
        >
          {s.favorite ? '⭐' : '☆'}
        </button>
      </div>
    </div>
  )
}

// ─── 子供別・兄弟共通タブ表示 ────────────────────────────────

function ChildGroupedView({
  suggestions,
  kids,
  onToggleFavorite,
  compact = false,
  numbered = false,
}: {
  suggestions: Suggestion[]
  kids: Child[]
  onToggleFavorite: (id: string) => void
  compact?: boolean
  numbered?: boolean
}) {
  const childTabs = kids.filter((c) => suggestions.some((s) => s.childId === c.id))
  const hasGroup = suggestions.some((s) => s.childId === null)

  const defaultTab = childTabs[0]?.id ?? (hasGroup ? 'group' : null)
  const [activeTab, setActiveTab] = useState<string | null>(defaultTab)

  const displayed = suggestions.filter((s) =>
    activeTab === 'group' ? s.childId === null : s.childId === activeTab,
  )

  if (!childTabs.length && !hasGroup) return null

  const showTabs = childTabs.length > 1 || (childTabs.length >= 1 && hasGroup)

  return (
    <div className="space-y-3">
      {showTabs && (
        <div className="flex gap-1 overflow-x-auto pb-1">
          {childTabs.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id)}
              className={`flex-shrink-0 text-sm px-4 py-2 rounded-full font-medium transition-colors ${
                activeTab === c.id
                  ? 'bg-orange-500 text-white shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'
              }`}
            >
              🧒 {c.name}
            </button>
          ))}
          {hasGroup && (
            <button
              onClick={() => setActiveTab('group')}
              className={`flex-shrink-0 text-sm px-4 py-2 rounded-full font-medium transition-colors ${
                activeTab === 'group'
                  ? 'bg-orange-500 text-white shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50'
              }`}
            >
              👨‍👩‍👧 兄弟共通
            </button>
          )}
        </div>
      )}
      <div className="space-y-3">
        {displayed.map((s, i) => (
          <SuggestionCard
            key={s.id}
            suggestion={s}
            onToggleFavorite={onToggleFavorite}
            compact={compact}
            index={numbered ? i : undefined}
          />
        ))}
        {displayed.length === 0 && (
          <div className="text-center py-4 text-sm text-gray-400 bg-gray-50 rounded-xl">
            この子の提案はありません
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 週末ダッシュボード ───────────────────────────────────────

function WeekendHomeView(props: ModeHomeProps) {
  const { suggestions, kids, settings, loading, error, onGenerate, onToggleFavorite,
          onConditionSave, onConditionToggle, conditionExpanded } = props
  const { conditionEnabled, condition } = settings

  const latestCreatedAt = suggestions[0]?.createdAt ?? null
  const thisPeriodSuggestions = latestCreatedAt
    ? suggestions.filter((s) => s.createdAt === latestCreatedAt)
    : []
  const pastFavorites = suggestions.filter((s) => s.favorite && s.createdAt !== latestCreatedAt)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-orange-800">🌅 週末ダッシュボード</h2>
        <p className="text-xs text-gray-500">先週の振り返りと今週の提案が1画面で</p>
      </div>

      {conditionEnabled && (
        <ConditionInput
          condition={condition}
          onSave={onConditionSave}
          expanded={conditionExpanded}
          onToggleExpand={onConditionToggle}
        />
      )}

      <GenerateButton
        loading={loading}
        disabled={kids.length === 0}
        onClick={onGenerate}
        label="今週の遊びを計画する"
      />

      {kids.length === 0 && <NoChildBanner />}
      {error && <ErrorBanner error={error} />}

      {/* 先週のお気に入り */}
      {pastFavorites.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-bold text-gray-700">⭐ 先週の振り返り</h3>
            <span className="text-xs text-gray-400">{pastFavorites.length}件お気に入り</span>
          </div>
          <ChildGroupedView
            suggestions={pastFavorites.slice(0, 6)}
            kids={kids}
            onToggleFavorite={onToggleFavorite}
            compact
          />
        </section>
      )}

      {/* 今週の提案 */}
      {thisPeriodSuggestions.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-gray-700 mb-2">📅 今週の提案</h3>
          <ChildGroupedView
            suggestions={thisPeriodSuggestions}
            kids={kids}
            onToggleFavorite={onToggleFavorite}
            compact
          />
        </section>
      )}

      {!thisPeriodSuggestions.length && !loading && (
        <div className="text-center py-10 text-gray-400">
          <div className="text-5xl mb-3">📅</div>
          <p className="text-sm">今週の遊び計画をAIに立ててもらいましょう</p>
        </div>
      )}
    </div>
  )
}

// ─── ぐずり対応ウィジェット ──────────────────────────────────

const TANTRUM_TIPS = [
  { emoji: '🎵', title: '好きな音楽をかける', time: '即' },
  { emoji: '🪟', title: '窓から外を見る', time: '1分' },
  { emoji: '🫁', title: '一緒に深呼吸する', time: '1分' },
  { emoji: '💧', title: 'お水を飲む', time: '即' },
  { emoji: '🤗', title: 'ギュッと抱きしめる', time: '1分' },
  { emoji: '🎭', title: 'おかしな顔をし合う', time: '2分' },
  { emoji: '🏃', title: 'その場でジャンプ10回', time: '1分' },
  { emoji: '📖', title: '好きな本を1冊読む', time: '5分' },
]

function TantrumWidget() {
  const [showTantrum, setShowTantrum] = useState(false)
  return (
    <>
      <button
        onClick={() => setShowTantrum((v) => !v)}
        className="w-full flex items-center gap-3 bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3 text-left hover:bg-red-100 transition-colors"
      >
        <span className="text-2xl">🚨</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-red-700">ぐずり対応</p>
          <p className="text-xs text-red-500">今すぐできる気分転換を見る</p>
        </div>
        <span className="text-red-400">{showTantrum ? '▲' : '▼'}</span>
      </button>
      {showTantrum && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-bold text-red-600 mb-3">すぐできる気分転換</p>
          <div className="grid grid-cols-2 gap-2">
            {TANTRUM_TIPS.map((tip, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-red-100 flex items-center gap-2">
                <span className="text-xl flex-shrink-0">{tip.emoji}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-800 leading-tight">{tip.title}</p>
                  <p className="text-xs text-gray-400">{tip.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

// ─── 帰宅後モード ─────────────────────────────────────────────

function WorkingHomeView(props: ModeHomeProps) {
  const { suggestions, kids, settings, loading, error, onGenerate, onToggleFavorite,
          onConditionSave, onConditionToggle, conditionExpanded } = props
  const { conditionEnabled, condition } = settings

  // 短時間・静か・道具不要を優先でソート
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    const scoreA =
      (a.durationMinutes != null && a.durationMinutes <= 20 ? 2 : 0) +
      (a.isQuiet ? 1 : 0) +
      (a.materials.length === 0 ? 1 : 0)
    const scoreB =
      (b.durationMinutes != null && b.durationMinutes <= 20 ? 2 : 0) +
      (b.isQuiet ? 1 : 0) +
      (b.materials.length === 0 ? 1 : 0)
    return scoreB - scoreA
  })

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-orange-800">💼 今日の遊び</h2>
        <p className="text-xs text-gray-500">帰宅後に使える厳選提案</p>
      </div>

      <TantrumWidget />

      {conditionEnabled && (
        <ConditionInput
          condition={condition}
          onSave={onConditionSave}
          expanded={conditionExpanded}
          onToggleExpand={onConditionToggle}
        />
      )}

      <GenerateButton
        loading={loading}
        disabled={kids.length === 0}
        onClick={onGenerate}
        label="今日の遊びを提案してもらう"
      />

      {kids.length === 0 && <NoChildBanner />}
      {error && <ErrorBanner error={error} />}

      {sortedSuggestions.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-bold text-gray-700">⚡ 厳選提案</h3>
            <span className="text-xs text-gray-400">短時間・静か・道具不要を優先</span>
          </div>
          <ChildGroupedView
            suggestions={sortedSuggestions}
            kids={kids}
            onToggleFavorite={onToggleFavorite}
            numbered
          />
        </section>
      )}

      {!suggestions.length && !loading && (
        <div className="text-center py-10 text-gray-400">
          <div className="text-5xl mb-3">💼</div>
          <p className="text-sm">帰宅後に使える遊びをAIに提案してもらいましょう</p>
        </div>
      )}
    </div>
  )
}

// ─── 発達ピラミッド ───────────────────────────────────────────

function DevelopmentPyramid({ suggestions }: { suggestions: Suggestion[] }) {
  const favorites = suggestions.filter((s) => s.favorite)
  const total = favorites.length
  if (total === 0) return null

  const counts = DEVELOPMENT_AREAS.map((area) => ({
    ...area,
    count: favorites.filter((s) => s.developmentArea === area.id).length,
  }))

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔺</span>
        <p className="text-sm font-bold text-gray-700">発達ピラミッド</p>
        <span className="text-xs text-gray-400">お気に入り {total}件の内訳</span>
      </div>
      <div className="space-y-2">
        {counts.map((area) => (
          <div key={area.id} className="flex items-center gap-2">
            <span className="text-sm w-4">{area.icon}</span>
            <span className="text-xs text-gray-600 w-20 flex-shrink-0">{area.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${area.bar} transition-all`}
                style={{ width: total > 0 ? `${(area.count / total) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-xs text-gray-500 w-6 text-right">{area.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── 消耗品在庫ウィジェット ──────────────────────────────────

function QuickStockWidget({
  toys,
  onUpdateToys,
}: {
  toys: Toy[]
  onUpdateToys: (t: Toy[]) => void
}) {
  const consumables = toys.filter((t) => t.category === 'consumable')
  if (consumables.length === 0) return null

  const handleToggle = async (toy: Toy) => {
    const updated = { ...toy, checked: !toy.checked }
    await saveToy(updated)
    onUpdateToys(toys.map((t) => (t.id === toy.id ? updated : t)))
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100">
      <p className="text-xs font-bold text-gray-700 mb-2">🎨 消耗品の在庫</p>
      <div className="flex flex-wrap gap-2">
        {consumables.map((toy) => (
          <button
            key={toy.id}
            onClick={() => handleToggle(toy)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              toy.checked
                ? 'bg-green-50 text-green-700 border-green-300'
                : 'bg-red-50 text-red-500 border-red-200 line-through opacity-70'
            }`}
          >
            {toy.checked ? '✓' : '✗'} {toy.name}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── 自宅保育モード ──────────────────────────────────────────

function FulltimeHomeView(props: ModeHomeProps) {
  const { suggestions, kids, toys, settings, loading, error, onGenerate, onToggleFavorite,
          onConditionSave, onConditionToggle, conditionExpanded, onUpdateToys } = props
  const { conditionEnabled, condition } = settings

  const [activeSlot, setActiveSlot] = useState<TimeSlot>(currentTimeSlot())

  const slotSuggestions = suggestions.filter((s) => s.timeSlot === activeSlot)
  const unslotted = suggestions.filter((s) => !s.timeSlot)
  const displaySuggestions = slotSuggestions.length > 0 ? slotSuggestions : unslotted

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-orange-800">🏠 今日の遊びプラン</h2>
        <p className="text-xs text-gray-500">時間帯別に最適な遊びを</p>
      </div>

      <QuickStockWidget toys={toys} onUpdateToys={onUpdateToys} />

      {conditionEnabled && (
        <ConditionInput
          condition={condition}
          onSave={onConditionSave}
          expanded={conditionExpanded}
          onToggleExpand={onConditionToggle}
        />
      )}

      <GenerateButton
        loading={loading}
        disabled={kids.length === 0}
        onClick={onGenerate}
        label="今日の遊びプランを作る"
      />

      {kids.length === 0 && <NoChildBanner />}
      {error && <ErrorBanner error={error} />}

      <DevelopmentPyramid suggestions={suggestions} />

      {suggestions.length > 0 && (
        <>
          {/* 時間帯タブ */}
          <div className="flex gap-2">
            {TIME_SLOTS.map((slot) => {
              const count = suggestions.filter((s) => s.timeSlot === slot.id).length
              return (
                <button
                  key={slot.id}
                  onClick={() => setActiveSlot(slot.id)}
                  className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border-2 transition-all ${
                    activeSlot === slot.id
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200'
                  }`}
                >
                  <span className="text-lg">{slot.icon}</span>
                  <span className="text-xs font-bold mt-0.5">{slot.label}</span>
                  {count > 0 && <span className="text-xs text-gray-400">{count}件</span>}
                </button>
              )
            })}
          </div>

          <ChildGroupedView
            suggestions={displaySuggestions}
            kids={kids}
            onToggleFavorite={onToggleFavorite}
          />
        </>
      )}

      {!suggestions.length && !loading && (
        <div className="text-center py-10 text-gray-400">
          <div className="text-5xl mb-3">🏠</div>
          <p className="text-sm">今日の遊びプランをAIに作ってもらいましょう</p>
        </div>
      )}
    </div>
  )
}

// ─── さくっとモード ───────────────────────────────────────────

function QuickHomeView(props: ModeHomeProps) {
  const { suggestions, kids, loading, error, onGenerate, onToggleFavorite } = props

  return (
    <div className="space-y-4">
      <div className="py-4">
        <button
          onClick={onGenerate}
          disabled={loading || kids.length === 0}
          className="w-full py-8 rounded-3xl font-bold text-white text-xl shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          style={{
            background: loading
              ? '#e5e7eb'
              : 'linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%)',
          }}
        >
          {loading ? (
            <span className="flex flex-col items-center gap-2">
              <span className="animate-spin text-3xl">⟳</span>
              <span>考えています...</span>
            </span>
          ) : (
            <span className="flex flex-col items-center gap-2">
              <span className="text-4xl">🎲</span>
              <span>おまかせで提案</span>
              <span className="text-sm font-normal opacity-90">タップするだけでOK</span>
            </span>
          )}
        </button>
      </div>

      {kids.length === 0 && <NoChildBanner />}
      {error && <ErrorBanner error={error} />}

      {suggestions.length > 0 && (
        <ChildGroupedView
          suggestions={suggestions}
          kids={kids}
          onToggleFavorite={onToggleFavorite}
        />
      )}

      {!suggestions.length && !loading && (
        <div className="text-center py-6 text-gray-400">
          <p className="text-sm">上のボタンを押してください</p>
        </div>
      )}
    </div>
  )
}

// ─── たまにモード ─────────────────────────────────────────────

function OccasionalHomeView(props: ModeHomeProps) {
  const { suggestions, kids, settings, loading, error, onGenerate, onToggleFavorite,
          onConditionSave, onConditionToggle, conditionExpanded } = props
  const { conditionEnabled, condition } = settings
  const [onlyFav, setOnlyFav] = useState(false)

  const filtered = onlyFav ? suggestions.filter((s) => s.favorite) : suggestions

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-orange-800">🎲 遊び提案</h2>
      </div>

      {conditionEnabled && (
        <ConditionInput
          condition={condition}
          onSave={onConditionSave}
          expanded={conditionExpanded}
          onToggleExpand={onConditionToggle}
        />
      )}

      <GenerateButton loading={loading} disabled={kids.length === 0} onClick={onGenerate} />

      {kids.length === 0 && <NoChildBanner />}
      {error && <ErrorBanner error={error} />}

      {suggestions.length > 0 && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setOnlyFav((v) => !v)}
              className={`text-sm px-3 py-2 rounded-full transition-colors ${
                onlyFav
                  ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {onlyFav ? '⭐ お気に入りのみ' : '☆ すべて表示'}
            </button>
          </div>
          <ChildGroupedView
            suggestions={filtered}
            kids={kids}
            onToggleFavorite={onToggleFavorite}
          />
        </>
      )}

      {!suggestions.length && !loading && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-sm">ボタンを押してAIに遊びを提案してもらいましょう</p>
        </div>
      )}
    </div>
  )
}

// ─── カスタムモード ───────────────────────────────────────────

function CustomHomeView(props: ModeHomeProps) {
  const { suggestions, kids, toys, settings, loading, error, onGenerate, onToggleFavorite,
          onConditionSave, onConditionToggle, conditionExpanded, onUpdateToys } = props
  const { conditionEnabled, condition, customFeatures = [] } = settings

  const has = (id: string) => customFeatures.includes(id)

  // 厳選フィルター適用
  const displaySuggestions = has('top3_filter')
    ? [...suggestions].sort((a, b) => {
        const score = (s: Suggestion) =>
          (s.durationMinutes != null && s.durationMinutes <= 20 ? 2 : 0) +
          (s.isQuiet ? 1 : 0) +
          (s.materials.length === 0 ? 1 : 0)
        return score(b) - score(a)
      })
    : suggestions

  const [activeSlot, setActiveSlot] = useState<TimeSlot>(currentTimeSlot())
  const slotFiltered = has('timeslot')
    ? displaySuggestions.filter((s) => !s.timeSlot || s.timeSlot === activeSlot)
    : displaySuggestions

  const pastFavorites = has('favorites_recap')
    ? suggestions.filter((s) => s.favorite && s.createdAt !== suggestions[0]?.createdAt)
    : []

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-orange-800">🛠️ カスタムモード</h2>
        <p className="text-xs text-gray-500">
          {customFeatures.length === 0
            ? '設定でお好みの機能を追加できます'
            : `${customFeatures.length}個の機能が有効`}
        </p>
      </div>

      {has('tantrum') && <TantrumWidget />}
      {has('quick_stock') && <QuickStockWidget toys={toys} onUpdateToys={onUpdateToys} />}

      {conditionEnabled && (
        <ConditionInput
          condition={condition}
          onSave={onConditionSave}
          expanded={conditionExpanded}
          onToggleExpand={onConditionToggle}
        />
      )}

      <GenerateButton loading={loading} disabled={kids.length === 0} onClick={onGenerate} />

      {kids.length === 0 && <NoChildBanner />}
      {error && <ErrorBanner error={error} />}

      {has('development_pyramid') && <DevelopmentPyramid suggestions={suggestions} />}

      {pastFavorites.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-gray-700 mb-2">⭐ 前回のお気に入り</h3>
          <ChildGroupedView
            suggestions={pastFavorites.slice(0, 6)}
            kids={kids}
            onToggleFavorite={onToggleFavorite}
            compact
          />
        </section>
      )}

      {suggestions.length > 0 && (
        <>
          {has('timeslot') && (
            <div className="flex gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setActiveSlot(slot.id)}
                  className={`flex-1 flex flex-col items-center py-2.5 rounded-xl border-2 transition-all ${
                    activeSlot === slot.id
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white text-gray-600'
                  }`}
                >
                  <span className="text-lg">{slot.icon}</span>
                  <span className="text-xs font-bold mt-0.5">{slot.label}</span>
                </button>
              ))}
            </div>
          )}
          <ChildGroupedView
            suggestions={slotFiltered}
            kids={kids}
            onToggleFavorite={onToggleFavorite}
            numbered={has('top3_filter')}
          />
        </>
      )}

      {!suggestions.length && !loading && (
        <div className="text-center py-10 text-gray-400">
          <div className="text-5xl mb-3">🛠️</div>
          <p className="text-sm">ボタンを押して遊びを提案してもらいましょう</p>
          {customFeatures.length === 0 && (
            <p className="text-xs mt-2">設定 ⚙️ → カスタム機能で表示を変更できます</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── メインエクスポート ──────────────────────────────────────

export default function ModeHome(props: ModeHomeProps & { mode: AppMode }) {
  const { mode } = props
  switch (mode) {
    case 'weekend':    return <WeekendHomeView    {...props} />
    case 'working':    return <WorkingHomeView    {...props} />
    case 'fulltime':   return <FulltimeHomeView   {...props} />
    case 'quick':      return <QuickHomeView      {...props} />
    case 'occasional': return <OccasionalHomeView {...props} />
    case 'custom':     return <CustomHomeView     {...props} />
  }
}
