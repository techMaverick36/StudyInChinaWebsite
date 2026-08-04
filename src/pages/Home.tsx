import { useNavigate } from "react-router-dom";
import { usePageMeta } from "../lib/meta";
import { badgeBg, scholarships } from "../data/scholarships";
import { procSteps } from "../data/content";
import heroImg from "../assets/hero.jpg";

export default function Home() {
	const navigate = useNavigate();
	usePageMeta(
		"StudyInChinaNow | Scholarships in China for Ugandan Students",
		"We help Ugandan students win scholarships at accredited Chinese universities, with tuition covered in full or in part. Kampala office, real people.",
	);

	const topScholarships = scholarships.slice(0, 3);

	return (
		<div>
			{/* Hero */}
			<section className="hero">
				<div
					className="hero-bg"
					style={{
						background: `linear-gradient(90deg, rgba(11,22,35,.92) 0%, rgba(11,22,35,.72) 42%, rgba(11,22,35,.32) 70%), url(${heroImg})`,
						backgroundSize: "cover",
						backgroundPosition: "center right",
					}}
				>
					<div className="hero-slash" />
					<div className="hero-inner">
						<div className="hero-copy">
							<p className="hero-eyebrow">
								Fully-funded scholarships · 2026 intake
							</p>
							<h1 className="hero-title">Study in China, fully funded</h1>
							<p className="hero-lede">
								We help Ugandan students win scholarships at accredited Chinese
								universities, with tuition covered in full or in part. You apply
								once, from Kampala, and we guide you the whole way.
							</p>
							<div className="hero-ctas">
								<button
									className="btn-hero-red"
									onClick={() => navigate("/apply")}
								>
									Apply Now →
								</button>
								<button
									className="btn-hero-ghost"
									onClick={() => navigate("/scholarships")}
								>
									View Scholarships →
								</button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* The Process */}
			<section style={{ background: "#fff" }}>
				<div className="container section-pad">
					<p className="eyebrow-red">The process</p>
					<h2 className="sec-title">Four steps to enrollment</h2>
					<div className="proc-grid">
						{procSteps.map((g) => (
							<div className="proc-cell" key={g.num}>
								<div className="proc-num">{g.num}</div>
								<h3 className="proc-title">{g.title}</h3>
								<p className="proc-short">{g.short}</p>
							</div>
						))}
					</div>
					<div className="howto-cta-row">
						<button className="btn-red-md" onClick={() => navigate("/apply")}>
							Apply Now
						</button>
					</div>
				</div>
			</section>

			{/* Open scholarships */}
			<section className="section-navy">
				<div className="container section-pad">
					<div className="navy-head">
						<div>
							<p className="eyebrow-gold">2026 intake</p>
							<h2 className="sec-title-ondark">Open scholarships</h2>
						</div>
					</div>
					<div className="sch-cards">
						{topScholarships.map((c) => (
							<div className="sch-card" key={c.id}>
								<div className="sch-card-top">
									<span
										className="sch-badge"
										style={{ background: badgeBg(c.status) }}
									>
										{c.status}
									</span>
									<span className="sch-card-close">{c.closingLabel}</span>
								</div>
								<h3 className="sch-card-title">{c.title}</h3>
								<div className="sch-card-loc">{c.location}</div>
								<div className="sch-kv">
									<span className="sch-kv-k">LEVEL</span>
									<span className="sch-kv-v">{c.levels}</span>
								</div>
								<div className="sch-kv">
									<span className="sch-kv-k">CLOSES</span>
									<span className="sch-kv-v">{c.closingKV}</span>
								</div>
								<button
									className="btn-card-red"
									onClick={() => navigate(`/scholarships/${c.id}`)}
								>
									View This Scholarship
								</button>
							</div>
						))}
					</div>
					<div className="view-all-wrap">
						<button
							className="btn-outline-light"
							onClick={() => navigate("/scholarships")}
						>
							View All Scholarships
						</button>
					</div>
				</div>
			</section>

			{/* Student voices — hidden until the students approve their quotes.
			    The section markup lives in git history; `alumni` in
			    src/data/content.ts holds the drafts. */}

			{/* CTA band. Light rather than solid red: with Student Voices hidden the
			    navy band above would otherwise run straight into red, and red is
			    reserved for the action itself. Drop the `light` class to restore
			    the original red band. */}
			<section className="cta-band light">
				<div className="cta-inner">
					<h2 className="cta-title">Ready to study in China?</h2>
					<p className="cta-p">
						Applications for the 2026 intake are open. Spots are limited —
						submit your details today.
					</p>
					<button className="btn-cta-red" onClick={() => navigate("/apply")}>
						Begin Your Application
					</button>
				</div>
			</section>
		</div>
	);
}
