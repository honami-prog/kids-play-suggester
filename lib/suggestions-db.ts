import { v4 as uuidv4 } from 'uuid'
import type { Child, Toy, Suggestion, AppMode, ParentCondition, TimeSlot } from './types'
import { calcAge } from './types'

interface DBEntry {
  title: string
  description: string
  materials: string[]
  durationMinutes: number
  isIndoor: boolean
  isQuiet: boolean
  ageMinMonths: number
  ageMaxMonths: number
  toyKeywords?: string[]   // おもちゃ名に含まれるキーワード（あると加点）
  developmentArea: 'motor' | 'language' | 'cognitive' | 'social' | 'sensory'
  timeSlot?: TimeSlot
}

const DB: DBEntry[] = [
  // ── 0〜12ヶ月 ──────────────────────────────────────────────────
  {
    title: '鏡で「こんにちは」',
    description: '鏡の前に赤ちゃんを座らせ、自分の顔を見せてあげましょう。顔をくっつけたり離したりすると喜びます。表情を作って見せると反応が楽しいです。',
    materials: ['鏡'],
    durationMinutes: 5,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 2,
    ageMaxMonths: 12,
    developmentArea: 'social',
    timeSlot: 'morning',
  },
  {
    title: 'タオルいないいないばあ',
    description: 'タオルや布でパパ・ママの顔を隠し、「いないいない…ばあ！」と現れます。繰り返すうちに赤ちゃんが笑い出します。バリエーションとして赤ちゃんの顔を隠してもOK。',
    materials: ['タオル'],
    durationMinutes: 5,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 3,
    ageMaxMonths: 12,
    developmentArea: 'social',
    timeSlot: 'afternoon',
  },
  {
    title: 'ガラガラを振って音探し',
    description: 'ガラガラやおもちゃを赤ちゃんの視野の外で振り、音がした方向を目と顔で追わせます。左右上下バランスよく。追視と聴覚の発達を促します。',
    materials: ['ガラガラ'],
    durationMinutes: 5,
    isIndoor: true,
    isQuiet: false,
    ageMinMonths: 2,
    ageMaxMonths: 10,
    toyKeywords: ['ガラガラ', 'おもちゃ'],
    developmentArea: 'sensory',
    timeSlot: 'morning',
  },
  {
    title: 'うつぶせタイム',
    description: 'うつぶせにして目の前に興味を引くおもちゃを置き、首を持ち上げさせます。1日数回、1〜3分から始めて少しずつ延ばしましょう。体幹と首の筋肉が鍛えられます。',
    materials: [],
    durationMinutes: 5,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 2,
    ageMaxMonths: 9,
    developmentArea: 'motor',
    timeSlot: 'morning',
  },
  {
    title: 'ふれあい歌遊び',
    description: '「あがりめさがりめ」「このこどこのこ」など、手や足を優しく動かしながら歌います。目を合わせながらゆっくり行うと安心感が生まれます。',
    materials: [],
    durationMinutes: 10,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 1,
    ageMaxMonths: 18,
    developmentArea: 'social',
    timeSlot: 'afternoon',
  },
  {
    title: '感触ボックス探検',
    description: '箱の中にやわらかいスポンジ・ぬいぐるみ・つるつるしたプラスチックなど触感の異なるものを入れて、手で探らせます。様々な感触への興味を育てます。',
    materials: ['ぬいぐるみ'],
    durationMinutes: 10,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 5,
    ageMaxMonths: 18,
    toyKeywords: ['ぬいぐるみ', 'ボール'],
    developmentArea: 'sensory',
  },

  // ── 1〜2歳 ────────────────────────────────────────────────────
  {
    title: '積み木タワーくずし',
    description: '高く積み上げた積み木を「えい！」と崩す瞬間を一緒に楽しみます。積む→崩すを繰り返すうちに、自分でも積もうとし始めます。因果関係の学習になります。',
    materials: ['積み木'],
    durationMinutes: 15,
    isIndoor: true,
    isQuiet: false,
    ageMinMonths: 12,
    ageMaxMonths: 30,
    toyKeywords: ['積み木', 'ブロック', 'レゴ'],
    developmentArea: 'cognitive',
    timeSlot: 'morning',
  },
  {
    title: '段ボール箱の乗り物',
    description: '大きな段ボール箱に子供を乗せてガタゴト引っ張ります。箱に窓を描いて「電車ごっこ」「車ごっこ」にしても楽しいです。全身運動とごっこ遊びの入口になります。',
    materials: [],
    durationMinutes: 15,
    isIndoor: true,
    isQuiet: false,
    ageMinMonths: 12,
    ageMaxMonths: 36,
    developmentArea: 'motor',
  },
  {
    title: 'ボール転がしあい',
    description: '床に座って向かい合い、ボールを転がし合います。「どうぞ」「ありがとう」と声をかけながら行うと、やりとりの練習にもなります。距離を少しずつ離してみましょう。',
    materials: ['ボール'],
    durationMinutes: 10,
    isIndoor: true,
    isQuiet: false,
    ageMinMonths: 12,
    ageMaxMonths: 36,
    toyKeywords: ['ボール'],
    developmentArea: 'social',
  },
  {
    title: '水遊び（洗面台）',
    description: '洗面台やたらいに少量の水を張り、コップや容器で水を移し替えて遊びます。水の感触と、液体が形を変える不思議さを体験できます。着替えを用意しておきましょう。',
    materials: [],
    durationMinutes: 20,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 12,
    ageMaxMonths: 48,
    developmentArea: 'sensory',
    timeSlot: 'afternoon',
  },
  {
    title: 'シール貼り',
    description: '台紙からシールをはがして画用紙に貼ります。指先の練習になり、どこに貼るかを考える認知的な活動にもなります。大きめのシールから始めると貼りやすいです。',
    materials: ['色画用紙'],
    durationMinutes: 15,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 18,
    ageMaxMonths: 48,
    toyKeywords: ['シール', '色画用紙'],
    developmentArea: 'motor',
    timeSlot: 'morning',
  },
  {
    title: 'まねっこダンス',
    description: '大人が簡単な動き（手を振る・ジャンプ・体を揺らす）をして子供にまねさせます。音楽をかけながらやるとより楽しくなります。鏡の前でやると盛り上がります。',
    materials: [],
    durationMinutes: 10,
    isIndoor: true,
    isQuiet: false,
    ageMinMonths: 12,
    ageMaxMonths: 36,
    developmentArea: 'motor',
    timeSlot: 'afternoon',
  },
  {
    title: '絵本読み聞かせ',
    description: 'お気に入りの絵本を読みます。同じ本を何度読んでもOK。繰り返すことで言葉を覚えます。ページをめくらせたり、絵の中のものを指さして「これは？」と聞いてみましょう。',
    materials: ['絵本'],
    durationMinutes: 10,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 6,
    ageMaxMonths: 999,
    toyKeywords: ['絵本'],
    developmentArea: 'language',
    timeSlot: 'evening',
  },
  {
    title: 'お砂場遊び',
    description: '砂場でスコップを使って掘ったり山を作ったり。容器に砂を入れてひっくり返してケーキを作るのも楽しいです。手や足の感触刺激と、空間認識力が育ちます。',
    materials: [],
    durationMinutes: 30,
    isIndoor: false,
    isQuiet: true,
    ageMinMonths: 12,
    ageMaxMonths: 72,
    developmentArea: 'sensory',
  },

  // ── 2〜3歳 ────────────────────────────────────────────────────
  {
    title: 'クレヨンお絵かき',
    description: '大きな紙にクレヨンで自由に描かせます。何を描いたか聞いて「〇〇上手だね！」と共感しましょう。丸・線など簡単な形を一緒に描くと喜びます。',
    materials: ['クレヨン', '色画用紙'],
    durationMinutes: 20,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 18,
    ageMaxMonths: 60,
    toyKeywords: ['クレヨン', '色画用紙', '絵の具'],
    developmentArea: 'motor',
    timeSlot: 'morning',
  },
  {
    title: 'ままごとごっこ',
    description: 'おもちゃの食器やぬいぐるみを使って、料理を作って食べさせるごっこ遊びをします。「お腹すいた〜」「美味しい！」など声かけすると会話が広がります。',
    materials: ['ぬいぐるみ'],
    durationMinutes: 20,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 18,
    ageMaxMonths: 60,
    toyKeywords: ['ぬいぐるみ', '人形'],
    developmentArea: 'social',
    timeSlot: 'afternoon',
  },
  {
    title: '粘土こねこね',
    description: '粘土をちぎる・丸める・伸ばすなど自由に触らせます。「蛇を作ろう」「おにぎり作ろう」など声をかけると発展します。指先と手のひら全体を使うのでとても良い刺激になります。',
    materials: ['粘土'],
    durationMinutes: 20,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 24,
    ageMaxMonths: 72,
    toyKeywords: ['粘土'],
    developmentArea: 'motor',
    timeSlot: 'morning',
  },
  {
    title: 'お散歩虫探し',
    description: '公園や庭でダンゴムシ・アリ・チョウなどを探します。「あそこに何かいる！」と一緒に探す過程が楽しいです。虫眼鏡があればさらに観察が深まります。',
    materials: [],
    durationMinutes: 30,
    isIndoor: false,
    isQuiet: true,
    ageMinMonths: 24,
    ageMaxMonths: 84,
    developmentArea: 'cognitive',
  },
  {
    title: 'ブロックで街づくり',
    description: 'レゴや大型ブロックで家・道・橋などを作り「街」を作ります。ミニカーや人形を置いてごっこ遊びに発展させましょう。試行錯誤と達成感が育ちます。',
    materials: ['レゴ', 'ミニカー'],
    durationMinutes: 30,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 24,
    ageMaxMonths: 84,
    toyKeywords: ['レゴ', 'ブロック', '積み木', 'ミニカー'],
    developmentArea: 'cognitive',
    timeSlot: 'afternoon',
  },
  {
    title: '折り紙で動物',
    description: '簡単な折り紙（犬・猫・船など）を一緒に折ります。2〜3歳は折る真似だけでもOK。できた作品に目をペンで描くと喜びます。手順を理解する認知力が育ちます。',
    materials: ['折り紙'],
    durationMinutes: 15,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 30,
    ageMaxMonths: 999,
    toyKeywords: ['折り紙'],
    developmentArea: 'motor',
    timeSlot: 'afternoon',
  },
  {
    title: 'ジャンプ遊び',
    description: '床にテープで丸や四角を貼り、「ここに飛んで！」「赤に乗って！」と指示します。ジャンプ力と指示を聞く集中力、色や形の認識を同時に鍛えられます。',
    materials: [],
    durationMinutes: 15,
    isIndoor: true,
    isQuiet: false,
    ageMinMonths: 24,
    ageMaxMonths: 60,
    developmentArea: 'motor',
    timeSlot: 'morning',
  },

  // ── 3〜5歳 ────────────────────────────────────────────────────
  {
    title: '絵の具スタンプアート',
    description: '野菜の切り口（レンコン・ブロッコリー・オクラなど）に絵の具をつけて紙に押します。偶然生まれる模様を楽しみます。スポンジや毛糸でもできます。',
    materials: ['絵の具', '色画用紙'],
    durationMinutes: 30,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 30,
    ageMaxMonths: 84,
    toyKeywords: ['絵の具', '色画用紙'],
    developmentArea: 'sensory',
    timeSlot: 'morning',
  },
  {
    title: 'パズル挑戦',
    description: '年齢に合ったピースのパズルを一緒に組みます。最初は角から探す方法を教えてあげましょう。できたら「もう1回やる！」と言うほど夢中になります。',
    materials: ['パズル'],
    durationMinutes: 20,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 30,
    ageMaxMonths: 999,
    toyKeywords: ['パズル'],
    developmentArea: 'cognitive',
    timeSlot: 'afternoon',
  },
  {
    title: 'しっぽ取り鬼ごっこ',
    description: 'タオルをズボンに挟んで「しっぽ」にし、お互いに取り合います。室内でも広めのスペースがあれば楽しめます。ルールを守る練習とダッシュの運動になります。',
    materials: ['タオル'],
    durationMinutes: 15,
    isIndoor: true,
    isQuiet: false,
    ageMinMonths: 36,
    ageMaxMonths: 84,
    developmentArea: 'social',
    timeSlot: 'afternoon',
  },
  {
    title: '手作りすごろく',
    description: '画用紙にマス目を描き、「3歩進む」「1回休み」などを書いたすごろくを作ります。作る過程も遊び。サイコロはハンカチを丸めて6面に数字を書いてもOK。',
    materials: ['色画用紙', 'クレヨン'],
    durationMinutes: 45,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 48,
    ageMaxMonths: 999,
    toyKeywords: ['色画用紙', 'クレヨン'],
    developmentArea: 'cognitive',
    timeSlot: 'afternoon',
  },
  {
    title: '新聞紙ボール合戦',
    description: '新聞紙を丸めてボールを大量に作り、部屋の真ん中に線を引いて相手陣地に投げ合います。時間内に自陣の数を少なくした方が勝ち。発散したいときに最適です。',
    materials: ['新聞紙'],
    durationMinutes: 15,
    isIndoor: true,
    isQuiet: false,
    ageMinMonths: 36,
    ageMaxMonths: 999,
    toyKeywords: ['新聞紙'],
    developmentArea: 'motor',
    timeSlot: 'afternoon',
  },
  {
    title: 'シャボン玉',
    description: '外でシャボン玉を吹いて追いかけます。どこまで飛ぶか、大きいのはどっちか競います。うちわであおいで遠くまで飛ばすのも楽しいです。',
    materials: ['シャボン玉'],
    durationMinutes: 20,
    isIndoor: false,
    isQuiet: false,
    ageMinMonths: 24,
    ageMaxMonths: 84,
    toyKeywords: ['シャボン玉'],
    developmentArea: 'motor',
  },
  {
    title: 'お店屋さんごっこ',
    description: 'おもちゃやぬいぐるみを商品に見立てて「お店屋さん」を開きます。折り紙でお金を作り、「いらっしゃいませ」「〇〇円です」と言葉のやり取りを楽しみます。',
    materials: ['ぬいぐるみ', '折り紙'],
    durationMinutes: 30,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 36,
    ageMaxMonths: 84,
    toyKeywords: ['ぬいぐるみ', '折り紙', '人形'],
    developmentArea: 'language',
    timeSlot: 'afternoon',
  },
  {
    title: '縄跳び・フープ',
    description: '縄跳びやフープを使ってジャンプ・くぐる・回すなど様々な使い方を試します。回数を数えて記録を伸ばすゲームにしてもよいでしょう。',
    materials: ['縄跳び'],
    durationMinutes: 20,
    isIndoor: false,
    isQuiet: false,
    ageMinMonths: 36,
    ageMaxMonths: 999,
    toyKeywords: ['縄跳び', 'フープ', 'なわとび'],
    developmentArea: 'motor',
  },
  {
    title: '影絵シアター',
    description: '暗い部屋で懐中電灯を壁に向け、手で動物の影を作ります。うさぎ・犬・鳥など形を変えて見せ、子供にも挑戦させましょう。劇仕立てにすると盛り上がります。',
    materials: [],
    durationMinutes: 20,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 30,
    ageMaxMonths: 84,
    developmentArea: 'cognitive',
    timeSlot: 'evening',
  },
  {
    title: 'ミニカーコース作り',
    description: '積み木や本を使って坂道やトンネルを作り、ミニカーを走らせます。「ここに曲がり角を作ろう」「トンネルを作ろう」と相談しながら進めるのが楽しいです。',
    materials: ['ミニカー', '積み木'],
    durationMinutes: 30,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 24,
    ageMaxMonths: 84,
    toyKeywords: ['ミニカー', '積み木', 'レゴ'],
    developmentArea: 'cognitive',
    timeSlot: 'afternoon',
  },

  // ── 5歳以上 ───────────────────────────────────────────────────
  {
    title: '手紙・カード作り',
    description: '家族や友達への手紙や誕生日カードを作ります。折り紙で飾り付けし、絵を描いたりメッセージを書いたり。渡す相手への想像力と文字への関心が育ちます。',
    materials: ['折り紙', '色画用紙', 'クレヨン'],
    durationMinutes: 30,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 48,
    ageMaxMonths: 999,
    toyKeywords: ['折り紙', '色画用紙', 'クレヨン'],
    developmentArea: 'language',
    timeSlot: 'afternoon',
  },
  {
    title: '科学実験：重曹と酢',
    description: '重曹に酢を注いでシュワシュワさせる実験をします。食紅で色をつけたり、洗い物かごの中でやるとより安全です。「なんで泡が出るの？」という疑問を大切にしましょう。',
    materials: [],
    durationMinutes: 20,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 48,
    ageMaxMonths: 999,
    developmentArea: 'cognitive',
    timeSlot: 'morning',
  },
  {
    title: 'バランスボード遊び',
    description: 'バランスボードや固めのクッションの上に立ち、バランスを保ちながら遊びます。「10秒立てるかな？」「片足で立ってみよう」と挑戦を増やしていきます。',
    materials: ['バランスボード'],
    durationMinutes: 15,
    isIndoor: true,
    isQuiet: false,
    ageMinMonths: 36,
    ageMaxMonths: 999,
    toyKeywords: ['バランスボード'],
    developmentArea: 'motor',
    timeSlot: 'morning',
  },
  {
    title: 'なぞなぞ大会',
    description: '子供向けなぞなぞを出し合います。最初は大人が出して、正解を教えてあげましょう。慣れてきたら子供が自分でなぞなぞを作って出す側に回れます。',
    materials: [],
    durationMinutes: 15,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 48,
    ageMaxMonths: 999,
    developmentArea: 'language',
    timeSlot: 'evening',
  },
  {
    title: '新聞紙ファッションショー',
    description: '新聞紙をテープで留めてドレスや帽子を作り、ファッションショーをします。デザインを考える想像力と、紙を切ったり折ったりする手先の器用さが育ちます。',
    materials: ['新聞紙'],
    durationMinutes: 45,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 48,
    ageMaxMonths: 999,
    toyKeywords: ['新聞紙'],
    developmentArea: 'cognitive',
    timeSlot: 'afternoon',
  },
  {
    title: '外でボール蹴り',
    description: '公園でボールを蹴って遊びます。コーンや石を並べてドリブルコースを作ったり、ゴールを決めてシュート練習をしたりと展開できます。',
    materials: ['ボール'],
    durationMinutes: 30,
    isIndoor: false,
    isQuiet: false,
    ageMinMonths: 24,
    ageMaxMonths: 999,
    toyKeywords: ['ボール'],
    developmentArea: 'motor',
  },
  {
    title: '俳句・短歌遊び',
    description: '5・7・5のリズムで俳句を作ります。「今日見たもの」「好きな食べ物」をテーマにするとやりやすいです。大人も一緒に作って比べ合うと楽しくなります。',
    materials: [],
    durationMinutes: 20,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 60,
    ageMaxMonths: 999,
    developmentArea: 'language',
    timeSlot: 'evening',
  },
  {
    title: '工作：貯金箱',
    description: 'ペットボトルや空き缶に折り紙や画用紙を貼り付けてオリジナル貯金箱を作ります。硬貨を入れる穴をカッターで開ける工程は大人が担当します。完成したら実際に使えます。',
    materials: ['折り紙', '色画用紙'],
    durationMinutes: 45,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 60,
    ageMaxMonths: 999,
    toyKeywords: ['折り紙', '色画用紙'],
    developmentArea: 'motor',
    timeSlot: 'afternoon',
  },

  // ── 道具不要・どの年齢でも ────────────────────────────────────
  {
    title: 'お布団山登り',
    description: '重ねたお布団や座布団の山を登り下りします。ソファのクッションを積んでも楽しいです。体幹と四肢をバランスよく使う運動です。',
    materials: [],
    durationMinutes: 10,
    isIndoor: true,
    isQuiet: false,
    ageMinMonths: 10,
    ageMaxMonths: 60,
    developmentArea: 'motor',
    timeSlot: 'morning',
  },
  {
    title: '「なんの音？」当てっこ',
    description: '目を閉じてもらい、家の中のものの音（水の音・鍵の音・手をたたく音など）を当ててもらいます。子供が出題する側になっても楽しいです。',
    materials: [],
    durationMinutes: 10,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 24,
    ageMaxMonths: 999,
    developmentArea: 'sensory',
    timeSlot: 'evening',
  },
  {
    title: 'ダンボールスライダー',
    description: '大きなダンボール箱を分解して傾斜をつけ、スライダーを作ります。玄関の段差などを使うと傾斜が作りやすいです。スライムや人形を滑らせるだけでも楽しいです。',
    materials: [],
    durationMinutes: 30,
    isIndoor: true,
    isQuiet: false,
    ageMinMonths: 18,
    ageMaxMonths: 60,
    developmentArea: 'motor',
  },
  {
    title: 'たんぽぽ・草花で花束',
    description: '公園で好きな草花を摘んで花束を作ります。家に帰ってコップに水を入れて飾りましょう。「これは何という花？」と名前を調べるのも良いきっかけになります。',
    materials: [],
    durationMinutes: 30,
    isIndoor: false,
    isQuiet: true,
    ageMinMonths: 24,
    ageMaxMonths: 999,
    developmentArea: 'sensory',
  },
  {
    title: '「大きい順・小さい順」並べ替え',
    description: 'おもちゃや本を大きい順・小さい順に並べます。次に色の系統でグループ分けしてみます。分類・比較の論理的思考の基礎を楽しみながら学べます。',
    materials: [],
    durationMinutes: 10,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 30,
    ageMaxMonths: 72,
    developmentArea: 'cognitive',
    timeSlot: 'morning',
  },
  {
    title: 'てるてる坊主作り',
    description: 'ティッシュやハンカチで丸を作り、紐で縛ってかわいい顔を描きます。窓に吊るして「明日晴れますように」とお願いします。天気への興味と工作を同時に楽しめます。',
    materials: [],
    durationMinutes: 10,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 24,
    ageMaxMonths: 72,
    developmentArea: 'motor',
    timeSlot: 'afternoon',
  },
  {
    title: '氷を触ってみよう',
    description: '製氷皿で作った氷を触って感触を楽しみます。塩をかけると溶ける早さが変わることを観察したり、食紅で色をつけた氷でお絵かきしたりできます。',
    materials: [],
    durationMinutes: 15,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 18,
    ageMaxMonths: 84,
    developmentArea: 'sensory',
    timeSlot: 'afternoon',
  },
  {
    title: '全身で色塗り（模造紙遊び）',
    description: '大きな紙を床に広げ、手足に絵の具をつけてスタンプします。足の形や手の形が残るのを喜びます。風呂の前にやるとあと片付けが楽です。',
    materials: ['絵の具'],
    durationMinutes: 30,
    isIndoor: true,
    isQuiet: false,
    ageMinMonths: 18,
    ageMaxMonths: 60,
    toyKeywords: ['絵の具'],
    developmentArea: 'sensory',
    timeSlot: 'afternoon',
  },
  {
    title: '「今日のできた！」日記',
    description: '今日できたことや楽しかったことを絵や文で紙に書きます。5歳未満は絵だけでもOK。毎日続けると成長記録になり、振り返る楽しさが生まれます。',
    materials: ['クレヨン', '色画用紙'],
    durationMinutes: 10,
    isIndoor: true,
    isQuiet: true,
    ageMinMonths: 36,
    ageMaxMonths: 999,
    toyKeywords: ['クレヨン', '色画用紙'],
    developmentArea: 'language',
    timeSlot: 'evening',
  },
]

