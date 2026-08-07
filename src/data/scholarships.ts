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
  /* One row each in the comparison table on the scholarships page. Keeping
     them here means adding a scholarship fills the table by itself. */
  compare: {
    tuition: string
    accommodation: string
    taughtIn: string
    openTo: string
    extraAward: string
  }
  blurb: string
  about1: string
  about2: string
  facts: { label: string; value: string }[]
  eligibility: string[]
  funding: string
  timeline: string
  fees: string
}

/* Status colours.

   "Open" uses the green already established elsewhere on the site for a good
   state (the upload ticks, the confirmation screen, the WhatsApp button), so
   open and closing read apart at a glance. Two tones each: the darker one for
   light backgrounds, the lighter one for the navy hero. */
export const statusColor = (s: ScholarshipStatus) =>
  s === 'Open' ? '#1f7a43' : '#a1471f'
export const statusColorLight = (s: ScholarshipStatus) =>
  s === 'Open' ? '#63c48c' : '#e0975f'
/* "Closing soon" is a status, not an action. It used solid red, which competed
   with the red buttons around it and blunted what red means on the page. Gold
   carries urgency without claiming to be clickable. */

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
    compare: {
      tuition: 'Free with a first-class CSCA result, half with a second-class result',
      accommodation: 'Paid by you',
      taughtIn: 'English',
      openTo: 'Applicants across Africa',
      extraAward: 'None',
    },
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
      'A valid passport with at least three years to expiry.',
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
    compare: {
      tuition: 'Free for every admitted student',
      accommodation: 'Hostel fee 1,800 RMB per year',
      taughtIn: 'English',
      openTo: 'Applicants across Africa',
      extraAward: 'None',
    },
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
      'A valid passport with at least three years to expiry.',
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
    compare: {
      tuition: '7,000 RMB per year, reduced from 20,000',
      accommodation: '3,000 RMB per year',
      taughtIn: 'English',
      openTo: 'Across Africa, apart from Morocco and Algeria',
      extraAward: 'Hubei provincial award of 20,000 RMB a year for strong students',
    },
    blurb:
      'English-taught programmes in Hubei with no CSCA exam. Tuition drops from 20,000 to 7,000 RMB per year, and top students can win a 20,000 RMB provincial award.',
    about1:
      'This scholarship is for students who want to start without sitting the CSCA exam. All three majors are taught fully in English at a university in Hubei Province. The scholarship cuts tuition from 20,000 RMB to 7,000 RMB per year, and university accommodation is 3,000 RMB per year.',
    about2:
      'Strong students can go further: the Hubei Provincial Government awards 20,000 RMB per year to excellent students, which more than covers the remaining costs. The programme is open to applicants from across Africa, apart from Morocco and Algeria.',
    facts: [
      { label: 'Level', value: "Bachelor's" },
      { label: 'Location', value: 'Hubei Province' },
      {
        label: 'Award',
        value: 'Tuition reduced from 20,000 to 7,000 RMB per year. Accommodation 3,000 RMB per year.',
      },
      { label: 'Exam', value: 'No CSCA exam needed' },
      {
        label: 'Countries',
        value: 'Open across Africa, apart from Morocco and Algeria',
      },
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
      'A valid passport with at least three years to expiry.',
      'Open to applicants from African countries. Morocco and Algeria are not eligible for this programme.',
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
  {
    id: 'henan-masters',
    title: "Henan Province Master's Scholarship",
    levels: "Master's",
    levelKeys: ['masters'],
    location: 'Henan Province',
    status: 'Open',
    closingLabel: 'Sep 2026 intake',
    closingKV: 'To be confirmed',
    cscaRequired: false,
    majors: [
      'Master of International Business (MIB)',
      'Electronic Information (Computer Science and Technology)',
      'Civil and Hydraulic Engineering',
      'Biology and Medicine',
      'Applied Statistics',
      'Physical Education',
      'Materials and Chemical Engineering',
      'Resources and Environment',
      'Agronomy',
      'Education',
      'Chinese Language and Literature',
      'History of China',
      'Physics',
      'Chemistry',
      'Translation',
    ],
    compare: {
      tuition: 'Free, 3,000 or 5,000 RMB per year by award type. Full fee is 18,000 RMB',
      accommodation: '3,500 RMB per year',
      /* [PLACEHOLDER] Confirm which programmes are taught in English. Several
         listed majors (Chinese Language and Literature, History of China,
         Translation) are likely taught in Chinese. */
      taughtIn: 'To be confirmed by programme',
      openTo: 'International students worldwide',
      extraAward: 'None',
    },
    blurb:
      "For students who already hold a Bachelor's degree. Fifteen Master's programmes in Henan, with tuition free or reduced depending on the award you are given.",
    about1:
      "This is a Master's scholarship at a university in Henan Province for the September 2026 intake. Fifteen programmes are open, from International Business and Electronic Information to Civil and Hydraulic Engineering, Agronomy, Education and Translation. Applications are welcome from international students worldwide.",
    about2:
      'The award comes in three types. Type 1 covers your tuition in full. Type 2 leaves you paying 3,000 RMB a year and Type 3 leaves you paying 5,000 RMB a year, against a full fee of 18,000 RMB. You are told which type you have been given before you accept a place.',
    facts: [
      { label: 'Level', value: "Master's" },
      { label: 'Location', value: 'Henan Province' },
      {
        label: 'Award',
        value:
          'Type 1: tuition free · Type 2: 3,000 RMB per year · Type 3: 5,000 RMB per year (full fee 18,000 RMB)',
      },
      { label: 'Accommodation', value: '3,500 RMB per year' },
      { label: 'Exam', value: 'No CSCA exam needed' },
      { label: 'Countries', value: 'Open to international students worldwide' },
      {
        label: 'Majors',
        value:
          'International Business · Electronic Information · Civil and Hydraulic Engineering · Biology and Medicine · Applied Statistics · Physical Education · Materials and Chemical Engineering · Resources and Environment · Agronomy · Education · Chinese Language and Literature · History of China · Physics · Chemistry · Translation',
      },
      { label: 'Intake', value: 'September 2026. Application deadline to be confirmed.' },
    ],
    eligibility: [
      "A completed Bachelor's degree, with the certificate and academic transcript.",
      'A valid passport with at least three years to expiry.',
      'A research proposal for the programme you are applying to.',
      'Two recommendation letters, each from an associate professor or professor.',
      'A police clearance certificate issued within the last 6 months.',
      'A medical examination report issued within the last 6 months.',
    ],
    funding:
      'Tuition is 18,000 RMB per year before the award. Type 1 covers it in full, Type 2 leaves you paying 3,000 RMB a year, and Type 3 leaves you paying 5,000 RMB a year. Accommodation is 3,500 RMB per year and is paid by you. We confirm which award type you have been offered before you accept.',
    timeline:
      'The intake is September 2026 and the application deadline is being confirmed. Two documents take the longest here: the police clearance and the medical report, and both must be issued within 6 months of applying. Start them early and prepare your research proposal while you wait.',
    fees: serviceFees,
  },
]

export const getScholarship = (id: string | undefined) =>
  scholarships.find((s) => s.id === id)
