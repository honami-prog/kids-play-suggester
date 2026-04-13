'use client'

import { useState } from 'react'
import type { AppSettings, AppMode, UserProfile } from '@/lib/types'
import { APP_MODES, USER_PROFILES, DEFAULT_SETTINGS } from '@/lib/types'

interface Props {
  onComplete: (settings: AppSettings) => void
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [profile, setProfile] = useState<UserProfile>('mama')
  const [mode, setMode] = useState<AppMode>('weekend')

  const handleFinish = () => {
    onComplete({
      ...DEFAULT_SETTINGS,
      profile,
      mode,
      onboardingDone: true,
    })
  }

  return (
    <div className="fixed inset-0 bg-orange-50 z-50 flex flex-col">
      {/* プログレスバー */}
      <div className="flex gap-1 p-4 pt-8">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              s <= step ? 'bg-orange-500' : 'bg-orange-200'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {step === 1 && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🧒</div>
              <h1 className="text-2xl font-bold text-orange-800 mb-2">
                こどもあそびていあん
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed">
                お子さんに合った遊びをAIが提案します。
                <br />
                まず、あなたのことを教えてください。
              </p>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-700 mb-3 text-center">
                あなたは？
              </p>
              <div className="flex gap-3 justify-center">
                {USER_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProfile(p.id)}
                    className={`flex flex-col items-center gap-2 px-6 py-4 rounded-2xl border-2 transition-all font-medium ${
                      profile === p.id
                        ? 'border-orange-500 bg-orange-500 text-white shadow-lg scale-105'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-orange-300'
                    }`}
                  >
                    <span className="text-3xl">{p.icon}</span>
                    <span className="text-sm">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 pt-4">
            <div>
              <h2 className="text-xl font-bold text-orange-800 mb-1">
                使い方のスタイルを選んでください
              </h2>
              <p className="text-xs text-gray-500">あとから設定で変更できます</p>
            </div>

            <div className="space-y-3">
              {APP_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                    mode === m.id
                      ? 'border-orange-500 bg-orange-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-orange-200'
                  }`}
                >
                  <span className="text-3xl flex-shrink-0 mt-0.5">{m.icon}</span>
                  <div>
                    <p
                      className={`font-bold text-sm ${
                        mode === m.id ? 'text-orange-700' : 'text-gray-800'
                      }`}
                    >
                      {m.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                    <p className="text-xs text-gray-400 mt-1">{m.hint}</p>
                  </div>
                  {mode === m.id && (
                    <span className="ml-auto flex-shrink-0 text-orange-500 text-lg font-bold">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ボタン */}
      <div className="px-5 pb-8 pt-4 bg-orange-50 border-t border-orange-100">
        {step === 1 ? (
          <button
            onClick={() => setStep(2)}
            className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold text-base shadow-lg hover:bg-orange-600 active:bg-orange-700 transition-colors"
          >
            次へ →
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              ← 戻る
            </button>
            <button
              onClick={handleFinish}
              className="flex-[2] py-4 rounded-2xl bg-orange-500 text-white font-bold text-base shadow-lg hover:bg-orange-600 active:bg-orange-700 transition-colors"
            >
              はじめる 🎉
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
