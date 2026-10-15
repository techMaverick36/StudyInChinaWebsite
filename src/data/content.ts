/* Site-wide content. Headings, labels and bullet lists are approved prototype copy.
   Body paragraphs are the production copy. Items marked [PLACEHOLDER …] are
   awaiting real content from the client. */

/* The single source for contact details. Every page, form message and error
   notice reads from here, so these never disagree with each other. */
export const contact = {
  phone: '+256 701 458000',
  /* [PLACEHOLDER] Confirm the email address is live before launch. */
  email: 'admissions@studyinchinanow.com',
  whatsappUrl: 'https://wa.me/256701458000',
  addressLines: ['Universal House, Shop G14', 'Luwum Street', 'Kampala, Uganda'],
  hours: 'Monday to Friday, 9:00 to 17:00',
}

/* Home — The Process (short lines are approved prototype copy). Titles are kept
   short enough to sit on one line in the four-column row; the How to Apply page
   below carries the full wording. */
export const procSteps = [
  { num: '01', title: 'Check you qualify', short: 'Read the age, grade and language rules for your study level.' },
  { num: '02', title: 'Prepare documents', short: 'Collect your passport, transcripts and 2 recommendation letters.' },
  { num: '03', title: 'Apply online', short: 'Fill in the form on this site in about 15 minutes.' },
  { num: '04', title: 'Hear from our team', short: 'Our Kampala office calls you within 3 working days, then guides your admission, visa and travel.' },
]

/* How to Apply — step bodies. */
export const guideSteps = [
  {
    num: '1',
    title: 'Check that you qualify',
    body: 'Each scholarship sets its own rules on age, grades and study level. Open the page for the scholarship you want and read its requirements first. If you can’t tell whether you qualify, call the office or send a WhatsApp message. The answer is honest and free.',
  },
  {
    num: '2',
    title: 'Prepare your documents',
    body: 'Start here, because most delays happen at this step. The Interpol police clearance can take several weeks, so request it first. The Requirements page lists every document with a short instruction for each.',
  },
  {
    num: '3',
    title: 'Complete the online application',
    body: 'Fill in the application form on this site. It takes about 15 minutes, and you upload your documents as you go. Submit even if a document is still missing; the office follows up with you for the rest.',
  },
  {
    num: '4',
    title: 'Our team reviews your file',
    body: 'The Kampala team checks every application by hand and calls you if anything is missing or unclear. Once your file is complete, it goes to the universities, and you get an update at each stage through to your admission letter, visa and travel.',
  },
]

/* Requirements — document list (names, instructions and the Master's/PhD flag
   are approved prototype copy). */
export interface DocItem {
  key: string
  name: string
  instr: string
  adv: boolean
  /* Only needed when the selected scholarship requires the CSCA exam. */
  cscaOnly?: boolean
  /* Produced by the site from the online form; the applicant uploads nothing. */
  generated?: boolean
}

export const documents: DocItem[] = [
  { key: 'photo', name: 'Passport photograph', instr: 'White background, dark clothes. JPG or PNG.', adv: false },
  { key: 'passport', name: 'Valid passport', instr: 'At least 3 years to expiry.', adv: false },
  { key: 'hs', name: 'High school certificate and transcript', instr: 'Certified copies.', adv: false },
  { key: 'degree', name: 'Degree transcript', instr: 'Your university transcript and certificate.', adv: true },
  { key: 'appform', name: 'Foreign student application form', instr: 'Answer the questions in the online application and the finished form is produced for you. Nothing to print or scan.', adv: false, generated: true },
  { key: 'medical', name: 'Medical report', instr: 'From an approved hospital. Applicants in Kampala use Naguru Hospital.', adv: false },
  { key: 'police', name: 'Interpol police clearance certificate', instr: 'Issued within the last 6 months.', adv: false },
  { key: 'english', name: 'English proficiency letter', instr: 'From your previous school.', adv: false },
  { key: 'csca', name: 'CSCA exam transcript', instr: 'Only for scholarships that require the CSCA exam.', adv: false, cscaOnly: true },
  { key: 'video', name: '60-second introduction video', instr: 'Provide a link (YouTube, Google Drive or WhatsApp).', adv: false },
  { key: 'refs', name: 'Two recommendation letters', instr: 'Signed, on official letterhead.', adv: false },
  { key: 'studyplan', name: 'Study plan', instr: 'Outline of your intended research or study.', adv: true },
  { key: 'bank', name: 'Bank statement', instr: 'Covering the last 3 to 6 months.', adv: false },
]

