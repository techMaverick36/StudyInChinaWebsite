import { ArrowRight } from "lucide-react";
import { usePageMeta } from "../lib/meta";
import { useScholarships } from "../lib/scholarshipStore";
import { procSteps } from "../data/content";
import { photos, photoBlurs } from "../data/photos";
import HeroBackdrop from "../components/HeroBackdrop";
import Button from "../components/Button";
import ScholarshipCard from "../components/ScholarshipCard";
import SectionHeader from "../components/SectionHeader";
import CtaBand from "../components/CtaBand";

export default function Home() {
	usePageMeta(
		"Scholarships in China for African Students | StudyInChinaNow",
		"Apply for scholarships at accredited Chinese universities: Bachelor's, Master's and Chinese language. Tuition covered in full or in part. Office in Kampala, Uganda.",
	);

	const topScholarships = useScholarships().slice(0, 3);

	return (
		<div>
			{/* Hero */}
			<section className="hero">
				<div className="hero-bg">
					<HeroBackdrop
						src={photos.home}
						blur={photoBlurs.home}
						/* Keeps the laughing graduate on the right in frame, down to a phone-width crop. */
						position="78% center"
					/>
					<div className="hero-gradient" />
					<div className="hero-slash" />
					<div className="hero-inner">
						<div className="hero-copy">
							<h1 className="hero-title">
								Scholarships in China for African students
							</h1>
							<p className="hero-lede">
								Study at an accredited Chinese university with tuition covered in
								full or in part. Apply online in about 15 minutes, and our Kampala
								office guides you through admission, visa and travel.
							</p>
							<div className="hero-ctas">
								<Button to="/apply" size="lg" icon={ArrowRight}>
									Apply now
								</Button>
								<Button to="/scholarships" size="lg" variant="outline-light">
									See the scholarships
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Open scholarships. Leads the page: what is on offer answers the
			    visitor's first question before the process explains how to get it. */}
			<section className="home-scholarships">
				<div className="container section-pad">
					<SectionHeader
						title="Scholarship programmes"
						aside={
							<Button to="/scholarships" variant="text" icon={ArrowRight}>
								See all scholarships
							</Button>
						}
					/>
					<div className="card-grid">
						{topScholarships.map((c) => (
							<ScholarshipCard
								key={c.id}
								scholarship={c}
								compact
								headingLevel="h3"
							/>
						))}
					</div>
				</div>
			</section>

			{/* The Process. Follows the scholarships: once someone has seen what is
			    on offer, this answers how to get it. */}
			<section className="section-navy home-process">
				<div className="container section-pad">
					<SectionHeader title="Apply in 4 steps" onDark />
					<ol className="proc-grid">
						{procSteps.map((g) => (
							<li className="proc-cell" key={g.num}>
								<span className="proc-num">Step {Number(g.num)}</span>
								<h3 className="proc-title">{g.title}</h3>
								<p className="proc-short">{g.short}</p>
							</li>
						))}
					</ol>
					<div className="howto-cta-row">
						<Button to="/how-to-apply" variant="outline-light">
							Read the full application guide
						</Button>
					</div>
				</div>
			</section>

			{/* Student voices — hidden until the students approve their quotes.
			    The section markup lives in git history; `alumni` in
			    src/data/content.ts holds the drafts. */}

			<CtaBand text="Places on each programme are limited. Submit your application now and the Kampala office calls you within 3 working days." />
		</div>
	);
}
