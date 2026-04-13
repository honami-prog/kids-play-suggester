export interface Child {
  id: string
  name: string
  birthDate: string // ISO date string YYYY-MM-DD
  preferences: string[]
  physicalGoals: string[] // 鍛えたい身体能力
}

export interface Toy {
  id: string
  name: string
  /** 常設（レゴ等）か消耗品（折り紙等）か */
  category: 'permanent' | 'consumable'
  /**
   * 常設おもちゃ: true = 提案に使う / false = 使わない
   * 消耗品: true = 在庫あり / false = 在庫なし（提案から除外）
   */
  checked: boolean
}

export interface Suggestion {
  id: string
  childId: string | null // null = 兄弟共通提案
  childName: string | null
  title: string
  description: string
  materials: string[]
  favorite: boolean
  createdAt: string
  // v2 metadata（古いレコードにはない）
  durationMinutes?: number // 所要時間（分）
  isIndoor?: boolean       // 室内か
  isQuiet?: boolean        // 静かな遊びか
  timeSlot?: TimeSlot      // 時間帯（自宅保育版のみ）
  developmentArea?: string // 発達領域（自宅保育版のみ）
}

export interface SuggestionGroup {
  childId: string | null
  childName: string | null
  suggestions: Suggestion[]
}

export const PHYSICAL_GOALS = [
  { id: 'balance', label: 'バランス・体幹', icon: '🤸' },
  { id: 'fingers', label: '手先・指先', icon: '✋' },
] as const

export type PhysicalGoalId = (typeof PHYSICAL_GOALS)[number]['id']

// ─── 発達領域 ─────────────────────────────────────────────────

export const DEVELOPMENT_AREAS = [
  { id: 'motor',     label: '運動・身体', icon: '🏃', bar: 'bg-red-400',    text: 'text-red-700',    bg: 'bg-red-50'    },
  { id: 'language',  label: '言語・表現', icon: '💬', bar: 'bg-sky-400',    text: 'text-sky-700',    bg: 'bg-sky-50'    },
  { id: 'cognitive', label: '認知・思考', icon: '🧠', bar: 'bg-violet-400', text: 'text-violet-700', bg: 'bg-violet-50' },
  { id: 'social',    label: '社会・情緒', icon: '🤝', bar: 'bg-emerald-400',text: 'text-emerald-700',bg: 'bg-emerald-50'},
  { id: 'sensory',   label: '感覚・知覚', icon: '🌈', bar: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50'  },
] as const

export type DevelopmentAreaId = (typeof DEVELOPMENT_AREAS)[number]['id']

// ─── 時間帯 ───────────────────────────────────────────────────

export type TimeSlot = 'morning' | 'afternoon' | 'evening'

export const TIME_SLOTS: { id: TimeSlot; label: string; icon: string; range: string }[] = [
  { id: 'morning',   label: '午前',  icon: '🌅', range: '6〜12時'  },
  { id: 'afternoon', label: '午後',  icon: '☀️', range: '12〜17時' },
  { id: 'evening',   label: '夕方', icon: '🌆', range: '17〜21時' },
]

export function currentTimeSlot(): TimeSlot {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

// ─── アプリ設定 ──────────────────────────────────────────────

export type AppMode = 'weekend' | 'working' | 'fulltime' | 'quick' | 'occasional'

export const APP_MODES = [
  {
    id: 'weekend' as AppMode,
    label: '週末モード',
    icon: '🌅',
    desc: '週1パパ・週末まとめ派',
    hint: '週末にまとめて遊び計画を立てたい方向け',
  },
  {
    id: 'working' as AppMode,
    label: '毎日・ワーキング版',
    icon: '💼',
    desc: '帰宅後に使いたいママ・パパ',
    hint: '仕事後の短い時間で使いやすい設計',
  },
  {
    id: 'fulltime' as AppMode,
    label: '毎日・自宅保育版',
    icon: '🏠',
    desc: '日中たっぷり使いたいママ',
    hint: '一日のあそびプランをしっかり立てたい方向け',
  },
  {
    id: 'quick' as AppMode,
    label: 'さくっとモード',
    icon: '⚡',
    desc: 'ちょこちょこあっさり派',
    hint: 'すぐに提案だけ見たいシンプル派向け',
  },
  {
    id: 'occasional' as AppMode,
    label: 'たまにモード',
    icon: '🎲',
    desc: '思い出した時だけ派',
    hint: '気が向いたときだけ使う方向け',
  },
] as const

export type UserProfile = 'mama' | 'papa' | 'other'

export const USER_PROFILES = [
  { id: 'mama' as UserProfile, label: 'ママ', icon: '👩' },
  { id: 'papa' as UserProfile, label: 'パパ', icon: '👨' },
  { id: 'other' as UserProfile, label: 'その他', icon: '🧑' },
] as const

export type Participation = 'active' | 'watch' | 'unavailable'

export const PARTICIPATIONS: { id: Participation; label: string; icon: string; desc: string }[] = [
  { id: 'active',      label: '一緒に遊べる', icon: '🎮', desc: '積極的に参加できる' },
  { id: 'watch',       label: '見守れる',     icon: '👀', desc: 'そばで見ていられる' },
  { id: 'unavailable', label: '遊べない',     icon: '💤', desc: '子供だけで遊ぶ必要あり' },
]

export interface ParentCondition {
  date: string // YYYY-MM-DD
  canGoOutside: boolean
  participation: Participation
}

export interface AppSettings {
  key: 'app'
  mode: AppMode
  profile: UserProfile
  oneHandMode: boolean
  conditionEnabled: boolean // コンディション入力機能を使うか
  condition: ParentCondition | null
  onboardingDone: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
  key: 'app',
  mode: 'weekend',
  profile: 'mama',
  oneHandMode: false,
  conditionEnabled: true,
  condition: null,
  onboardingDone: false,
}

// ─── ユーティリティ ──────────────────────────────────────────

export function calcAge(birthDate: string): { years: number; months: number } {
  const birth = new Date(birthDate)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (months < 0) {
    years--
    months += 12
  }
  return { years, months }
}

export function formatAge(birthDate: string): string {
  const { years, months } = calcAge(birthDate)
  if (years === 0) return `生後${months}ヶ月`
  if (months === 0) return `${years}歳`
  return `${years}歳${months}ヶ月`
}

export function todayString(): string {
  return new Date().toISOString().split('T')[0]
}

export function isConditionForToday(condition: ParentCondition | null): boolean {
  if (!condition) return false
  return condition.date === todayString()
}