/* Home — Student Voices.

   IMPORTANT, BEFORE LAUNCH: the names below are real students taken from the
   admission letters supplied by the office. The quotes are DRAFTS written for
   them, not words they have said. Each student must read and approve their own
   quote (in writing) before this section goes live, and the university and year
   need filling in. Until then `approved` stays false. */
export const alumni = [
  {
    initials: 'JN',
    name: 'Janat Namugga',
    /* [PLACEHOLDER] Confirm university and intake year. */
    meta: 'Admitted for the 2026 intake',
    quote:
      'I thought it was a scam at first. I went to the office and asked my questions face to face, and they showed me every document I needed and what the fee covered. My admission letter came through with nothing hidden.',
    approved: false,
  },
  {
    initials: 'P',
    /* [PLACEHOLDER] Confirm Patrick's surname. */
    name: 'Patrick',
    meta: 'Admitted for the 2026 intake',
    quote:
      'The police clearance took me almost a month, so I was glad they told me to start early. When a document was wrong they called me and explained how to fix it. I never had to guess what was happening.',
    approved: false,
  },
]

/* How to Apply — what the award does not pay for. Being straight about
   this early is what separates a real placement service from a scam, and it
   stops families budgeting for a trip they cannot afford.

   [PLACEHOLDER] The office should add real figures for the flight, visa and
   monthly living costs, and the service fee, once confirmed. */
export const yourOwnCosts = [
  {
    item: 'Flight to China',
    note: 'One way. Book it after your admission letter and visa arrive.',
  },
  {
    item: 'Student visa',
    note: 'Paid at the Chinese embassy in your country. The office prepares the paperwork with you.',
  },
  {
    item: 'Medical check and insurance',
    note: 'A medical report before you travel, and health insurance once you arrive.',
  },
  {
    item: 'Accommodation',
    note: 'Covered on some programmes. Where it is not, expect 1,800 to 5,400 RMB per year, or 600 to 900 RMB a month where you live off campus.',
  },
  {
    item: 'Food and day to day living',
    note: 'Paid monthly by you or your sponsor. Ask the office what current students spend each month.',
  },
  {
    item: 'Our service fee',
    note: 'A fixed fee for placement and processing. You see the full amount before you commit.',
  },
]

/* Contact — FAQ. Questions follow what students type into Google, and the
   page publishes them as FAQPage structured data. The fee and timing answers
   should be confirmed by the office. */
export const faqs = [
  {
    q: 'Who can apply for a scholarship in China?',
    a: 'African students who have finished high school can apply for a Bachelor’s or Chinese language programme. A Master’s needs a first degree. Most applicants are 18 to 35, and each scholarship lists its own age, grade and level rules on its page. Call the office for a free eligibility check.',
  },
  {
    q: 'What documents do I need to study in China?',
    a: 'Your passport, certificates and transcripts, a medical report, an Interpol police clearance, 2 recommendation letters and a few other items. The Requirements page lists each document with instructions. The application form itself is filled in on this site, so there is nothing to print.',
  },
  {
    q: 'Do I pay for the scholarship?',
    a: 'No. The scholarship is free, and anyone who charges you for the award itself is running a scam. Our office charges a fixed service fee for placement and processing. You see the full amount before you commit, with no hidden charges.',
  },
  {
    q: 'Can I study in China without the CSCA exam?',
    a: 'Yes. Several programmes need no CSCA exam. The CSCA exam column on the comparison page marks which ones require it.',
  },
  {
    q: 'Do I need to speak Chinese?',
    a: 'Not for the English-taught Bachelor’s programmes. The Chinese language programmes teach you the language. The Taught in column on the comparison page shows the teaching language of every programme.',
  },
  {
    q: 'How long until I get a result?',
    a: 'Most applicants hear 2 to 4 months after the scholarship deadline, because universities review applications in batches. The office updates you while you wait and calls as soon as a decision arrives.',
  },
  {
    q: 'Where is the office?',
    a: 'Universal House, Shop G14, Luwum Street, Kampala, Uganda. Walk in Monday to Friday, 9:00 to 17:00. No appointment needed.',
  },
]

