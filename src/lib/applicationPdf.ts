import type { EducationRow, EmploymentRow } from '../data/applicationForm'

/* Generates the completed 中国·留学生申请表 / Application Form for Foreign
   Students as a PDF that follows the university template's bilingual layout.

   PDF's built-in fonts cannot show Chinese, so each page is drawn with the
   browser's own text engine (which has CJK fonts) and embedded into the PDF.
   Plain document styling only: black text on white, ruled tables. */

export interface ApplicationPdfInput {
  reference: string
  scholarshipTitle: string
  levelLabel: string
  form: Record<string, string>
  education: EducationRow[]
  employment: EmploymentRow[]
  documents: string[]
}

/* A4 at 150 dpi. */
const PAGE_W = 1240
const PAGE_H = 1754
const MARGIN = 70
const CONTENT_W = PAGE_W - MARGIN * 2

const FONT = '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", SimSun, Arial, sans-serif'
const INK = '#000000'
const RULE = '#7a7a7a'
const BAND = '#e8e8e8'
const LABEL_BG = '#f4f4f4'

const ymd = (iso: string) => {
  const [y, m, d] = (iso ?? '').split('-')
  return y && m && d ? `${y} 年 ${m} 月 ${d} 日` : (iso ?? '')
}

const options = (pairs: [string, string][], selected: string) =>
  pairs.map(([zh, en]) => `${zh}/${en} (${en === selected ? '√' : '   '})`).join('    ')

const box = (label: string, checked: boolean) => `${checked ? '☑' : '□'} ${label}`

class Doc {
  pages: HTMLCanvasElement[] = []
  ctx!: CanvasRenderingContext2D
  y = MARGIN

  constructor() {
    this.newPage()
  }

  newPage() {
    const c = document.createElement('canvas')
    c.width = PAGE_W
    c.height = PAGE_H
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, PAGE_W, PAGE_H)
    ctx.textBaseline = 'top'
    this.pages.push(c)
    this.ctx = ctx
    this.y = MARGIN
  }

  need(h: number) {
    if (this.y + h > PAGE_H - MARGIN) this.newPage()
  }

  font(size: number, bold = false) {
    this.ctx.font = `${bold ? '600 ' : ''}${size}px ${FONT}`
  }

  wrap(text: string, maxWidth: number, size: number, bold = false): string[] {
    this.font(size, bold)
    const words = String(text ?? '').split(/(\s+)/)
    const lines: string[] = []
    let line = ''
    for (const w of words) {
      const test = line + w
      /* Chinese has no spaces, so fall back to breaking per character. */
      if (this.ctx.measureText(test).width > maxWidth && line) {
        lines.push(line.trimEnd())
        line = w.trimStart()
        while (this.ctx.measureText(line).width > maxWidth && line.length > 1) {
          let cut = line.length - 1
          while (cut > 1 && this.ctx.measureText(line.slice(0, cut)).width > maxWidth) cut--
          lines.push(line.slice(0, cut))
          line = line.slice(cut)
        }
      } else {
        line = test
      }
    }
    if (line.trim()) lines.push(line.trim())
    return lines.length > 0 ? lines : ['']
  }

  title(zh: string, en: string) {
    this.need(120)
    this.font(34, true)
    this.ctx.fillStyle = INK
    this.ctx.textAlign = 'center'
    this.ctx.fillText(zh, PAGE_W / 2, this.y)
    this.y += 46
    this.font(22, true)
    this.ctx.fillText(en, PAGE_W / 2, this.y)
    this.ctx.textAlign = 'left'
    this.y += 48
  }

  band(text: string) {
    const h = 46
    this.need(h + 30)
    this.ctx.fillStyle = BAND
    this.ctx.fillRect(MARGIN, this.y, CONTENT_W, h)
    this.ctx.strokeStyle = RULE
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(MARGIN + 0.5, this.y + 0.5, CONTENT_W - 1, h - 1)
    this.font(19, true)
    this.ctx.fillStyle = INK
    this.ctx.fillText(text, MARGIN + 16, this.y + 13)
    this.y += h
  }

  /* Label / value row with generous padding so answers are easy to read. */
  kv(label: string, value: string, labelW = 380) {
    const size = 17
    const padX = 16
    const padY = 16
    const valueW = CONTENT_W - labelW - padX * 2
    const labelLines = this.wrap(label, labelW - padX * 2, size, true)
    const valueLines = this.wrap(value || '—', valueW, size)
    const lineH = 26
    const h = Math.max(labelLines.length, valueLines.length) * lineH + padY * 2

    this.need(h)
    const top = this.y

    this.ctx.fillStyle = LABEL_BG
    this.ctx.fillRect(MARGIN, top, labelW, h)
    this.ctx.strokeStyle = RULE
    this.ctx.lineWidth = 1
    this.ctx.strokeRect(MARGIN + 0.5, top + 0.5, labelW, h)
    this.ctx.strokeRect(MARGIN + labelW + 0.5, top + 0.5, CONTENT_W - labelW - 1, h)

    this.ctx.fillStyle = INK
    this.font(size, true)
    labelLines.forEach((l, i) => this.ctx.fillText(l, MARGIN + padX, top + padY + i * lineH))
    this.font(size)
    valueLines.forEach((l, i) =>
      this.ctx.fillText(l, MARGIN + labelW + padX, top + padY + i * lineH),
    )

    this.y = top + h
  }

  table(headers: string[], rows: string[][], widths: number[]) {
    const size = 16
    const padX = 14
    const padY = 14
    const lineH = 24
    const cols = widths.map((w) => Math.round((w / 100) * CONTENT_W))

    const drawRow = (cells: string[], bold: boolean, bg?: string) => {
      const wrapped = cells.map((c, i) => this.wrap(c || '—', cols[i] - padX * 2, size, bold))
      const h = Math.max(...wrapped.map((w) => w.length)) * lineH + padY * 2
      this.need(h)
      const top = this.y
      let x = MARGIN
      wrapped.forEach((lines, i) => {
        if (bg) {
          this.ctx.fillStyle = bg
          this.ctx.fillRect(x, top, cols[i], h)
        }
        this.ctx.strokeStyle = RULE
        this.ctx.lineWidth = 1
        this.ctx.strokeRect(x + 0.5, top + 0.5, cols[i], h)
        this.ctx.fillStyle = INK
        this.font(size, bold)
        lines.forEach((l, j) => this.ctx.fillText(l, x + padX, top + padY + j * lineH))
        x += cols[i]
      })
      this.y = top + h
    }

    drawRow(headers, true, LABEL_BG)
    if (rows.length === 0) drawRow(headers.map(() => ''), false)
    else rows.forEach((r) => drawRow(r, false))
  }

  paragraph(text: string, size = 17, bold = false, gap = 10) {
    const lines = this.wrap(text, CONTENT_W, size, bold)
    const lineH = Math.round(size * 1.6)
    this.need(lines.length * lineH + gap)
    this.ctx.fillStyle = INK
    this.font(size, bold)
    lines.forEach((l, i) => this.ctx.fillText(l, MARGIN, this.y + i * lineH))
    this.y += lines.length * lineH + gap
  }

  space(h = 22) {
    this.y += h
  }
}

