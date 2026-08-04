export type ScholarshipStatus = 'Open' | 'Closing soon'
export type LevelKey = 'bachelor' | 'masters' | 'phd'

export interface Scholarship {
  id: string
  title: string
  levels: string
  levelKeys: LevelKey[]
  location: string
  status: ScholarshipStatus
  /* Short label for card corners and hero rows, e.g. "Sep 2026 intake". */
  closingLabel: string
  /* Value shown against the approved "CLOSES" label on home cards. */
  closingKV: string
  cscaRequired: boolean
  majors: string[]
  blurb: string
  about1: string
  about2: string
  facts: { label: string; value: string }[]
  eligibility: string[]
  funding: string
  timeline: string
  fees: string
}

/* Status colours from the approved prototype. */
export const statusColor = (s: ScholarshipStatus) =>
  s === 'Open' ? '#8a6d2f' : '#a1471f'
export const statusColorLight = (s: ScholarshipStatus) =>
  s === 'Open' ? '#c7a85e' : '#e0975f'
export const badgeBg = (s: ScholarshipStatus) =>
  s === 'Closing soon' ? '#c8102e' : '#33567a'

const serviceFees =
  'The scholarship itself is free. You never pay a university or the Chinese government to be considered, and you should treat anyone who asks as a scam. Our office charges a clearly stated service fee for placement and processing, explained in full before you commit to anything.'

/* [PLACEHOLDER] University names and exact application deadlines are still to be
   confirmed by the office; the flyers state the September 2026 intake only. */
