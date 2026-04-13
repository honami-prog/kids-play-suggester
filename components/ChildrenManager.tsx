'use client'

import { useState } from 'react'
import type { Child } from '@/lib/types'
import { formatAge, calcAge } from '@/lib/types'
import { saveChild, deleteChild } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  kids: Child[]
  onUpdate: (kids: Child[]) => void
}

function AgePreview({ birthDate }: { birthDate: string }) {
  if (!birthDate) return null
  const { years, months } = calcAge(birthDate)
  if (years < 0 || (years === 0 && months < 0)) return null
  return (
    <p className="text-xs text-orange-600 mt-1 font-medium">
      → {formatAge(birthDate)}
    </p>
  )
}

export default function ChildrenManager({ kids: children, onUpdate }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !birthDate) return

    if (editingId) {
      const updated: Child = {
        id: editingId,
        name: name.trim(),
        birthDate,
        preferences: children.find((c) => c.id === editingId)?.preferences ?? [],
        physicalGoals: children.find((c) => c.id === editingId)?.physicalGoals ?? [],
      }
      await saveChild(updated)
      onUpdate(children.map((c) => (c.id === editingId ? updated : c)))
    } else {
      const newChild: Child = {
        id: uuidv4(),
        name: name.trim(),
        birthDate,
        preferences: [],
        physicalGoals: [],
      }
      await saveChild(newChild)
      onUpdate([...children, newChild])
    }

    setName('')
    setBirthDate('')
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (child: Child) => {
    setName(child.name)
    setBirthDate(child.birthDate)
    setEditingId(child.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この子供を削除しますか？')) return
    await deleteChild(id)
    onUpdate(children.filter((c) => c.id !== id))
  }

  const handleCancel = () => {
    setName('')
    setBirthDate('')
    setEditingId(null)
    setShowForm(false)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-orange-800">子供の登録</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow hover:bg-orange-600 active:bg-orange-700 transition-colors"
          >
            <span className="text-lg leading-none">+</span>
            <span>追加</span>
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-4 shadow-md border border-orange-100"
        >
          <h3 className="font-semibold text-orange-700 mb-3">
            {editingId ? '子供の情報を編集' : '新しい子供を追加'}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: たろう"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={today}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
              <AgePreview birthDate={birthDate} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="flex-1 bg-orange-500 text-white py-2 rounded-xl font-medium text-sm hover:bg-orange-600 transition-colors"
            >
              {editingId ? '更新' : '登録'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      )}

      {children.length === 0 && !showForm && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">👶</div>
          <p className="text-sm">子供を追加してください</p>
        </div>
      )}

      <div className="space-y-3">
        {children.map((child) => (
          <div
            key={child.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-orange-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">
                🧒
              </div>
              <div>
                <p className="font-semibold text-gray-800">{child.name}</p>
                <p className="text-sm text-orange-600">{formatAge(child.birthDate)}</p>
                <p className="text-xs text-gray-400">{child.birthDate}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(child)}
                className="text-sm px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
              >
                編集
              </button>
              <button
                onClick={() => handleDelete(child.id)}
                className="text-sm px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              >
                削除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
