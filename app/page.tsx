'use client'

import { useState, useEffect } from 'react'
import type { Child, Toy, AppSettings } from '@/lib/types'
import { DEFAULT_SETTINGS, APP_MODES } from '@/lib/types'
import { getChildren, getToys, getSettings, saveSettings } from '@/lib/db'
import ChildrenManager from '@/components/ChildrenManager'
import ToyChecklist from '@/components/ToyChecklist'
import PreferencesSettings from '@/components/PreferencesSettings'
import PlaySuggestions from '@/components/PlaySuggestions'
import Onboarding from '@/components/Onboarding'
import Settings from '@/components/Settings'

type Tab = 'children' | 'toys' | 'preferences' | 'suggestions'

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'children', label: '子供', icon: '👶' },
  { id: 'toys', label: 'おもちゃ', icon: '🧸' },
  { id: 'preferences', label: '好み', icon: '💭' },
  { id: 'suggestions', label: '提案', icon: '✨' },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('children')
  const [children, setChildren] = useState<Child[]>([])
  const [toys, setToys] = useState<Toy[]>([])
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [initialized, setInitialized] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    console.log('[App] IndexedDB からデータを読み込みます...')
    Promise.all([getChildren(), getToys(), getSettings()])
      .then(([c, t, s]) => {
        console.log('[App] 読み込み完了 — children:', c.length, '件, toys:', t.length, '件')
        setChildren(c)
        setToys(t)
        setSettings(s ?? DEFAULT_SETTINGS)
        setInitialized(true)
      })
      .catch((err) => {
        console.error('[App] 初期化エラー:', err)
        setDbError(String(err))
        setInitialized(true)
      })
  }, [])

  const handleSettingsUpdate = async (next: AppSettings) => {
    setSettings(next)
    await saveSettings(next)
  }

  const handleOnboardingComplete = async (next: AppSettings) => {
    await handleSettingsUpdate(next)
    // オンボーディング後は提案タブへ
    setActiveTab('suggestions')
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center">
          <div className="text-5xl animate-bounce mb-4">🧸</div>
          <p className="text-orange-400 font-medium">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (dbError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 p-6">
        <div className="bg-white rounded-2xl shadow-md p-6 max-w-sm w-full text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="font-bold text-red-700 mb-2">データベースエラー</h2>
          <p className="text-sm text-gray-600 mb-4">
            IndexedDB を開けませんでした。プライベートブラウジングモードでは動作しません。
          </p>
          <pre className="text-xs text-left bg-red-50 rounded-lg p-3 text-red-800 overflow-auto">
            {dbError}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-orange-600"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  const isOneHand = settings.oneHandMode
  const currentMode = APP_MODES.find((m) => m.id === settings.mode)

  return (
    <>
      {/* オンボーディング（初回のみ） */}
      {!settings.onboardingDone && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {/* 設定画面（オーバーレイ） */}
      {showSettings && (
        <Settings
          settings={settings}
          onUpdate={handleSettingsUpdate}
          onClose={() => setShowSettings(false)}
        />
      )}

      <div className="min-h-screen bg-orange-50">
        {/* ヘッダー */}
        <header className="sticky top-0 z-10 bg-orange-500 text-white shadow-md">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">🧒</span>
            <div className="flex-1">
              <h1 className="text-base font-bold leading-tight">こどもあそびていあん</h1>
              {currentMode && (
                <p className="text-xs text-orange-200 flex items-center gap-1">
                  <span>{currentMode.icon}</span>
                  <span>{currentMode.label}</span>
                </p>
              )}
            </div>
            {children.length > 0 && (
              <div className="flex -space-x-1">
                {children.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="w-7 h-7 rounded-full bg-orange-300 border-2 border-orange-500 flex items-center justify-center text-xs"
                    title={c.name}
                  >
                    🧒
                  </div>
                ))}
              </div>
            )}
            {/* 設定ボタン */}
            <button
              onClick={() => setShowSettings(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-orange-600 active:bg-orange-700 transition-colors text-lg"
              aria-label="設定"
            >
              ⚙️
            </button>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-lg mx-auto px-4 py-6 pb-24">
          {activeTab === 'children' && (
            <ChildrenManager kids={children} onUpdate={setChildren} />
          )}
          {activeTab === 'toys' && (
            <ToyChecklist toys={toys} onUpdate={setToys} />
          )}
          {activeTab === 'preferences' && (
            <PreferencesSettings kids={children} onUpdate={setChildren} />
          )}
          {activeTab === 'suggestions' && (
            <PlaySuggestions
              kids={children}
              toys={toys}
              settings={settings}
              onSettingsUpdate={handleSettingsUpdate}
              onUpdateToys={setToys}
            />
          )}
        </main>

        {/* ボトムナビゲーション */}
        <nav
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 shadow-lg"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="max-w-lg mx-auto grid grid-cols-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center transition-colors ${
                  isOneHand ? 'py-4' : 'py-3'
                } px-2 ${
                  activeTab === tab.id
                    ? 'text-orange-500'
                    : 'text-gray-400 hover:text-orange-400'
                }`}
              >
                <span className={isOneHand ? 'text-3xl' : 'text-2xl'}>{tab.icon}</span>
                <span className={`mt-0.5 font-medium ${isOneHand ? 'text-sm' : 'text-xs'}`}>
                  {tab.label}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  )
}
