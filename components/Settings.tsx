'use client'

import { useState } from 'react'
import type { AppSettings, AppMode, UserProfile, SuggestionSource } from '@/lib/types'
import { APP_MODES, USER_PROFILES, CUSTOM_FEATURES } from '@/lib/types'

interface Props {
  settings: AppSettings
  onUpdate: (settings: AppSettings) => void
  onClose: () => void
}

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}

function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between py-3"
    >
      <div className="text-left">
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
      <div
        className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${
          checked ? 'bg-orange-500' : 'bg-gray-300'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </div>
    </button>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 px-1">
      {children}
    </p>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 px-4 divide-y divide-gray-100">
      {children}
    </div>
  )
}

export default function Settings({ settings, onUpdate, onClose }: Props) {
  const update = (partial: Partial<AppSettings>) => onUpdate({ ...settings, ...partial })
  const [showApiKey, setShowApiKey] = useState(false)

  const count = settings.suggestionCount ?? 5
  const customFeatures = settings.customFeatures ?? []

  const toggleCustomFeature = (id: string, on: boolean) => {
    const next = on ? [...customFeatures, id] : customFeatures.filter((f) => f !== id)
    update({ customFeatures: next })
  }

  return (
    <div className="fixed inset-0 bg-orange-50 z-40 flex flex-col">
      {/* ヘッダー */}
      <header className="sticky top-0 bg-white border-b border-orange-100 shadow-sm z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-orange-50 text-gray-600 text-lg"
          >
            ←
          </button>
          <h2 className="font-bold text-gray-800">設定</h2>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto max-w-lg mx-auto w-full px-4 py-6 space-y-6">

        {/* プロフィール */}
        <section>
          <SectionTitle>プロフィール</SectionTitle>
          <Card>
            <div className="py-3">
              <p className="text-sm font-medium text-gray-800 mb-3">あなたは？</p>
              <div className="flex gap-2">
                {USER_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => update({ profile: p.id as UserProfile })}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                      settings.profile === p.id
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200'
                    }`}
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <span className="text-xs font-medium">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </section>

        {/* 使い方モード */}
        <section>
          <SectionTitle>使い方モード</SectionTitle>
          <div className="space-y-2">
            {APP_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => update({ mode: m.id as AppMode })}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all ${
                  settings.mode === m.id
                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-orange-200'
                }`}
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{m.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm font-bold ${settings.mode === m.id ? 'text-orange-700' : 'text-gray-800'}`}>
                    {m.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{m.desc}</p>
                </div>
                {settings.mode === m.id && (
                  <span className="text-orange-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* カスタムモード機能選択 */}
        {settings.mode === 'custom' && (
          <section>
            <SectionTitle>カスタム機能</SectionTitle>
            <Card>
              {CUSTOM_FEATURES.map((f) => (
                <div key={f.id} className="py-1">
                  <Toggle
                    checked={customFeatures.includes(f.id)}
                    onChange={(v) => toggleCustomFeature(f.id, v)}
                    label={`${f.icon} ${f.label}`}
                    description={f.desc}
                  />
                </div>
              ))}
            </Card>
          </section>
        )}

        {/* 提案数 */}
        <section>
          <SectionTitle>提案数</SectionTitle>
          <Card>
            <div className="py-4">
              <p className="text-sm font-medium text-gray-800 text-center mb-3">
                1回の提案数（子供1人あたり）
              </p>
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={() => update({ suggestionCount: Math.max(1, count - 1) })}
                  className="w-11 h-11 rounded-full bg-gray-100 text-gray-700 text-2xl font-bold flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-colors"
                >
                  −
                </button>
                <span className="text-3xl font-bold text-orange-600 w-10 text-center">{count}</span>
                <button
                  onClick={() => update({ suggestionCount: Math.min(10, count + 1) })}
                  className="w-11 h-11 rounded-full bg-gray-100 text-gray-700 text-2xl font-bold flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-colors"
                >
                  ＋
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center mt-2">最小1・最大10（多いほど時間がかかります）</p>
            </div>
          </Card>
        </section>

        {/* 操作設定 */}
        <section>
          <SectionTitle>操作設定</SectionTitle>
          <Card>
            <div className="py-1">
              <Toggle
                checked={settings.oneHandMode}
                onChange={(v) => update({ oneHandMode: v })}
                label="片手モード"
                description="ボタンを大きく表示・スワイプで提案を切り替え"
              />
            </div>
          </Card>
        </section>

        {/* コンディション設定 */}
        <section>
          <SectionTitle>コンディション入力</SectionTitle>
          <Card>
            <div className="py-1">
              <Toggle
                checked={settings.conditionEnabled}
                onChange={(v) => update({ conditionEnabled: v })}
                label="コンディション入力を使う"
                description="オフにするとデフォルト設定でAIが提案します"
              />
            </div>
          </Card>
        </section>

        {/* 提案方法 */}
        <section>
          <SectionTitle>提案方法</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {([
              { id: 'db', icon: '📚', label: 'データベース', desc: '即時・無料・オフラインOK' },
              { id: 'ai', icon: '✨', label: 'AI（Gemini）', desc: '毎回新しい提案・APIキー必要' },
            ] as { id: SuggestionSource; icon: string; label: string; desc: string }[]).map((s) => (
              <button
                key={s.id}
                onClick={() => update({ suggestionSource: s.id })}
                className={`flex flex-col items-center gap-1 px-3 py-4 rounded-2xl border-2 transition-all text-center ${
                  (settings.suggestionSource ?? 'db') === s.id
                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-orange-200'
                }`}
              >
                <span className="text-2xl">{s.icon}</span>
                <p className={`text-sm font-bold ${(settings.suggestionSource ?? 'db') === s.id ? 'text-orange-700' : 'text-gray-800'}`}>
                  {s.label}
                </p>
                <p className="text-xs text-gray-500 leading-tight">{s.desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* AI設定（AIモード時のみ表示） */}
        {(settings.suggestionSource ?? 'db') === 'ai' && (
        <section>
          <SectionTitle>AI設定（Gemini）</SectionTitle>
          <Card>
            <div className="py-3">
              <p className="text-sm font-medium text-gray-800 mb-1">Google Gemini APIキー</p>
              <p className="text-xs text-gray-500 mb-3">
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-orange-500 underline">Google AI Studio</a>で無料取得できます。端末内のみに保存されます。
              </p>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.anthropicApiKey ?? ''}
                  onChange={(e) => update({ anthropicApiKey: e.target.value })}
                  placeholder="AIza..."
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:border-orange-400"
                />
                <button
                  onClick={() => setShowApiKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                >
                  {showApiKey ? '🙈' : '👁'}
                </button>
              </div>
              {settings.anthropicApiKey ? (
                <p className="text-xs text-green-600 mt-2">✓ APIキーが設定されています（無料で使えます）</p>
              ) : (
                <p className="text-xs text-orange-600 mt-2">⚠ APIキーを入力すると遊び提案が使えます</p>
              )}
            </div>
          </Card>
        </section>
        )}

        <div className="h-4" />
      </div>
    </div>
  )
}
