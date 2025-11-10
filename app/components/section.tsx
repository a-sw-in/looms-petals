"use client";

import { useMemo, useState } from "react";
import styles from "./SectionCarousel.module.css";

// List of videos in public/videos folder
const videoFiles = [
	"Duppattawaaali🥻🥻Cc-@zaith_designer_boutique.mp4",
	"get.mp4",
	"SnapInsta.to_AQOle-lA8bb_y0IIOn_PuTUPU1GeP_ymBYORLBxKk-KIgMio-_K-K0bdi4oe3_7w9NqvSdjZN-Lvq4h6S2dJYlerQeUgzgw3lg9w3mg.mp4",
	"SnapInsta.to_AQOXJdSzke14mXgYD9MnuYXQH9F0CzYxMdCLpU2cxVs1ymIogEEEVbKIC5oU7A6NmSUvtCkCsp_tU0F9E6hojZrbJar98NRw_yuXhRQ.mp4",
	"SnapInsta.to_AQPS78crYEHyHAVLkptiTVxdxXWdzvgtWaa15GdILrvlxFMuStgIBIr2qoZC7ayrhxFS1CtvHwZ2Uqr-ffUDUUE82b4QttlzPq6IuLk.mp4"
];

// Simple chevron icons
function Chevron({ dir = "left" }: { dir?: "left" | "right" }) {
	return (
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4b1f1f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
			{dir === "left" ? <path d="M15 18l-6-6 6-6"/> : <path d="M9 6l6 6-6 6"/>}
		</svg>
	);
}

export default function Section() {
	const [active, setActive] = useState(0);

	// Ensure we at least have 5 items to achieve stacked look by looping
	const data = useMemo(() => {
		if (videoFiles.length >= 5) return videoFiles;
		const dup: string[] = [];
		while (dup.length < 5) {
			dup.push(...videoFiles);
		}
		return dup.slice(0, 5);
	}, []);

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
				{data.map((videoFile, idx) => {
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
								<video
									src={`/videos/${videoFile}`}
									muted
									autoPlay
									loop
									playsInline
									preload="metadata"
								/>
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

