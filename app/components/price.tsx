"use client";

import React, { useMemo } from "react";
import styles from "./Price.module.css";

type PriceCard = {
	id: number;
	category: string;
	price: number;
	bgColor: string;
};

const usePriceData = (): PriceCard[] => {
	return useMemo(
		() => [
			{ id: 1, category: "T-shirts", price: 599, bgColor: "rgba(252, 231, 243, 0.4)" },
			{ id: 2, category: "Shirts", price: 999, bgColor: "rgba(254, 243, 199, 0.4)" },
			{ id: 3, category: "Footwear", price: 1499, bgColor: "rgba(252, 231, 243, 0.4)" },
			{ id: 4, category: "Kidswear", price: 499, bgColor: "rgba(254, 243, 199, 0.4)" },
			{ id: 5, category: "Watches", price: 3499, bgColor: "rgba(252, 231, 243, 0.4)" },
			{ id: 6, category: "Handbags", price: 1499, bgColor: "rgba(254, 243, 199, 0.4)" },
			{ id: 7, category: "Denim", price: 999, bgColor: "rgba(252, 231, 243, 0.4)" },
			{ id: 8, category: "Dresses", price: 599, bgColor: "rgba(254, 243, 199, 0.4)" },
			{ id: 9, category: "Kurtas & Kurtis", price: 599, bgColor: "rgba(252, 231, 243, 0.4)" },
		],
		[]
	);
};

export default function Price() {
	const items = usePriceData();

	return (
		<section className={styles.wrapper}>
			<div className={styles.scrollContainer}>
				<div className={styles.track}>
					{items.map((item) => (
						<div
							key={item.id}
							className={styles.card}
							style={{ backgroundColor: item.bgColor }}
						>
							<h3 className={styles.category}>{item.category}</h3>
							<div className={styles.priceLabel}>STARTING</div>
							<div className={styles.price}>₹{item.price}</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
