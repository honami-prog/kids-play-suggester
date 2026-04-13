'use client'

import type { AppSettings, AppMode, UserProfile } from '@/lib/types'
import { APP_MODES, USER_PROFILES } from '@/lib/types'

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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all ${
                  settings.mode === m.id
                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-orange-200'
                }`}
              >
                <span className="text-2xl flex-shrink-0">{m.icon}</span>
                <div className="flex-1">
                  <p
                    className={`text-sm font-bold ${
                      settings.mode === m.id ? 'text-orange-700' : 'text-gray-800'
                    }`}
                  >
                    {m.label}
                  </p>
                  <p className="text-xs text-gray-500">{m.desc}</p>
                </div>
                {settings.mode === m.id && (
                  <span className="text-orange-500 font-bold flex-shrink-0">✓</span>
                )}
              </button>
            ))}
          </div>
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
          {!settings.conditionEnabled && (
            <p className="text-xs text-gray-500 mt-2 px-1">
              オフの場合：外出可能・一緒に遊べる設定でAIが提案します
            </p>
          )}
        </section>

        <div className="h-4" />
      </div>
    </div>
  )
}
