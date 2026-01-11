"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./Trend.module.css";

type Product = {
	id: number;
	name: string;
	category: string;
	price: number;
	discount_price: number | null;
	image_url: string;
	status: string;
};

export default function Trend() {
	const router = useRouter();
	const [newArrivals, setNewArrivals] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchNewArrivals = async () => {
			try {
				const response = await fetch("/api/admin/products");
				const data = await response.json();

				if (data.success) {
					// Filter products with status "new_arrival"
					const arrivals = data.data.filter(
						(product: Product) => product.status === "new_arrival"
					);
					setNewArrivals(arrivals.slice(0, 4)); // Show only first 4
				}
			} catch (error) {
				console.error("Failed to fetch new arrivals:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchNewArrivals();
	}, []);

	if (loading) {
		return (
			<section className={styles.wrapper} aria-label="Early Winter Drops">
				<h2 className={styles.sectionTitle}>EARLY WINTER DROPS</h2>
				<div className={styles.container}>
					{[1, 2, 3, 4].map((i) => (
						<article key={i} className={styles.card}>
							<div className={styles.imageBox} style={{ background: "#f0f0f0" }}>
								<div style={{ height: "100%", animation: "pulse 1.5s infinite" }} />
							</div>
						</article>
					))}
				</div>
			</section>
		);
	}

	if (newArrivals.length === 0) {
		return null;
	}

	return (
		<section className={styles.wrapper} aria-label="Early Winter Drops">
			<h2 className={styles.sectionTitle}>EARLY WINTER DROPS</h2>
			<div className={styles.container}>
				{newArrivals.map((product, idx) => {
					const slug = product.name
						.toLowerCase()
						.replace(/[^a-z0-9]+/g, "-")
						.replace(/^-+|-+$/g, "");
					
					// Parse image_url to get the first image if it's an array
					let imageUrl = `https://picsum.photos/seed/${product.id}/800/1000`;
					if (product.image_url) {
						try {
							const images = JSON.parse(product.image_url);
							imageUrl = Array.isArray(images) && images.length > 0 && images[0]
								? images[0]
								: (product.image_url || imageUrl);
						} catch {
							imageUrl = product.image_url || imageUrl;
						}
					}
					
					return (
						<article
							key={product.id}
							className={styles.card}
							onClick={() => router.push(`/product/${slug}-${product.id}`)}
							style={{ cursor: "pointer" }}
						>
							<span className={styles.index} aria-hidden>
								{idx + 1}
							</span>
							<div className={styles.imageBox}>
								<img
									src={imageUrl}
									alt={product.name}
									loading="lazy"
								/>
							</div>
							<div className={styles.meta}>
								<h3 className={styles.title}>{product.name}</h3>
								<div className={styles.category}>{product.category}</div>
								<div className={styles.price}>
									₹ {product.price}
								</div>
							</div>
						</article>
					);
				})}
			</div>
		</section>
	);
}