export const scholarships: Scholarship[] = [
  {
    id: 'top-ranking-bachelor',
    title: 'Top-Ranking University Bachelor Scholarship',
    levels: "Bachelor's",
    levelKeys: ['bachelor'],
    location: 'Top-ranking university, China',
    status: 'Open',
    closingLabel: 'Sep 2026 intake',
    closingKV: 'To be confirmed',
    cscaRequired: true,
    majors: [
      'Transportation Engineering',
      'Mechanical Engineering',
      'Computer Science and Technology',
      'Pharmacy',
      'Clinical Medicine (self-funded)',
    ],
    blurb:
      'Study at a top-ranking Chinese university. A first-class CSCA result covers your tuition in full. A second-class result covers half.',
    about1:
      'This scholarship places you at a top-ranking university in China for the September 2026 intake. The award is decided by your CSCA exam results: a first-class result covers your tuition in full, and a second-class result covers half of it. Five majors are open, from Transportation and Mechanical Engineering to Computer Science and Technology, Pharmacy, and Clinical Medicine.',
    about2:
      'You sit the CSCA exam and submit your transcripts with your application. Note that Clinical Medicine is self-funded: it is offered at the same university but without the tuition award.',
    facts: [
      { label: 'Level', value: "Bachelor's" },
      { label: 'Location', value: 'Top-ranking university, China (named at placement)' },
      {
        label: 'Award',
        value:
          'Tuition covered in full with a first-class CSCA result; half covered with a second-class result',
      },
      { label: 'Exam', value: 'CSCA exam transcripts required' },
      {
        label: 'Majors',
        value:
          'Transportation Engineering · Mechanical Engineering · Computer Science and Technology · Pharmacy · Clinical Medicine (self-funded)',
      },
      { label: 'Intake', value: 'September 2026. Application deadline to be confirmed.' },
    ],
    eligibility: [
      'Ugandan citizenship and a valid passport (at least three years to expiry).',
      'Completed high school with good grades.',
      'CSCA exam transcripts. A first-class result covers tuition in full; a second-class result covers half.',
      'Good conduct, confirmed by a police clearance certificate.',
      'Willingness to study full time in China.',
    ],
    funding:
      'Your CSCA results decide the award. With a first-class result your tuition is covered in full. With a second-class result, half of it is covered. Accommodation and living costs are paid by the student, and Clinical Medicine is fully self-funded. We confirm the exact costs for your university before you accept a place.',
    timeline:
      'The intake is September 2026 and the final application deadline is being confirmed. CSCA exam sittings fill early, so start your application now and we will guide you on booking the exam in good time. Once you are admitted, we help with your visa, medical checks and travel.',
    fees: serviceFees,
  },
  {
    id: 'tuition-free-bachelor',
    title: 'Tuition-Free Bachelor Scholarship',
    levels: "Bachelor's",
    levelKeys: ['bachelor'],
    location: 'Partner university, China',
    status: 'Closing soon',
    closingLabel: 'Last call for Sep 2026',
    closingKV: 'Last call',
    cscaRequired: true,
    majors: [
      'Business Administration',
      'Civil Engineering',
      'Aircraft Design and Engineering',
      'Computer Science and Technology',
    ],
    blurb:
      'Tuition fully covered for all admitted students. You pay only the hostel fee of 1,800 RMB per year. Final places for September 2026.',
    about1:
      'This programme covers tuition in full for every admitted student. Your only fixed university cost is the hostel fee of 1,800 RMB per year, paid to the university directly. Four majors are open: Business Administration, Civil Engineering, Aircraft Design and Engineering, and Computer Science and Technology.',
    about2:
      'This is the last call for the September 2026 intake, and the CSCA exam is required. If you are interested, apply now and we will move quickly on your file.',
    facts: [
      { label: 'Level', value: "Bachelor's" },
      { label: 'Location', value: 'Partner university, China (named at placement)' },
      { label: 'Award', value: 'Tuition covered in full. Hostel fee 1,800 RMB per year.' },
      { label: 'Exam', value: 'CSCA exam required' },
      {
        label: 'Majors',
        value:
          'Business Administration · Civil Engineering · Aircraft Design and Engineering · Computer Science and Technology',
      },
      { label: 'Intake', value: 'September 2026. Final places, last call.' },
    ],
    eligibility: [
      'Ugandan citizenship and a valid passport (at least three years to expiry).',
      'Completed high school with good grades.',
      'CSCA exam and transcript.',
      'A study plan and the full document set listed on the Requirements page.',
      'Good conduct, confirmed by a police clearance certificate.',
      'Willingness to study full time in China.',
    ],
    funding:
      'Tuition is fully covered for all four majors. There is no partial award here: every admitted student pays no tuition. You pay the hostel fee of 1,800 RMB per year and your own living costs, and we tell you what to budget before you accept.',
    timeline:
      'This is the last call for the September 2026 intake. Places are nearly full and files are reviewed as they arrive, so apply today and send your documents as soon as you can. Complete applications are reviewed first.',
    fees: serviceFees,
  },
  {
    id: 'hubei-english-taught',
    title: 'Hubei English-Taught Bachelor Scholarship',
    levels: "Bachelor's",
    levelKeys: ['bachelor'],
    location: 'Hubei Province',
    status: 'Open',
    closingLabel: 'Sep 2026 intake',
    closingKV: 'To be confirmed',
    cscaRequired: false,
    majors: [
      'Computer Science and Technology',
      'International Economics',
      'International Chinese Education',
    ],
    blurb:
      'English-taught programmes in Hubei with no CSCA exam. Tuition drops from 20,000 to 7,000 RMB per year, and top students can win a 20,000 RMB provincial award.',
    about1:
      'This scholarship is for students who want to start without sitting the CSCA exam. All three majors are taught fully in English at a university in Hubei Province. The scholarship cuts tuition from 20,000 RMB to 7,000 RMB per year, and university accommodation is 3,000 RMB per year.',
    about2:
      'Strong students can go further: the Hubei Provincial Government awards 20,000 RMB per year to excellent students, which more than covers the remaining costs. The programme is open to African students, so Ugandans qualify.',
    facts: [
      { label: 'Level', value: "Bachelor's" },
      { label: 'Location', value: 'Hubei Province' },
      {
        label: 'Award',
        value: 'Tuition reduced from 20,000 to 7,000 RMB per year. Accommodation 3,000 RMB per year.',
      },
      { label: 'Exam', value: 'No CSCA exam needed' },
      { label: 'Language', value: 'All programmes taught in English' },
      {
        label: 'Majors',
        value:
          'Computer Science and Technology · International Economics · International Chinese Education',
      },
      {
        label: 'Extra award',
        value: 'Hubei Provincial Government award of 20,000 RMB per year for excellent students',
      },
      { label: 'Intake', value: 'September 2026. Application deadline to be confirmed.' },
    ],
    eligibility: [
      'Ugandan citizenship and a valid passport (at least three years to expiry). The programme is open to African students, so Ugandans qualify.',
      'Completed high school with good grades.',
      'No CSCA exam needed.',
      'Comfortable studying fully in English.',
      'Good conduct, confirmed by a police clearance certificate.',
    ],
    funding:
      'The scholarship cuts tuition from 20,000 RMB to 7,000 RMB per year, and university accommodation is 3,000 RMB per year. Excellent students can also apply for the Hubei Provincial Government award of 20,000 RMB per year, which more than covers those costs. The provincial award is assessed on your results each year, so strong students keep earning it.',
    timeline:
      'The intake is September 2026 and the application deadline is being confirmed. Because there is no CSCA exam, your file can be ready quickly once your documents are in order. The provincial award is applied for after you enrol, and we guide you through it.',
    fees: serviceFees,
  },
]

export const getScholarship = (id: string | undefined) =>
  scholarships.find((s) => s.id === id)
