/* Site-wide content. Headings, labels and bullet lists are approved prototype copy.
   Body paragraphs are the production copy. Items marked [PLACEHOLDER …] are
   awaiting real content from the client. */

export const contact = {
  /* [PLACEHOLDER] Confirm real phone number, email and WhatsApp link. */
  phone: '+256 701 458000',
  email: 'admissions@studyinchinanow.com',
  whatsappUrl: 'https://wa.me/256701458000',
  addressLines: ['Universal House, Shop G14', 'Luwum Street', 'Kampala Uganda'],
  hours: 'Monday – Friday, 9:00 – 17:00',
}

/* Home — The Process (short lines are approved prototype copy). */
export const procSteps = [
  { num: '01', title: 'Check that you qualify', short: 'Confirm your level, grades and language meet the criteria.' },
  { num: '02', title: 'Prepare your documents', short: 'Gather transcripts, passport and reference letters.' },
  { num: '03', title: 'Complete the online application', short: 'Submit one simple online application with our guidance.' },
  { num: '04', title: 'We review and contact you', short: 'We place you and support your visa and travel.' },
]

/* How to Apply — step bodies. */
export const guideSteps = [
  {
    num: '1',
    title: 'Check that you qualify',
    body: 'Each scholarship has its own rules on age, grades and study level. Read the page for the scholarship you want before you start. If you are not sure whether you qualify, call the office or send us a WhatsApp message. We will tell you honestly, at no charge.',
  },
  {
    num: '2',
    title: 'Prepare your documents',
    body: 'Most delays happen at this stage, so start early. Some documents, like the Interpol police clearance, can take several weeks to obtain. The Requirements page lists everything you need, with a short instruction for each item.',
  },
  {
    num: '3',
    title: 'Complete the online application',
    body: 'Fill in the application form on this website. It takes about 10 to 15 minutes, and you can upload your documents as you go. If a document is not ready yet, submit what you have. We will follow up with you about the rest.',
  },
  {
    num: '4',
    title: 'We review and contact you',
    body: 'Our team in Kampala checks every application personally. If anything is missing or unclear, we call you. Once your file is complete, we submit it to the universities and keep you informed at each stage, through to your admission letter, visa and travel.',
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
  { key: 'appform', name: 'Foreign student application form', instr: 'You fill this in on this website. We prepare the completed form for you when you submit.', adv: false, generated: true },
  { key: 'medical', name: 'Medical report', instr: 'From Naguru hospital.', adv: false },
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

/* Contact — FAQ. Questions are approved prototype copy. Answers are production
   copy; the fee and timing answers should be confirmed by the office. */
export const faqs = [
  {
    q: 'Who is eligible to apply?',
    a: 'Most of our applicants are Ugandans aged 18 to 35 who have finished high school or a first degree. Each scholarship has its own rules on age, grades and study level, so check the page for the one you want. If you are not sure, contact us and we will check for you at no charge.',
  },
  {
    q: 'What documents do I need?',
    a: 'You need your passport, academic certificates and transcripts, a medical report, an Interpol police clearance, recommendation letters and a few other items. The full list is on the Requirements page, with a short instruction for each document. You do not need to download or print the application form: you fill that in on this website.',
  },
  {
    q: 'Are there any fees?',
    a: 'The scholarship itself is free. No genuine scholarship asks you to pay for the award, and you should treat anyone who does as a scam. Our office charges a clearly stated service fee for guiding and processing your application. We tell you the full amount before you commit, and there are no hidden charges.',
  },
  {
    q: 'How long does the process take?',
    a: 'It depends on the scholarship. Universities review applications in batches, and most applicants know their outcome two to four months after the deadline. We keep you updated while you wait and tell you as soon as we hear anything.',
  },
  {
    q: 'Do I need to speak Chinese?',
    a: 'No. The programmes we place students on are taught in English, and you will take basic Chinese classes in your first year to help with daily life. Some scholarships require the CSCA exam instead; each scholarship page tells you exactly what is needed.',
  },
]