// ── フィルタリング・スコアリング ─────────────────────────────────

function toyScore(entry: DBEntry, availableToyNames: string[]): number {
  if (!entry.toyKeywords || entry.toyKeywords.length === 0) return 0
  const matches = entry.toyKeywords.filter((kw) =>
    availableToyNames.some((name) => name.includes(kw) || kw.includes(name)),
  )
  return matches.length
}

export function pickFromDB(
  child: Child,
  toys: Toy[],
  mode: AppMode,
  condition: ParentCondition | null,
  count: number,
  isGroup = false,
): Suggestion[] {
  const { years, months } = calcAge(child.birthDate)
  const ageMonths = years * 12 + months

  const availableToyNames = toys.filter((t) => t.checked).map((t) => t.name)

  const canGoOutside = condition?.canGoOutside ?? true
  const participation = condition?.participation ?? 'active'
  const unavailable = participation === 'unavailable'

  // フィルタ
  let pool = DB.filter((e) => {
    if (ageMonths < e.ageMinMonths || ageMonths > e.ageMaxMonths) return false
    if (!canGoOutside && !e.isIndoor) return false
    if (unavailable && !e.isQuiet) return false
    // 道具が必要なのに在庫がない場合は除外
    if (e.materials.length > 0 && availableToyNames.length > 0) {
      const needsUnavailable = e.materials.some(
        (m) =>
          toys.some((t) => (t.name.includes(m) || m.includes(t.name)) && !t.checked),
      )
      if (needsUnavailable) return false
    }
    return true
  })

  // モード別フィルタ
  if (mode === 'working') {
    pool = pool.filter((e) => e.durationMinutes <= 20)
  }

  // スコアリング（おもちゃマッチ・モード適合）
  const scored = pool.map((e) => {
    let score = toyScore(e, availableToyNames)
    if (mode === 'working' && e.isQuiet) score += 1
    if (mode === 'working' && e.materials.length === 0) score += 1
    // ランダム性を加えてシャッフル効果
    score += Math.random() * 2
    return { entry: e, score }
  })

  scored.sort((a, b) => b.score - a.score)

  const picked = scored.slice(0, Math.min(count * 3, scored.length))
  // さらにランダムに並べ替えて多様性を出す
  picked.sort(() => Math.random() - 0.5)
  const selected = picked.slice(0, count)

  const now = new Date().toISOString()

  return selected.map((item) => {
    const e = item.entry
    return {
      id: uuidv4(),
      childId: isGroup ? null : child.id,
      childName: isGroup ? null : child.name,
      title: e.title,
      description: e.description,
      materials: e.materials,
      favorite: false,
      createdAt: now,
      durationMinutes: e.durationMinutes,
      isIndoor: e.isIndoor,
      isQuiet: e.isQuiet,
      timeSlot: (mode === 'fulltime' ? e.timeSlot : undefined) as TimeSlot | undefined,
      developmentArea: e.developmentArea,
    }
  })
}

export function generateFromDB(
  children: Child[],
  toys: Toy[],
  mode: AppMode,
  condition: ParentCondition | null,
  count: number,
): Suggestion[] {
  const results: Suggestion[] = []

  for (const child of children) {
    const suggestions = pickFromDB(child, toys, mode, condition, count)
    results.push(...suggestions)
  }

  // 兄弟共通（複数いる場合）
  if (children.length > 1) {
    // 全員の年齢の中間を代表として使う
    const avgMonths = children.reduce((sum, c) => {
      const { years, months } = calcAge(c.birthDate)
      return sum + years * 12 + months
    }, 0) / children.length
    const representative = children.reduce((closest, c) => {
      const { years, months } = calcAge(c.birthDate)
      const m = years * 12 + months
      const { years: cy, months: cm } = calcAge(closest.birthDate)
      return Math.abs(m - avgMonths) < Math.abs(cy * 12 + cm - avgMonths) ? c : closest
    })
    const groupSuggestions = pickFromDB(representative, toys, mode, condition, count, true)
    results.push(...groupSuggestions)
  }

  return results
}
