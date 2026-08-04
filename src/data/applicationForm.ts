/* Single source of truth for the online application.
   These fields together make up the official Foreign Student Application Form,
   which the site generates as a filled PDF so the applicant never has to
   download, print, fill in and scan it by hand.

   The form UI, the review screen, the generated PDF, the admin panel and the
   CSV export are all built from this definition, so they cannot drift apart. */

export type FieldType = 'text' | 'date' | 'select' | 'textarea' | 'tel' | 'email'

export interface FieldDef {
  name: string
  label: string
  type?: FieldType
  placeholder?: string
  options?: string[]
  optional?: boolean
  full?: boolean
  help?: string
}

/* A titled block of fields inside a section, rendered as its own card.
   Used where repeated field names would otherwise be confusing (the referees). */
export interface FieldGroupDef {
  title: string
  fields: FieldDef[]
}

export interface SectionDef {
  title: string
  intro?: string
  fields: FieldDef[]
  groups?: FieldGroupDef[]
}

export interface StepDef {
  /* Short label under the progress dots. */
  label: string
  sections: SectionDef[]
}

export const YES_NO = ['No', 'Yes']

export const steps: StepDef[] = [
  {
    label: 'Personal details',
    sections: [
      {
        title: 'Your name',
        intro:
          'Enter your names exactly as they appear on your passport. The official form asks for your surname and given names separately, and the universities check both against your documents.',
        fields: [
          { name: 'surname', label: 'Surname (family name)', placeholder: 'e.g. Namono' },
          { name: 'givenName', label: 'Given name(s)', placeholder: 'e.g. Sarah Achieng' },
          {
            name: 'chineseName',
            label: 'Chinese name (optional)',
            optional: true,
            placeholder: 'Only if you already have one',
          },
        ],
      },
      {
        title: 'About you',
        fields: [
          { name: 'sex', label: 'Gender', type: 'select', options: ['Female', 'Male'] },
          { name: 'dob', label: 'Date of birth', type: 'date' },
          { name: 'nationality', label: 'Nationality', placeholder: 'e.g. Ugandan' },
          { name: 'countryOfBirth', label: 'Country of birth', placeholder: 'e.g. Uganda' },
          { name: 'placeOfBirth', label: 'Place of birth (district or city)', placeholder: 'e.g. Jinja' },
          { name: 'maritalStatus', label: 'Marital status', type: 'select', options: ['Single', 'Married'] },
          { name: 'nativeLanguage', label: 'Native language', placeholder: 'e.g. English' },
          { name: 'religion', label: 'Religion (optional)', optional: true, placeholder: 'Leave blank if you prefer' },
        ],
      },
      {
        title: 'What you are doing now',
        intro: 'The official form asks what you do at present, and where you study or work.',
        fields: [
          {
            name: 'occupation',
            label: 'Occupation',
            placeholder: 'e.g. Student, Teacher, Unemployed',
          },
          {
            name: 'educationLevel',
            label: 'Highest education completed',
            type: 'select',
            options: [
              'High school (O-Level)',
              'High school (A-Level)',
              'Certificate',
              'Diploma',
              "Bachelor's degree",
              "Master's degree",
            ],
          },
          {
            name: 'employerInstitution',
            label: 'School or employer you belong to now',
            full: true,
            placeholder: 'Name of your current school, university or employer',
          },
        ],
      },
    ],
  },
  {
    label: 'Passport & contact',
    sections: [
      {
        title: 'Passport and identification',
        fields: [
          { name: 'passportNo', label: 'Passport number', placeholder: 'e.g. B1234567' },
          { name: 'passportIssueDate', label: 'Passport issue date', type: 'date' },
          {
            name: 'passportExpiry',
            label: 'Passport expiry date',
            type: 'date',
            help: 'Your passport should have at least 3 years left before it expires.',
          },
          { name: 'idnum', label: 'National ID number (optional)', optional: true, placeholder: 'e.g. CM90000001ABCD' },
        ],
      },
      {
        title: 'How we reach you',
        fields: [
          { name: 'phone', label: 'Phone number', type: 'tel', placeholder: '+256 7XX XXX XXX' },
          { name: 'whatsapp', label: 'WhatsApp number (optional)', type: 'tel', optional: true, placeholder: 'If different from your phone' },
          { name: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com' },
          {
            name: 'permanentAddress',
            label: 'Permanent postal address',
            full: true,
            placeholder: 'Village / division, district, and postcode if you have one',
            help: 'The official form asks for a full postal address for correspondence.',
          },
          {
            name: 'addressContactPerson',
            label: 'Contact person at that address',
            placeholder: 'Who receives post there',
          },
          {
            name: 'addressContactPhone',
            label: 'Their telephone',
            type: 'tel',
            placeholder: '+256 7XX XXX XXX',
          },
          {
            name: 'currentAddress',
            label: 'Where you live at present',
            full: true,
            placeholder: 'Write the same address again if you live there now',
          },
        ],
      },
    ],
  },
  {
    label: 'Family & funding',
    sections: [
      {
        title: 'Your family',
        intro:
          'The official form asks for your parents, and your spouse if you are married. Write "Deceased" or "Not known" where that is the honest answer.',
        fields: [],
        groups: [
          {
            title: 'Father',
            fields: [
              { name: 'fatherName', label: 'Name', placeholder: 'Full name' },
              { name: 'fatherOccupation', label: 'Occupation', placeholder: 'e.g. Farmer' },
              { name: 'fatherPhone', label: 'Telephone', type: 'tel', optional: true, placeholder: 'If reachable' },
            ],
          },
          {
            title: 'Mother',
            fields: [
              { name: 'motherName', label: 'Name', placeholder: 'Full name' },
              { name: 'motherOccupation', label: 'Occupation', placeholder: 'e.g. Teacher' },
              { name: 'motherPhone', label: 'Telephone', type: 'tel', optional: true, placeholder: 'If reachable' },
            ],
          },
          {
            title: 'Spouse (only if you are married)',
            fields: [
              { name: 'spouseName', label: 'Name', optional: true, placeholder: 'Leave blank if single' },
              { name: 'spouseOccupation', label: 'Occupation', optional: true, placeholder: 'Leave blank if single' },
              { name: 'spousePhone', label: 'Telephone', type: 'tel', optional: true, placeholder: 'Leave blank if single' },
            ],
          },
        ],
      },
      {
        title: 'Emergency contact',
        intro: 'The person we call if we cannot reach you. It can be one of the people above.',
        fields: [
          { name: 'guardian', label: 'Full name', placeholder: 'Full name' },
          { name: 'guardianRelationship', label: 'Relationship to you', placeholder: 'e.g. Mother, Uncle' },
          { name: 'guardianPhone', label: 'Phone number', type: 'tel', placeholder: '+256 7XX XXX XXX' },
          { name: 'guardianEmail', label: 'Email (optional)', type: 'email', optional: true, placeholder: 'If they have one' },
        ],
      },
      {
        title: 'Who will pay your living costs',
        intro:
          'The scholarship covers tuition, in full or in part. You still need money for your flight, visa and day to day living. Tell us who is responsible for that.',
        fields: [
          {
            name: 'financialSupport',
            label: 'Source of financial support',
            type: 'select',
            options: ['Family', 'Self-support', 'Organization'],
            help: 'This matches the box on the official form.',
          },
          { name: 'sponsorName', label: 'Name of the person paying', placeholder: 'Write your own name if it is you' },
          { name: 'sponsorRelationship', label: 'Relationship to you', placeholder: 'e.g. Father, Self' },
          { name: 'sponsorOccupation', label: 'Their occupation (optional)', optional: true, placeholder: 'e.g. Farmer, Businessman' },
          { name: 'sponsorPhone', label: 'Their phone number', type: 'tel', placeholder: '+256 7XX XXX XXX' },
        ],
      },
    ],
  },
  {
    label: 'Study choice',
    sections: [
      {
        title: 'What you want to study',
        fields: [
          { name: 'course', label: 'Speciality or topic you want to study', placeholder: 'e.g. Civil Engineering', full: true },
          {
            name: 'studentStatus',
            label: 'Student category',
            type: 'select',
            options: [
              'Undergraduate',
              "Master's program",
              "Doctor's program",
              'Language student',
              'General advanced student',
              'Senior advanced student',
            ],
            help: 'The category on the official form. Most applicants are Undergraduate.',
          },
          {
            name: 'teachingMedium',
            label: 'Language of teaching',
            type: 'select',
            options: ['English-taught', 'Chinese-taught'],
          },
          { name: 'durationFrom', label: 'Study period starts', placeholder: 'e.g. September 2026' },
          { name: 'durationTo', label: 'Study period ends (expected)', placeholder: 'e.g. July 2030' },
          {
            name: 'university1',
            label: 'First choice university (optional)',
            optional: true,
            placeholder: 'Leave blank and we will match you',
          },
          { name: 'university2', label: 'Second choice (optional)', optional: true, placeholder: 'Optional' },
          { name: 'university3', label: 'Third choice (optional)', optional: true, placeholder: 'Optional' },
        ],
      },
      {
        title: 'Your history with China',
        intro: 'Answer honestly. A previous application or visit does not count against you.',
        fields: [
          { name: 'studiedInChina', label: 'Have you studied in China before?', type: 'select', options: YES_NO },
          { name: 'appliedBefore', label: 'Have you applied for a Chinese scholarship before?', type: 'select', options: YES_NO },
          { name: 'currentlyInChina', label: 'Are you in China right now?', type: 'select', options: YES_NO },
          {
            name: 'visaType',
            label: 'If yes, your current visa type (optional)',
            optional: true,
            placeholder: 'e.g. X1, X2, tourist',
          },
        ],
      },
    ],
  },
  {
    label: 'Academic & referees',
    sections: [
      {
        title: 'Language ability',
        fields: [
          {
            name: 'englishTest',
            label: 'English proficiency evidence',
            type: 'select',
            options: ['Letter from my school', 'IELTS', 'TOEFL', 'Other', 'None yet'],
          },
          { name: 'englishScore', label: 'Score, if you have one (optional)', optional: true, placeholder: 'e.g. IELTS 6.5' },
          {
            name: 'chineseProficiency',
            label: 'Chinese proficiency',
            type: 'select',
            options: ['None', 'Poor', 'Fair', 'Good', 'Excellent'],
            help: 'These are the levels used on the official form.',
          },
          {
            name: 'hskLevel',
            label: 'HSK certificate level (optional)',
            type: 'select',
            optional: true,
            options: ['None', 'HSK 1', 'HSK 2', 'HSK 3', 'HSK 4', 'HSK 5', 'HSK 6'],
          },
          { name: 'hskMarks', label: 'HSK marks (optional)', optional: true, placeholder: 'e.g. 210' },
        ],
      },
      {
        title: 'Referees',
        intro:
          'The two people writing your recommendation letters. Teachers, lecturers or employers are all acceptable.',
        fields: [],
        groups: [
          {
            title: 'First referee',
            fields: [
              { name: 'referee1Name', label: 'Full name', placeholder: 'e.g. Dr. Okello James' },
              { name: 'referee1Position', label: 'Position', placeholder: 'e.g. Head of Department' },
              { name: 'referee1Institution', label: 'School or organisation', placeholder: 'Where they work' },
              { name: 'referee1Phone', label: 'Phone number', type: 'tel', placeholder: '+256 7XX XXX XXX' },
              { name: 'referee1Email', label: 'Email (optional)', type: 'email', optional: true, placeholder: 'If they have one' },
            ],
          },
          {
            title: 'Second referee',
            fields: [
              { name: 'referee2Name', label: 'Full name', placeholder: 'e.g. Mrs. Achieng Grace' },
              { name: 'referee2Position', label: 'Position', placeholder: 'e.g. Class teacher' },
              { name: 'referee2Institution', label: 'School or organisation', placeholder: 'Where they work' },
              { name: 'referee2Phone', label: 'Phone number', type: 'tel', placeholder: '+256 7XX XXX XXX' },
              { name: 'referee2Email', label: 'Email (optional)', type: 'email', optional: true, placeholder: 'If they have one' },
            ],
          },
        ],
      },
    ],
  },
]

/* Steps 5 and 6 (Documents, Review & submit) are built by the page itself. */
export const STEP_LABELS = [...steps.map((s) => s.label), 'Documents', 'Review & submit']
export const TOTAL_STEPS = STEP_LABELS.length

export const sectionFields = (s: SectionDef): FieldDef[] => [
  ...s.fields,
  ...(s.groups?.flatMap((g) => g.fields) ?? []),
]

export const allFields: FieldDef[] = steps.flatMap((s) =>
  s.sections.flatMap((x) => sectionFields(x)),
)

/* Group titles disambiguate otherwise identical labels ("Full name") in the
   review screen, the generated PDF and the admin panel. */
export const fieldLabels: Record<string, string> = Object.fromEntries(
  steps.flatMap((s) =>
    s.sections.flatMap((sec) => [
      ...sec.fields.map((f) => [f.name, f.label.replace(/ \(optional\)$/, '')] as const),
      ...(sec.groups ?? []).flatMap((g) =>
        g.fields.map(
          (f) => [f.name, `${g.title}: ${f.label.replace(/ \(optional\)$/, '')}`] as const,
        ),
      ),
    ]),
  ),
)

export const emptyForm: Record<string, string> = Object.fromEntries(
  allFields.map((f) => [f.name, '']),
)

/* Sensible defaults for a Ugandan applicant; all remain editable. */
export const formDefaults: Record<string, string> = {
  ...emptyForm,
  nationality: 'Ugandan',
  countryOfBirth: 'Uganda',
  nativeLanguage: 'English',
  teachingMedium: 'English-taught',
  studiedInChina: 'No',
  appliedBefore: 'No',
  currentlyInChina: 'No',
  englishTest: 'Letter from my school',
  chineseProficiency: 'None',
  hskLevel: 'None',
  financialSupport: 'Family',
  durationFrom: 'September 2026',
}

/* ---- Education history (repeatable) ---- */
export interface EducationRow {
  school: string
  from: string
  to: string
  qualification: string
  grades: string
}

export const emptyEducationRow: EducationRow = {
  school: '',
  from: '',
  to: '',
  qualification: '',
  grades: '',
}

export const MAX_EDUCATION_ROWS = 4

/* ---- Employment record (repeatable, as on the official form) ---- */
export interface EmploymentRow {
  employer: string
  from: string
  to: string
  post: string
}

export const emptyEmploymentRow: EmploymentRow = {
  employer: '',
  from: '',
  to: '',
  post: '',
}

export const MAX_EMPLOYMENT_ROWS = 3
