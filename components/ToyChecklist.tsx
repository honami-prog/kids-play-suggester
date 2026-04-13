'use client'

import { useState } from 'react'
import type { Toy } from '@/lib/types'
import { saveToy, deleteToy } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  toys: Toy[]
  onUpdate: (toys: Toy[]) => void
}

type Category = 'permanent' | 'consumable'

const PRESET_PERMANENT: string[] = [
  '積み木', 'レゴ', 'ブロック', 'パズル', '絵本', '人形', 'ミニカー',
  'ボール', '縄跳び', 'なわとび', 'フープ', 'バランスボード',
]

const PRESET_CONSUMABLE: string[] = [
  '折り紙', '粘土', 'クレヨン', '絵の具', 'シャボン玉', '色画用紙',
  'ハサミ・のり', 'スライム材料', '風船', '新聞紙',
]

interface AddFormProps {
  category: Category
  toys: Toy[]
  onAdd: (toy: Toy) => void
  onClose: () => void
}

function AddForm({ category, toys, onAdd, onClose }: AddFormProps) {
  const [name, setName] = useState('')
  const presets = category === 'permanent' ? PRESET_PERMANENT : PRESET_CONSUMABLE
  const label = category === 'permanent' ? '常設おもちゃ' : '消耗品'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const toy: Toy = {
      id: uuidv4(),
      name: name.trim(),
      category,
      checked: true,
    }
    onAdd(toy)
    setName('')
  }

  const handlePreset = (presetName: string) => {
    if (toys.some((t) => t.name === presetName)) return
    const toy: Toy = { id: uuidv4(), name: presetName, category, checked: true }
    onAdd(toy)
  }

  const unusedPresets = presets.filter((p) => !toys.some((t) => t.name === p))

  return (
    <div className="bg-white rounded-2xl p-4 shadow-md border border-orange-100 space-y-3">
      <h3 className="font-semibold text-orange-700">{label}を追加</h3>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前を入力"
          className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          autoFocus
        />
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          追加
        </button>
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-100 text-gray-700 px-3 py-2 rounded-xl text-sm hover:bg-gray-200 transition-colors"
        >
          ×
        </button>
      </form>
      {unusedPresets.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-1.5">よく使うもの：</p>
          <div className="flex flex-wrap gap-1.5">
            {unusedPresets.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePreset(p)}
                className="text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors"
              >
                + {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface ToyItemProps {
  toy: Toy
  onToggle: (toy: Toy) => void
  onDelete: (id: string) => void
}

function PermanentItem({ toy, onToggle, onDelete }: ToyItemProps) {
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-orange-100 flex items-center gap-3">
      <button
        onClick={() => onToggle(toy)}
        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          toy.checked ? 'bg-orange-500 border-orange-500' : 'border-gray-300 bg-white'
        }`}
      >
        {toy.checked && <span className="text-white text-xs font-bold">✓</span>}
      </button>
      <span
        className={`flex-1 text-sm font-medium ${toy.checked ? 'text-gray-800' : 'text-gray-400 line-through'}`}
      >
        {toy.name}
      </span>
      <button
        onClick={() => onDelete(toy.id)}
        className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}

function ConsumableItem({ toy, onToggle, onDelete }: ToyItemProps) {
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-orange-100 flex items-center gap-3">
      <span className="flex-1 text-sm font-medium text-gray-800">{toy.name}</span>
      {/* 在庫トグル */}
      <button
        onClick={() => onToggle(toy)}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
          toy.checked
            ? 'bg-green-50 text-green-700 border-green-300'
            : 'bg-red-50 text-red-500 border-red-200'
        }`}
      >
        <span>{toy.checked ? '✓' : '✗'}</span>
        <span>{toy.checked ? '在庫あり' : '在庫なし'}</span>
      </button>
      <button
        onClick={() => onDelete(toy.id)}
        className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}

export default function ToyChecklist({ toys, onUpdate }: Props) {
  const [addingCategory, setAddingCategory] = useState<Category | null>(null)

  const permanents = toys.filter((t) => t.category === 'permanent')
  const consumables = toys.filter(
    (t) => t.category === 'consumable' || (t.category === undefined),
  ).map((t) => ({ ...t, category: 'consumable' as const }))

  // 旧データ（category未設定）を consumable に帰属させる（念のため）
  const allToys = [
    ...permanents,
    ...consumables,
  ]

  const activeCount = allToys.filter((t) => t.checked).length

  const handleToggle = async (toy: Toy) => {
    const updated = { ...toy, checked: !toy.checked }
    await saveToy(updated)
    onUpdate(toys.map((t) => (t.id === toy.id ? updated : t)))
  }

  const handleAdd = async (toy: Toy) => {
    await saveToy(toy)
    onUpdate([...toys, toy])
  }

  const handleDelete = async (id: string) => {
    await deleteToy(id)
    onUpdate(toys.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-orange-800">おもちゃ・素材</h2>
        <p className="text-xs text-gray-500">
          利用可能なものをAIが参考にします（{activeCount}/{allToys.length}個が使用可能）
        </p>
      </div>

      {addingCategory && (
        <AddForm
          category={addingCategory}
          toys={toys}
          onAdd={async (toy) => {
            await handleAdd(toy)
            setAddingCategory(null)
          }}
          onClose={() => setAddingCategory(null)}
        />
      )}

      {/* 常設おもちゃ セクション */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-700">🧸 常設おもちゃ</h3>
            <p className="text-xs text-gray-400">レゴ・積み木など常にあるもの</p>
          </div>
          <button
            onClick={() => setAddingCategory(addingCategory === 'permanent' ? null : 'permanent')}
            className="text-xs px-3 py-1.5 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            + 追加
          </button>
        </div>
        {permanents.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-xl">
            常設おもちゃを追加してください
          </p>
        ) : (
          <div className="space-y-2">
            {permanents.map((toy) => (
              <PermanentItem
                key={toy.id}
                toy={toy}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
        {permanents.length > 1 && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={async () => {
                const updated = permanents.map((t) => ({ ...t, checked: true }))
                await Promise.all(updated.map(saveToy))
                onUpdate(toys.map((t) => t.category === 'permanent' ? { ...t, checked: true } : t))
              }}
              className="flex-1 text-xs py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
            >
              すべて選択
            </button>
            <button
              onClick={async () => {
                const updated = permanents.map((t) => ({ ...t, checked: false }))
                await Promise.all(updated.map(saveToy))
                onUpdate(toys.map((t) => t.category === 'permanent' ? { ...t, checked: false } : t))
              }}
              className="flex-1 text-xs py-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
            >
              すべて解除
            </button>
          </div>
        )}
      </section>

      {/* 消耗品 セクション */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-700">🎨 消耗品</h3>
            <p className="text-xs text-gray-400">折り紙・粘土など在庫が減るもの</p>
          </div>
          <button
            onClick={() => setAddingCategory(addingCategory === 'consumable' ? null : 'consumable')}
            className="text-xs px-3 py-1.5 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            + 追加
          </button>
        </div>
        {consumables.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-xl">
            消耗品を追加してください
          </p>
        ) : (
          <div className="space-y-2">
            {consumables.map((toy) => (
              <ConsumableItem
                key={toy.id}
                toy={toy}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
        {consumables.some((t) => !t.checked) && (
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">
            ⚠ 在庫なしの消耗品を使う遊びはAIの提案から除外されます
          </p>
        )}
      </section>
    </div>
  )
}
