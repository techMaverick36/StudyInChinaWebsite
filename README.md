# StudyInChinaNow

Production website for StudyInChinaNow, a scholarship placement service helping
Ugandan students study at Chinese universities on fully funded scholarships.
Built from the client-approved clickable prototype; the layout, spacing,
colours, fonts, section order and button placement follow the prototype exactly.

## Stack

- React 19 + TypeScript + Vite
- react-router-dom for real page URLs (per-page titles and meta descriptions)
- Plain CSS in `src/index.css`, transcribed 1:1 from the prototype's approved styles
- Fonts: Source Serif 4 (headings, logo) and Inter (everything else), via Google Fonts

## Commands

```bash
npm run dev      # start the dev server
npm run build    # type-check and build to dist/
npm run preview  # serve the production build locally
```

Note: this is a single-page app. When deploying, configure the host to serve
`index.html` for all routes (most static hosts call this "SPA fallback" or
"rewrite all to index.html").

## Where things live

- `src/pages/` — one file per page (Home, Scholarships, ScholarshipDetail, HowToApply, Requirements, Contact, Apply, Admin)
- `src/data/scholarships.ts` — the scholarship programmes' copy and facts
- `src/data/content.ts` — contact details, FAQ, document list, process steps, testimonials
- `src/lib/submit.ts` — saves applications and contact messages to Supabase (simulates success when Supabase is not configured)
- `src/pages/Admin.tsx` — the internal admin panel at `/admin`
- `public/forms/` — downloadable blank forms (currently placeholders)

## The generated Foreign Student Application Form

Applicants do not download, print, fill in and scan the official form. They
answer the questions online (steps 1–4 of the application) and the site builds
the completed form as a PDF at submission time:

- `src/data/applicationForm.ts` — **the single source of truth for every field.**
  Add a field here and it appears in the form, the review screen, the generated
  PDF, the admin panel and the CSV export automatically.
- `src/lib/pdf.ts` — a small dependency-free PDF writer.
- `src/lib/applicationPdf.ts` — lays the answers out as the official form.

The generated PDF is stored with the applicant's other documents (so the office
can preview and download it from `/admin`) and offered to the applicant on the
confirmation screen.

## Supabase (forms backend + admin panel)

Applications, uploaded documents and contact messages are stored in Supabase.
The admin panel at `/admin` (not linked from the public navigation) lets the
client review applications, download documents, set statuses, export CSV and
read contact messages.

One-time setup:

1. Create a project at supabase.com.
2. Copy `.env.example` to `.env.local` and fill in the Project URL and the
   publishable (anon) key from Project Settings → API keys. Restart `npm run dev`.
3. Run `supabase/setup.sql` in the dashboard (SQL Editor → paste → Run). This
   creates the two tables, the private `application-files` storage bucket, and
   the row level security policies (public may only submit; only signed-in
   admins may read).
4. Authentication → Sign In / Up: **disable public sign-ups** so nobody can
   self-register.
5. Authentication → URL Configuration: set the Site URL to the production
   domain and add it (plus `http://localhost:5173` for development) to the
   allowed redirect URLs, so emailed login links work.
6. Create the client's account **without knowing their password**:
   Authentication → Users → Add user → enter their email → Send invitation.
   They click the emailed link, land on `/admin`, and set their own password
   under Account → Change password. If they ever forget it, the "Email me a
   login link" button on the sign-in screen gets them back in.

## Outstanding content (awaiting client)

All of these are clearly marked in the code and, where visible, on the page:

1. **Photos** — the home hero uses the prototype photo; every interior page hero
   shows a striped placeholder with a `PHOTO — …` badge naming the shot needed
   (campus, office, students with documents, etc.). Map placeholder on Contact.
2. **Student testimonials — needs written consent before launch.** The names on
   the home page (Janat Namugga, Patrick) are real students taken from the
   admission letters. **The quotes are drafts written for them, not words they
   said.** Each student must read and approve their own quote in writing before
   this section goes live. Also still needed: Patrick's surname, and each
   student's university and intake year. See `alumni` in `src/data/content.ts`,
   where every entry carries `approved: false` until that is done.
3. **Contact details** — phone number, WhatsApp number and email in
   `src/data/content.ts` are the prototype values; confirm before launch.
4. **Blank downloadable forms** — the PDFs in `public/forms/` are marked
   placeholders; replace with the real recommendation letter and study plan
   templates, then re-zip as `StudyInChinaNow-blank-forms.zip`. The foreign
   student application form is no longer downloaded: the site generates it (see
   below), but the real form should still be checked against
   `src/data/applicationForm.ts` so every field the universities ask for is
   collected.
5. **Form backends** — application and contact forms currently simulate success
   (`src/lib/submit.ts`); connect to a real endpoint.
6. **Copy to confirm with the office** — service fee wording (FAQ "Are there any
   fees?" and each scholarship's Fees paragraph), and response time promises
   ("within three working days").
7. **Scholarship details to confirm** — the three programmes come from the
   partner flyers (Sep 2026 intake). Still needed: exact application deadlines
   (labelled "to be confirmed" on the site), the university names for the
   top-ranking and tuition-free programmes, and whether a study plan is
   required for Bachelor's applicants (flyer 2 lists it; the Requirements page
   currently marks it Master's & PhD only).
7. **Favicon** — a simple placeholder in brand colours; replace with the real mark.
