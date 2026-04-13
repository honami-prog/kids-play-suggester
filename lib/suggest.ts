import Anthropic from '@anthropic-ai/sdk'
import { v4 as uuidv4 } from 'uuid'
import type { Child, Toy, Suggestion, AppMode, ParentCondition, TimeSlot } from './types'
import { calcAge, PHYSICAL_GOALS, APP_MODES, PARTICIPATIONS, DEVELOPMENT_AREAS } from './types'

const DEVELOPMENT_AREA_IDS = DEVELOPMENT_AREAS.map((a) => a.id).join(' / ')

function suggestionTemplate(mode: AppMode): string {
  const base = `{
          "title": "遊びのタイトル",
          "description": "遊び方の説明（2〜3文）",
          "materials": ["必要な道具1"],
          "durationMinutes": 20,
          "isIndoor": true,
          "isQuiet": false`

  if (mode === 'fulltime') {
    return (
      base +
      `,
          "timeSlot": "morning",
          "developmentArea": "motor"
        }`
    )
  }
  return base + `\n        }`
}

function modeGuidance(mode: AppMode): string {
  switch (mode) {
    case 'weekend':
      return '週末にまとめて遊ぶため、少し手間をかけても楽しめる特別な遊びも歓迎。所要時間は30分〜1時間程度でもOK。'
    case 'working':
      return '帰宅後の短い時間（15〜30分）で完結する遊びを優先。準備ゼロまたは最小限で、道具不要・静かな遊びを中心に。'
    case 'fulltime':
      return '一日中一緒に過ごすため、活動的なものから静かなものまで多様に。時間帯別に適した活動を割り当ててください。'
    case 'quick':
      return 'すぐ始められる最もシンプルな提案を。準備ゼロ・道具なし・5〜10分でできるものを優先。'
    case 'occasional':
      return '気軽に使えるシンプルな提案。特別な準備なく始められる遊びを優先。'
    case 'custom':
      return '多様な遊びをバランスよく提案してください。'
  }
}

