export type ScholarshipStatus = 'Open' | 'Closing soon'
export type LevelKey = 'bachelor' | 'masters' | 'phd' | 'language'

export interface Scholarship {
  id: string
  title: string
  /* Column heading in the comparison table, where the full title is too long to
     read. Falls back to the title with its level suffix stripped. */
  shortTitle?: string
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

/* The same wording on every programme, and the starting point for a new one
   added from the admin panel. */
export const serviceFees =
  'The scholarship itself is free. You never pay a university or the Chinese government to be considered, and you should treat anyone who asks as a scam. Our office charges a clearly stated service fee for placement and processing, explained in full before you commit to anything.'

/* The programmes below are the built-in set. They are the fallback the site
   shows when Supabase is not configured, is unreachable, or has no scholarships
   saved yet, so the scholarships page is never blank. Once the office adds or
   edits programmes at /admin, the saved ones are used instead and this list is
   no longer what visitors see. The Scholarships tab in the admin panel can copy
   this list into the database as a starting point.

   [PLACEHOLDER] University names and exact application deadlines are still to be
   confirmed by the office; the flyers state the September 2026 intake only. */
export const seedScholarships: Scholarship[] = [
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

  /* Chinese language programmes.

     [PLACEHOLDER] University names are still to be confirmed by the office. The
     two Shenyang programmes are at different universities and are told apart
     here by their fees only; rename them once the universities are confirmed. */
  {
    id: 'beijing-chinese-language',
    title: 'Beijing Chinese Language Scholarship',
    shortTitle: 'Beijing language',
    levels: 'Chinese language, 1 year',
    levelKeys: ['language'],
    location: 'Beijing',
    status: 'Open',
    closingLabel: 'Sep 2026 intake',
    closingKV: 'To be confirmed',
    cscaRequired: false,
    majors: ['Chinese Language'],
    compare: {
      tuition: '5,000 RMB per year after the scholarship',
      accommodation: '600 to 900 RMB per month, or live off campus',
      taughtIn: 'Chinese, taught as a language course',
      openTo: 'All nationalities',
      extraAward: 'None',
    },
    blurb:
      'A one-year Chinese language course in Beijing. The scholarship brings the fee down to 5,000 RMB a year, and you may live off campus if you prefer.',
    about1:
      'This is a one-year Chinese language course in Beijing for the September 2026 intake. After the scholarship you pay 5,000 RMB a year. University accommodation is 600 to 900 RMB a month, and unlike most programmes you are free to live outside the campus if you would rather find your own room.',
    about2:
      'Admissions move quickly here. A pre-admission decision takes 3 to 5 days and the JW letter you need for your visa follows within 1 to 2 weeks. The course is open to applicants of all nationalities aged 18 to 30, and no CSCA exam is required.',
    facts: [
      { label: 'Level', value: 'Chinese language course' },
      { label: 'Location', value: 'Beijing' },
      { label: 'Duration', value: '1 year' },
      { label: 'Award', value: 'Fee after the scholarship is 5,000 RMB per year' },
      {
        label: 'Accommodation',
        value: '600 to 900 RMB per month. Students may live outside the campus.',
      },
      { label: 'Age', value: '18 to 30 years' },
      { label: 'Countries', value: 'All nationalities accepted' },
      { label: 'Exam', value: 'No CSCA exam needed' },
      { label: 'Pre-admission', value: '3 to 5 days' },
      { label: 'JW letter', value: '1 to 2 weeks' },
      { label: 'Intake', value: 'September 2026. Limited seats.' },
    ],
    eligibility: [
      'Aged 18 to 30.',
      'A valid passport with at least three years to expiry.',
      'Your highest degree or certificate, with the transcript.',
      'A police clearance certificate.',
      'A physical examination form.',
      'A bank statement.',
      'A passport photograph and the completed application form, which we produce for you.',
    ],
    funding:
      'The scholarship brings the course fee down to 5,000 RMB per year, which you pay to the university. Accommodation is 600 to 900 RMB a month on top of that, and you may instead rent outside the campus at your own cost. Living costs, flights and visa fees are yours, as on every programme.',
    timeline:
      'The intake is September 2026 and seats are limited. A pre-admission decision comes back in 3 to 5 days once your file is complete, and the JW letter for your visa follows 1 to 2 weeks after that. Get your police clearance and medical form started first, as they are the slowest documents.',
    fees: serviceFees,
  },
  {
    id: 'shenyang-chinese-language',
    title: 'Shenyang Chinese Language Programme',
    shortTitle: 'Shenyang programme',
    levels: 'Chinese language',
    levelKeys: ['language'],
    location: 'Shenyang, Liaoning Province',
    status: 'Open',
    closingLabel: 'Sep 2026 intake',
    closingKV: 'To be confirmed',
    cscaRequired: false,
    majors: ['Chinese Language'],
    compare: {
      tuition: '8,000 RMB per year',
      accommodation: '4,500 RMB per year',
      taughtIn: 'English medium',
      openTo: 'International students, up to age 30',
      extraAward: 'None',
    },
    blurb:
      'A Chinese language programme in Shenyang with admission decided within 2 days. Tuition is 8,000 RMB a year and accommodation 4,500 RMB a year.',
    about1:
      'This Chinese language programme is in Shenyang, in Liaoning Province in the north east of China. Tuition is 8,000 RMB per year and university accommodation is 4,500 RMB per year, both paid to the university. Teaching is English medium, so you are not left behind while your Chinese is still building.',
    about2:
      'What sets this one apart is speed: admission is decided within 2 days of a complete file. Seats are limited for the September 2026 intake, and applications are handled in the order they arrive.',
    facts: [
      { label: 'Level', value: 'Chinese language course' },
      { label: 'Location', value: 'Shenyang, Liaoning Province' },
      { label: 'Tuition', value: '8,000 RMB per year' },
      { label: 'Accommodation', value: '4,500 RMB per year' },
      { label: 'Age', value: 'Up to 30 years' },
      { label: 'Language', value: 'English medium' },
      { label: 'Exam', value: 'No CSCA exam needed' },
      { label: 'Admission', value: 'Decided within 2 days' },
      { label: 'Intake', value: 'September 2026. Limited seats.' },
    ],
    eligibility: [
      'Aged 30 or under.',
      'A valid passport with at least three years to expiry.',
      'Completed high school, with the certificate and transcript.',
      'Good conduct, confirmed by a police clearance certificate.',
      'A medical report from an approved hospital.',
      'Comfortable studying in English while you learn Chinese.',
    ],
    funding:
      'There is no partial award to work out here: tuition is 8,000 RMB per year and accommodation is 4,500 RMB per year, so the university side comes to 12,500 RMB a year. Flights, visa fees, insurance and living costs are paid by you, and we tell you what to budget before you accept a place.',
    timeline:
      'The intake is September 2026. Admission is decided within 2 days of a complete file, so the only thing that slows this application down is missing documents. Send your passport, certificates and police clearance together and the rest moves quickly.',
    fees: serviceFees,
  },
  {
    id: 'shenyang-language-scholarship',
    title: 'Shenyang Chinese Language Scholarship',
    shortTitle: 'Shenyang scholarship',
    levels: 'Chinese language, 1 year',
    levelKeys: ['language'],
    location: 'Shenyang, Liaoning Province',
    status: 'Open',
    closingLabel: 'Sep 2026 intake',
    closingKV: 'To be confirmed',
    cscaRequired: false,
    majors: ['Chinese Language'],
    compare: {
      tuition: '11,000 RMB for the year',
      accommodation: 'Hostel 5,400 RMB per year',
      taughtIn: 'Chinese, taught as a language course',
      openTo: 'International students aged 18 to 30',
      extraAward: 'None',
    },
    blurb:
      'A one-year Chinese language programme in Shenyang with a pre-admission notice in 3 days. Tuition is 11,000 RMB for the year and the hostel 5,400 RMB.',
    about1:
      'This is a one-year Chinese language programme at a university in Shenyang, Liaoning Province, for the September 2026 intake. Tuition is 11,000 RMB for the year and the hostel is 5,400 RMB per year, both paid to the university.',
    about2:
      'A pre-admission notice comes back within 3 days of a complete file, and the admission letter follows shortly after. The programme is open to applicants aged 18 to 30 and no CSCA exam is required.',
    facts: [
      { label: 'Level', value: 'Chinese language course' },
      { label: 'Location', value: 'Shenyang, Liaoning Province' },
      { label: 'Duration', value: '1 year' },
      { label: 'Tuition', value: '11,000 RMB for the year' },
      { label: 'Accommodation', value: 'Hostel 5,400 RMB per year' },
      { label: 'Age', value: '18 to 30 years' },
      { label: 'Exam', value: 'No CSCA exam needed' },
      { label: 'Pre-admission', value: 'Notice within 3 days' },
      { label: 'Intake', value: 'September 2026' },
    ],
    eligibility: [
      'Aged 18 to 30.',
      'A valid passport with at least three years to expiry.',
      'Completed high school, with the certificate and transcript.',
      'Good conduct, confirmed by a police clearance certificate.',
      'A medical report from an approved hospital.',
      'Willingness to study full time in China for the year.',
    ],
    funding:
      'Tuition is 11,000 RMB for the year and the hostel is 5,400 RMB per year, so the university side comes to 16,400 RMB for the year. Flights, visa fees, insurance and day to day living are paid by you.',
    timeline:
      'The intake is September 2026. Once your file is complete the pre-admission notice comes back within 3 days, so start on the documents that take longest, the police clearance and the medical report, before anything else.',
    fees: serviceFees,
  },
  {
    id: 'shijiazhuang-language-csca',
    title: 'Shijiazhuang Chinese Language and CSCA Programme',
    shortTitle: 'Shijiazhuang',
    levels: 'Chinese language',
    levelKeys: ['language'],
    location: 'Shijiazhuang, about 1.5 hours from Beijing',
    status: 'Open',
    closingLabel: 'Sep 2026 intake',
    closingKV: 'To be confirmed',
    cscaRequired: false,
    majors: [
      'Chinese Language and CSCA',
      'Chinese Language and Traditional Chinese Medicine (TCM) Techniques',
    ],
    compare: {
      tuition: 'Tuition with a 4-person dormitory, 9,500 RMB per year',
      accommodation: 'Included. A 2-person room costs 2,500 RMB more per year',
      taughtIn: 'Chinese, taught as a language course',
      openTo: 'Aged 18 to 26. War-affected countries are not eligible',
      extraAward: 'None',
    },
    blurb:
      'Two tracks in Shijiazhuang, an hour and a half from Beijing: Chinese language with CSCA preparation, or Chinese language with Traditional Chinese Medicine. Tuition and a dormitory place together cost 9,500 RMB a year.',
    about1:
      'This programme is in Shijiazhuang, about 1.5 hours from Beijing by train, and comes in two tracks. The first pairs Chinese language with CSCA preparation, which sets you up for the degree scholarships that ask for a CSCA result. The second pairs Chinese language with Traditional Chinese Medicine techniques.',
    about2:
      'Tuition and a place in a 4-person dormitory are charged together at 9,500 RMB per year. A 2-person room costs 2,500 RMB more. The programme is for applicants aged 18 to 26, and applicants from war-affected countries are not eligible. A deposit of 3,000 RMB is paid after your JW letter is issued.',
    facts: [
      { label: 'Level', value: 'Chinese language course' },
      { label: 'Location', value: 'Shijiazhuang, about 1.5 hours from Beijing' },
      {
        label: 'Tracks',
        value:
          'Chinese Language and CSCA · Chinese Language and Traditional Chinese Medicine (TCM) techniques',
      },
      {
        label: 'Tuition',
        value: 'Tuition with a 4-person dormitory, 9,500 RMB per year',
      },
      { label: 'Accommodation', value: 'A 2-person dormitory costs 2,500 RMB more per year' },
      { label: 'Age', value: '18 to 26 years' },
      {
        label: 'Countries',
        value: 'Applicants from war-affected countries are not eligible',
      },
      { label: 'Deposit', value: '3,000 RMB, paid after the JW letter is issued' },
      { label: 'Pre-admission', value: '1 to 2 days' },
      { label: 'Admission notice and JW', value: '10 days at the earliest' },
      { label: 'Intake', value: 'September 2026' },
    ],
    eligibility: [
      'Aged 18 to 26.',
      'Applicants from war-affected countries are not eligible for this programme.',
      'A valid passport with at least three years to expiry.',
      'Completed high school, with the certificate and transcript.',
      'Good conduct, confirmed by a police clearance certificate.',
      'A medical report from an approved hospital.',
      'Able to pay the 3,000 RMB deposit once your JW letter is issued.',
    ],
    funding:
      'Tuition and a place in a 4-person dormitory are charged together at 9,500 RMB per year, so your accommodation is already inside that figure. If you want a 2-person room instead, add 2,500 RMB per year. A deposit of 3,000 RMB is paid after your JW letter is issued and goes towards what you owe. Flights, visa fees and living costs are yours.',
    timeline:
      'The intake is September 2026. Pre-admission takes 1 to 2 days, and the admission notice with the JW letter takes 10 days at the earliest after that. Budget for the 3,000 RMB deposit at the JW stage so it does not catch you out, and start the police clearance early.',
    fees: serviceFees,
  },
]