/* ---- PDF assembly: one JPEG-backed page per canvas ---- */

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

function toPdf(pages: HTMLCanvasElement[]): Blob {
  const W = 595.28
  const H = 841.89
  const objects: string[] = []
  const binary: Record<number, Uint8Array> = {}

  const pageIds: number[] = []
  let next = 3
  const images: { id: number; bytes: Uint8Array; w: number; h: number }[] = []

  for (const canvas of pages) {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.94)
    const bytes = base64ToBytes(dataUrl.split(',')[1])
    const pageId = next++
    const contentId = next++
    const imageId = next++
    pageIds.push(pageId)
    images.push({ id: imageId, bytes, w: canvas.width, h: canvas.height })

    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] ` +
      `/Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`
    const stream = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
    objects[imageId] = '__IMAGE__'
    binary[imageId] = bytes
  }

  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((i) => `${i} 0 R`).join(' ')}] /Count ${pageIds.length} >>`

  const chunks: Uint8Array[] = []
  const enc = new TextEncoder()
  let length = 0
  const push = (s: string | Uint8Array) => {
    const b = typeof s === 'string' ? enc.encode(s) : s
    chunks.push(b)
    length += b.length
    return b.length
  }

  push('%PDF-1.4\n')
  const offsets: number[] = []
  const maxObj = objects.length - 1
  for (let i = 1; i <= maxObj; i++) {
    if (!objects[i]) continue
    offsets[i] = length
    if (objects[i] === '__IMAGE__') {
      const img = images.find((x) => x.id === i)!
      push(
        `${i} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} ` +
          `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.bytes.length} >>\nstream\n`,
      )
      push(img.bytes)
      push('\nendstream\nendobj\n')
    } else {
      push(`${i} 0 obj\n${objects[i]}\nendobj\n`)
    }
  }

  const xref = length
  let table = `xref\n0 ${maxObj + 1}\n0000000000 65535 f \n`
  for (let i = 1; i <= maxObj; i++) {
    table += String(offsets[i] ?? 0).padStart(10, '0') + ' 00000 n \n'
  }
  table += `trailer\n<< /Size ${maxObj + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  push(table)

  const all = new Uint8Array(length)
  let pos = 0
  for (const c of chunks) {
    all.set(c, pos)
    pos += c.length
  }
  return new Blob([all.buffer as ArrayBuffer], { type: 'application/pdf' })
}

export function buildApplicationPdf(input: ApplicationPdfInput): Blob {
  const f = input.form
  const d = new Doc()

  d.title('中国·留学生申请表', 'Application Form for Foreign Students')

  d.band('申请人基本情况 / Personal Information')
  d.kv('姓 / Surname', f.surname)
  d.kv('名 / Given name', f.givenName)
  d.kv('中文名字 / Chinese Name', f.chineseName)
  d.kv('性别 / Gender', f.sex)
  d.kv('国籍 / Nationality', f.nationality)
  d.kv('母语 / Native language', f.nativeLanguage)
  d.kv('护照号码 / Passport No.', f.passportNo)
  d.kv('民族 / Religion', f.religion)
  d.kv('婚否 / Marital Status', f.maritalStatus)
  d.kv('出生地点 / Place of Birth', [f.placeOfBirth, f.countryOfBirth].filter(Boolean).join(', '))
  d.kv('出生日期 / Date of Birth', ymd(f.dob))
  d.kv('护照签发日期 / Passport Issue Date', ymd(f.passportIssueDate))
  d.kv('护照有效期 / Passport Expiry Date', ymd(f.passportExpiry))
  d.kv('身份证号码 / National ID No.', f.idnum)
  d.kv('目前居住地 / Place of residence at present', f.currentAddress)
  d.kv('职业 / Occupation', f.occupation)
  d.kv('最后学历 / Education level', f.educationLevel)
  d.kv('工作或学习单位 / Employer or Institution Affiliated', f.employerInstitution)
  d.kv(
    '永久通信地址 / Permanent Address for correspondence',
    [
      f.permanentAddress,
      f.addressContactPerson ? `联系人/Contact: ${f.addressContactPerson}` : '',
      f.addressContactPhone ? `电话/Tel: ${f.addressContactPhone}` : '',
    ]
      .filter(Boolean)
      .join('  ·  '),
  )
  d.kv('本人电话 / Telephone', [f.phone, f.whatsapp ? `WhatsApp: ${f.whatsapp}` : ''].filter(Boolean).join('  ·  '))
  d.kv('电子邮箱 / Email', f.email)
  d.space()

  d.band('汉语能力 / Chinese Proficiency')
  d.kv(
    '水平 / Level',
    options(
      [
        ['很好', 'Excellent'],
        ['好', 'Good'],
        ['较好', 'Fair'],
        ['差', 'Poor'],
        ['不会', 'None'],
      ],
      f.chineseProficiency,
    ),
  )
  d.kv(
    '老（新）HSK证书 / Old (New) HSK Certificate',
    `${f.hskLevel && f.hskLevel !== 'None' ? f.hskLevel.replace('HSK ', '') : '—'} 级 / Level      ${f.hskMarks || '—'} 分 / Marks`,
  )
  d.space()

  d.band('教育经历（从高中起） / Academic Background (From Junior School)')
  d.table(
    ['在校期间 (From/To)', '学校 (Institutions)', '所获学历 (Diploma/Degree Obtained)'],
    input.education
      .filter((e) => e.school.trim())
      .map((e) => [
        [e.from, e.to].filter(Boolean).join(' — '),
        e.school,
        [e.qualification, e.grades].filter(Boolean).join(', '),
      ]),
    [24, 40, 36],
  )
  d.space()

  d.band('本人工作经历 / Employment Record')
  d.table(
    ['起止时间 (From/To)', '工作单位 (Employer)', '职务及职称 (Posts Held)'],
    input.employment
      .filter((e) => e.employer.trim())
      .map((e) => [[e.from, e.to].filter(Boolean).join(' — '), e.employer, e.post]),
    [24, 40, 36],
  )
  d.space()

  d.band('申请人亲属情况 / Family Members of the Applicants')
  d.table(
    ['关系 / Relation', '姓名 / Name', '职业 / Occupation', '联系电话 / Telephone'],
    [
      ['父亲 / Father', f.fatherName, f.fatherOccupation, f.fatherPhone],
      ['母亲 / Mother', f.motherName, f.motherOccupation, f.motherPhone],
      ['配偶 / Spouse', f.spouseName, f.spouseOccupation, f.spousePhone],
    ],
    [22, 30, 24, 24],
  )
  d.space()

  d.band('留学中国计划 / Study plan in China')
  d.kv('希望在中国学习的专业或专题 / Specialty or Topic you want to study in China', f.course)
  d.kv(
    '学生类别 / Student Status',
    [
      box('语言生/Language Students', f.studentStatus === 'Language student'),
      box('本科生/Undergraduate', f.studentStatus === 'Undergraduate'),
      box('普通进修生/General advanced', f.studentStatus === 'General advanced student'),
      box("硕士研究生/Master's program", f.studentStatus === "Master's program"),
      box("博士研究生/Doctor's program", f.studentStatus === "Doctor's program"),
      box('高级进修生/Senior advanced', f.studentStatus === 'Senior advanced student'),
    ].join('    '),
  )
  d.kv('授课语言 / Language of teaching', f.teachingMedium)
  d.kv('学习期限 / Duration', `自/from: ${f.durationFrom || '—'}      至/to: ${f.durationTo || '—'}`)
  d.kv(
    '经费来源 / Financial Support',
    options(
      [
        ['团体资助', 'Organization'],
        ['家庭资助', 'Family'],
        ['个人支付', 'Self-support'],
      ],
      f.financialSupport,
    ),
  )
  d.kv(
    '就读大学志愿 / University preferences',
    [f.university1, f.university2, f.university3].filter(Boolean).join('; ') ||
      '由代理机构安排 / To be arranged by the agency',
  )
  d.space()

  d.band('申请人保证 / I hereby affirm that')
  d.space(12)
  d.paragraph(
    '1. 上述各项中所提供的情况是真实无误的。 / All the information I provided above is true and correct.',
  )
  d.paragraph(
    '2. 在校学习期间遵守中国政府的法规和学校的规章和制度。 / I shall abide by the laws of the Chinese Government and the regulations of the university.',
  )
  d.space(14)
  d.kv(
    '日期 / Date',
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
  )
  d.kv('申请人签字 / Applicant’s signature', f.signature || [f.surname, f.givenName].filter(Boolean).join(' '))
  d.space(16)
  d.paragraph(
    `参考编号 / Reference: ${input.reference}   ·   通过 studyinchinanow.com 在线填写 / Completed online at studyinchinanow.com`,
    13,
  )

  /* ---- Annex: everything collected that the official form has no box for.
     Kept on its own page so the form above stays faithful to the template. ---- */
  d.newPage()
  d.title('附加信息', 'Additional Information Supplied by the Applicant')
  d.paragraph(
    '以下信息由申请人在线提供，正式申请表中无对应栏目。 / The applicant supplied the following through the online application. The official form above has no field for it.',
    14,
  )
  d.space(10)

  d.band('申请项目 / Application')
  d.kv('申请奖学金 / Scholarship applied for', input.scholarshipTitle)
  d.kv('申请层次 / Study level', input.levelLabel)
  d.space()

  d.band('英语水平 / English Proficiency')
  d.kv('证明方式 / Evidence', f.englishTest)
  d.kv('成绩 / Score', f.englishScore)
  d.space()

  d.band('推荐人 / Referees')
  d.table(
    ['姓名 / Name', '职务 / Position', '单位 / Institution', '联系方式 / Contact'],
    [
      [
        f.referee1Name,
        f.referee1Position,
        f.referee1Institution,
        [f.referee1Phone, f.referee1Email].filter(Boolean).join('  ·  '),
      ],
      [
        f.referee2Name,
        f.referee2Position,
        f.referee2Institution,
        [f.referee2Phone, f.referee2Email].filter(Boolean).join('  ·  '),
      ],
    ],
    [24, 24, 26, 26],
  )
  d.space()

  d.band('紧急联系人 / Emergency Contact')
  d.kv('姓名 / Name', f.guardian)
  d.kv('关系 / Relationship', f.guardianRelationship)
  d.kv('联系电话 / Telephone', f.guardianPhone)
  d.kv('电子邮箱 / Email', f.guardianEmail)
  d.space()

  d.band('费用承担人 / Person Responsible for Living Costs')
  d.kv('姓名 / Name', f.sponsorName)
  d.kv('关系 / Relationship', f.sponsorRelationship)
  d.kv('职业 / Occupation', f.sponsorOccupation)
  d.kv('联系电话 / Telephone', f.sponsorPhone)
  d.space()

  d.band('与中国的关系 / History with China')
  d.kv('曾在中国学习 / Studied in China before', f.studiedInChina)
  d.kv('曾申请中国奖学金 / Applied for a Chinese scholarship before', f.appliedBefore)
  d.kv('现在中国境内 / Currently in China', f.currentlyInChina)
  d.kv('现持签证种类 / Current visa type', f.visaType)
  d.space()

  d.band('申请人声明 / Applicant Declarations')
  d.kv('健康状况 / Health', '申请人声明身体健康，可全日制在华学习。 / Declared fit to study full time in China.')
  d.kv(
    '无犯罪记录 / Criminal record',
    '申请人声明无犯罪记录，并将提供无犯罪记录证明。 / Declared no criminal record; police clearance to be provided.',
  )
  d.space()

  d.band('随附材料 / Documents Supplied')
  if (input.documents.length > 0) {
    input.documents.forEach((name, i) => d.kv(`${i + 1}`, name, 120))
  } else {
    d.kv('材料 / Documents', '提交时未附材料。 / None attached at the time of submission.')
  }

  return toPdf(d.pages)
}
