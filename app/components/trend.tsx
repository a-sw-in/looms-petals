"use client";

import React, { useMemo } from "react";
import styles from "./Trend.module.css";

type TrendItem = {
	id: number;
	title: string;
	category: string;
	price: number;
	img: string;
};

// Simple pseudo data using picsum images - exactly 4 items matching reference
const useTrendData = (): TrendItem[] => {
	return useMemo(
		() => [
			{
				id: 1,
				title: "Hello Kitty: Pink Bow",
				category: "Oversized T-Shirts",
				price: 999,
				img: "https://picsum.photos/seed/trend1/800/1000",
			},
			{
				id: 2,
				title: "Ombre Sweater: Snowberry",
				category: "Sweaters",
				price: 1699,
				img: "https://picsum.photos/seed/trend2/800/1000",
			},
			{
				id: 3,
				title: "Disney: Keep Swimming",
				category: "T-Shirts",
				price: 799,
				img: "https://picsum.photos/seed/trend3/800/1000",
			},
			{
				id: 4,
				title: "Solids: Charcoal (Straight Fit)",
				category: "Jeans",
				price: 1899,
				img: "https://picsum.photos/seed/trend4/800/1000",
			},
		],
		[]
	);
};

const CARD_SCROLL_AMOUNT = 1; // number of cards to move per click

export default function Trend() {
	const items = useTrendData();

	return (
		<section className={styles.wrapper} aria-label="Early Winter Drops">
                <h2 className={styles.sectionTitle}>EARLY WINTER DROPS</h2>
			<div className={styles.container}>
				{items.map((item, idx) => (
					<article key={item.id} className={styles.card}>
							<span className={styles.index} aria-hidden>
								{idx + 1}
							</span>
						<div className={styles.imageBox}>
							<img src={item.img} alt={item.title} loading="lazy" />
						</div>
						<div className={styles.meta}>
							<h3 className={styles.title}>{item.title}</h3>
							<div className={styles.category}>{item.category}</div>
							<div className={styles.price}>₹ {item.price}</div>
						</div>
					</article>
				))}
			</div>

			

		</section>
	);
}