function buildPrompt(
  children: Child[],
  checkedToys: Toy[],
  mode: AppMode,
  condition: ParentCondition | null,
  suggestionCount = 5,
): string {
  const currentMode = APP_MODES.find((m) => m.id === mode)

  const childrenInfo = children
    .map((c) => {
      const { years, months } = calcAge(c.birthDate)
      const ageStr =
        years === 0 ? `${months}ヶ月` : months === 0 ? `${years}歳` : `${years}歳${months}ヶ月`
      const prefs = c.preferences.length > 0 ? `好み・興味: ${c.preferences.join('、')}` : ''
      const goals = (c.physicalGoals ?? [])
        .map((id) => PHYSICAL_GOALS.find((g) => g.id === id)?.label)
        .filter(Boolean)
      const goalsStr = goals.length > 0 ? `鍛えたい能力: ${goals.join('、')}` : ''
      const lines = [prefs, goalsStr].filter(Boolean)
      return `- ${c.name}（${ageStr}）${lines.length > 0 ? '\n  ' + lines.join('\n  ') : ''}`
    })
    .join('\n')

  const toysInfo =
    checkedToys.length > 0
      ? checkedToys
          .map((t) => `- ${t.name}（${t.category === 'consumable' ? '消耗品' : '常設'}）`)
          .join('\n')
      : '（特に指定なし）'

  const modeContext = currentMode
    ? `使い方モード: ${currentMode.label}（${currentMode.desc}）\n${modeGuidance(mode)}`
    : ''

  const conditionContext = condition
    ? `外出可否: ${condition.canGoOutside ? '外出可能' : '外出したくない（室内遊び推奨）'}\n参加度: ${
        PARTICIPATIONS.find((p) => p.id === condition.participation)?.label ?? ''
      }（${PARTICIPATIONS.find((p) => p.id === condition.participation)?.desc ?? ''}）`
    : '外出可能・一緒に積極的に遊べる（デフォルト）'

  const isSiblings = children.length > 1

  const fulltimeNotes =
    mode === 'fulltime'
      ? `
# 自宅保育版 追加指示
- 各提案に timeSlot（morning/afternoon/evening）を割り当て、一日全体をバランスよく提案してください
- 各提案に developmentArea を指定してください: ${DEVELOPMENT_AREA_IDS}
- 午前は活動的な遊び、午後は落ち着いた遊び、夕方は穏やかな遊びが理想的です`
      : ''

  const sugTemplate = suggestionTemplate(mode)

  return `あなたは子供の遊びの専門家です。以下の情報をもとに、各子供に合った遊びのアイデアを提案してください。

# 最重要ルール
- 各子供の年齢・発達段階に応じた**完全に異なる**遊びを提案してください
- 複数の子供がいる場合、同じタイトルや同じ内容の遊びを異なる子供に重複して提案しないでください
- 年齢差がある場合は特に、その子の月齢・年齢に特有の発達ニーズに合わせた遊びを選んでください

# 子供の情報
${childrenInfo}

# 手持ちのおもちゃ・素材
${toysInfo}

# 保護者の状況
${modeContext}
${conditionContext}
${fulltimeNotes}

# 提案の要件
${children
  .map(
    (c) => `
## ${c.name}の個人提案（${suggestionCount}案）
${c.name}（${(() => {
      const { years, months } = calcAge(c.birthDate)
      return years === 0 ? `${months}ヶ月` : `${years}歳`
    })()}）に合った遊び${suggestionCount}案`,
  )
  .join('\n')}

${isSiblings ? `## 兄弟・姉妹みんなで楽しめる遊び（${suggestionCount}案）\n全員が参加できる遊び${suggestionCount}案` : ''}

# 各提案フィールドの説明
- durationMinutes: 遊びの所要時間（分）。5/10/15/20/30/45/60のいずれか
- isIndoor: true=室内, false=屋外
- isQuiet: true=静かな遊び, false=活発な遊び
${mode === 'fulltime' ? `- timeSlot: "morning"/"afternoon"/"evening" のいずれか\n- developmentArea: ${DEVELOPMENT_AREA_IDS} のいずれか` : ''}

# 重要な考慮事項
- 子供の年齢・発達段階に合った安全な遊びを提案してください
- 手持ちのおもちゃや素材をできるだけ活用してください
- 参加度が「遊べない」の場合は子供が一人でできる遊びを優先
- 「外出したくない」の場合は室内遊びを優先
- 使い方モードに応じた遊びの長さ・難易度を考慮
- 鍛えたい能力がある場合はそれを伸ばせる遊びを優先

# 出力形式（必ずこのJSONで出力してください）
\`\`\`json
{
  "results": [
    ${children
      .map(
        (c) => `{
      "childId": "${c.id}",
      "childName": "${c.name}",
      "suggestions": [
        ${sugTemplate}
      ]
    }`,
      )
      .join(',\n    ')}${
    isSiblings
      ? `,
    {
      "childId": null,
      "childName": null,
      "suggestions": [
        ${sugTemplate}
      ]
    }`
      : ''
  }
  ]
}
\`\`\``
}

export async function generateSuggestions(
  apiKey: string,
  children: Child[],
  toys: Toy[],
  mode: AppMode,
  condition: ParentCondition | null,
  suggestionCount = 5,
): Promise<Suggestion[]> {
  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  })

  const checkedToys = toys.filter((t) => t.checked)
  const prompt = buildPrompt(children, checkedToys, mode ?? 'weekend', condition ?? null, suggestionCount)

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })

  const response = await stream.finalMessage()
  const text = response.content.find((b) => b.type === 'text')?.text ?? ''

  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('AIの応答を解析できませんでした')
  }

  const jsonStr = jsonMatch[1] ?? jsonMatch[0]
  const parsed = JSON.parse(jsonStr) as {
    results: Array<{
      childId: string | null
      childName: string | null
      suggestions: Array<{
        title: string
        description: string
        materials: string[]
        durationMinutes?: number
        isIndoor?: boolean
        isQuiet?: boolean
        timeSlot?: TimeSlot
        developmentArea?: string
      }>
    }>
  }

  const now = new Date().toISOString()
  const suggestions: Suggestion[] = []

  for (const group of parsed.results) {
    for (const s of group.suggestions) {
      suggestions.push({
        id: uuidv4(),
        childId: group.childId,
        childName: group.childName,
        title: s.title,
        description: s.description,
        materials: s.materials ?? [],
        favorite: false,
        createdAt: now,
        durationMinutes: s.durationMinutes,
        isIndoor: s.isIndoor,
        isQuiet: s.isQuiet,
        timeSlot: s.timeSlot,
        developmentArea: s.developmentArea,
      })
    }
  }

  return suggestions
}
