"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import styles from "./SectionCarousel.module.css";
import { carouselData as baseData } from "./carouselData";

function ytEmbedUrl(idOrUrl: string) {
	// Accept raw id or full URL (shorts/watch). Extract the 11-char id when possible.
	try {
		const m = idOrUrl.match(/[a-zA-Z0-9_-]{11}/);
		const id = m ? m[0] : idOrUrl;
		const params = new URLSearchParams({
			autoplay: "1",
			mute: "1",
			loop: "1",
			controls: "0",
			modestbranding: "1",
			rel: "0",
			playlist: id, // needed for loop
			playsinline: "1",
		});
		return `https://www.youtube.com/embed/${id}?${params.toString()}`;
	} catch {
		return idOrUrl;
	}
}

// Simple chevron icons
function Chevron({ dir = "left" }: { dir?: "left" | "right" }) {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b1f1f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
			{dir === "left" ? <path d="M15 18l-6-6 6-6"/> : <path d="M9 6l6 6-6 6"/>}
		</svg>
	);
}

export default function Section() {
	// Ensure we at least have 5 items to achieve stacked look by looping
	const data = useMemo(() => {
		if (baseData.length >= 5) return baseData;
		const dup: typeof baseData = [] as any;
		while (dup.length < 5) {
			dup.push(...baseData);
		}
		return dup.slice(0, 5);
	}, []);

	const [active, setActive] = useState(0);
	const total = data.length;

	const go = (dir: -1 | 1) => setActive((i) => (i + dir + total) % total);

	return (
		<section className={styles.section}>
			<h2 className={styles.heading}>Shine in Every Step</h2>
			<p className={styles.subheading}>Outfits and jewelry that look stunning both in real life and on your feed</p>

			<div className={styles.stage}>
				{/* Arrows */}
				<button aria-label="Previous" className={`${styles.arrowBtn} ${styles.arrowLeft}`} onClick={() => go(-1)}>
					<Chevron dir="left" />
				</button>
				<button aria-label="Next" className={`${styles.arrowBtn} ${styles.arrowRight}`} onClick={() => go(1)}>
					<Chevron dir="right" />
				</button>

				{/* Cards - we render 5 visual positions based on active index */}
				{data.map((slide, idx) => {
					// Compute relative position to active (wrap-around)
					let rel = (idx - active + total) % total; // 0 is active, 1 right1, 2 right2, ...
					let cls = styles.cardActive;
					if (rel === 0) cls = styles.cardActive;
					else if (rel === 1) cls = styles.cardBehindR1;
					else if (rel === 2) cls = styles.cardBehindR2;
					else if (rel === total - 1) cls = styles.cardBehind1; // left1
					else if (rel === total - 2) cls = styles.cardBehind2; // left2
					else return null; // hide extra items further away

											return (
									<article key={idx} className={`${styles.card} ${cls}`}>
										<div className={styles.media}>
														{slide.youtube ? (
															<iframe
																src={ytEmbedUrl(slide.youtube)}
																title={slide.title}
																allow="autoplay; encrypted-media; picture-in-picture"
																allowFullScreen
																style={{ width: "100%", height: "100%", border: 0 }}
															/>
														) : slide.video ? (
												<video
													src={slide.video}
													muted
													autoPlay
													loop
													playsInline
													preload="metadata"
													aria-label={slide.title}
												/>
											) : (
												<Image
													src={slide.image || "/Images/Home.png"}
													alt={slide.title}
													fill
													sizes="(max-width: 1100px) 90vw, 1100px"
													style={{ objectFit: "cover" }}
													priority={idx === active}
												/>
											)}
										</div>
										<div className={styles.caption}>
											<strong>{slide.title}</strong>
											<div>{slide.description}</div>
										</div>
									</article>
								);
				})}

				<div className={styles.indicators}>
					{Array.from({ length: total }).map((_, i) => (
						<div key={i} className={`${styles.dot} ${i === active ? styles.dotActive : ""}`} />
					))}
				</div>
			</div>
		</section>
	);
}

