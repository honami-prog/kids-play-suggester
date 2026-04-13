'use client'

import { useState } from 'react'
import type { ParentCondition, Participation } from '@/lib/types'
import { PARTICIPATIONS, todayString, isConditionForToday } from '@/lib/types'

interface Props {
  condition: ParentCondition | null
  onSave: (condition: ParentCondition) => void
  expanded: boolean
  onToggleExpand: () => void
}

const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土']

function formatToday(): string {
  const d = new Date()
  return `${d.getMonth() + 1}月${d.getDate()}日（${DOW_LABELS[d.getDay()]}）`
}

function ConditionBadge({
  condition,
  onEdit,
}: {
  condition: ParentCondition
  onEdit: () => void
}) {
  const participation = PARTICIPATIONS.find((p) => p.id === condition.participation)
  return (
    <button
      onClick={onEdit}
      className="w-full flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-left hover:bg-green-100 transition-colors"
    >
      <span className="text-2xl">{condition.canGoOutside ? '🌤' : '🏡'}</span>
      <div className="flex-1">
        <p className="text-xs text-green-700 font-bold">今日のコンディション設定済み</p>
        <p className="text-xs text-gray-600 mt-0.5">
          {condition.canGoOutside ? '外出OK' : 'おうちで'} ・ {participation?.icon}{' '}
          {participation?.label}
        </p>
      </div>
      <span className="text-xs text-gray-400 flex-shrink-0">編集 ▲</span>
    </button>
  )
}

function ConditionForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: ParentCondition | null
  onSave: (c: ParentCondition) => void
  onCancel: () => void
}) {
  const today = todayString()
  const [canGoOutside, setCanGoOutside] = useState<boolean>(initial?.canGoOutside ?? true)
  const [participation, setParticipation] = useState<Participation>(
    initial?.participation ?? 'active',
  )

  return (
    <div className="bg-white border border-orange-200 rounded-2xl p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-700">今日のコンディション</p>
          <p className="text-xs text-gray-400">{formatToday()}</p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {/* 外出可否 */}
      <div>
        <p className="text-xs font-bold text-gray-600 mb-2">外出は？</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: true, label: '外に出られる', icon: '🌤' },
            { value: false, label: 'おうちで過ごす', icon: '🏡' },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => setCanGoOutside(opt.value)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                canGoOutside === opt.value
                  ? 'border-orange-500 bg-orange-50 text-orange-700'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200'
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 参加度 */}
      <div>
        <p className="text-xs font-bold text-gray-600 mb-2">どのくらい関われる？</p>
        <div className="space-y-2">
          {PARTICIPATIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setParticipation(opt.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
                participation === opt.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-orange-200'
              }`}
            >
              <span className="text-xl flex-shrink-0">{opt.icon}</span>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    participation === opt.id ? 'text-orange-700' : 'text-gray-700'
                  }`}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-gray-400">{opt.desc}</p>
              </div>
              {participation === opt.id && (
                <span className="text-orange-500 font-bold flex-shrink-0">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => onSave({ date: today, canGoOutside, participation })}
        className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 active:bg-orange-700 transition-colors"
      >
        保存する
      </button>
    </div>
  )
}

export default function ConditionInput({ condition, onSave, expanded, onToggleExpand }: Props) {
  const todayCondition = isConditionForToday(condition) ? condition : null

  if (!expanded && todayCondition) {
    return <ConditionBadge condition={todayCondition} onEdit={onToggleExpand} />
  }

  if (!expanded) {
    return (
      <button
        onClick={onToggleExpand}
        className="w-full flex items-center gap-3 bg-orange-50 border border-dashed border-orange-300 rounded-2xl px-4 py-3 text-left hover:bg-orange-100 transition-colors"
      >
        <span className="text-2xl">🌤</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-orange-700">今日のコンディションを入力</p>
          <p className="text-xs text-gray-500">外出可否・参加度を設定するとより適した提案に</p>
        </div>
        <span className="text-orange-400 text-sm flex-shrink-0">▼</span>
      </button>
    )
  }

  return (
    <ConditionForm
      initial={todayCondition}
      onSave={(c) => {
        onSave(c)
        onToggleExpand()
      }}
      onCancel={onToggleExpand}
    />
  )
}
