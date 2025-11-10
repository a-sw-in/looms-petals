"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./CardSection.module.css";

type Product = {
	id: number;
	name: string;
	image_url: string;
	category: string;
	price: number;
	status: string;
};

export default function CardSection() {
	const router = useRouter();
	const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchTrendingProducts();
	}, []);

	const fetchTrendingProducts = async () => {
		try {
			const response = await fetch('/api/admin/products');
			const data = await response.json();
			
			if (data.success) {
				// Filter only trending products
				const trending = data.data.filter((product: Product) => product.status === 'trending');
				setTrendingProducts(trending);
			}
		} catch (error) {
			console.error('Failed to fetch trending products:', error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<section className={styles.wrapper}>
				<h2 className={styles.heading}>TRENDING</h2>
				<div className={styles.grid}>
					{[1, 2, 3, 4, 5, 6].map((i) => (
						<div key={i} className={styles.card}>
							<div className={styles.imageContainer} style={{ background: '#f0f0f0' }}>
								<div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
									Loading...
								</div>
							</div>
							<h3 className={styles.label}>•••</h3>
						</div>
					))}
				</div>
			</section>
		);
	}

	if (trendingProducts.length === 0) {
		return (
			<section className={styles.wrapper}>
				<h2 className={styles.heading}>TRENDING</h2>
				<div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
					<p>No trending products available at the moment.</p>
				</div>
			</section>
		);
	}

	return (
		<section className={styles.wrapper}>
			<h2 className={styles.heading}>TRENDING</h2>
			<div className={styles.grid}>
				{trendingProducts.map((product) => {
					const slug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
					
					// Parse image_url to get the first image if it's an array
					let imageUrl = `https://picsum.photos/seed/${product.id}/600/700`;
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
						<article key={product.id} className={styles.card}>
							<section 
								className={styles.cardHero}
								style={{ backgroundImage: `url(${imageUrl})` }}
							>
								<header className={styles.cardHeroHeader}>
								</header>
								<p className={styles.cardJobTitle}>{product.name}</p>
								<p className={styles.cardJobTitle1}>{product.category}</p>
									
							</section>
							<footer className={styles.cardFooter}>
								<div className={styles.cardJobSummary}>
									<div className={styles.cardJob}>
										<p className={styles.cardJobCategory}>₹{product.price}</p>
									</div>
								</div>
								<button 
									className={styles.cardBtn}
									onClick={() => router.push(`/product/${slug}-${product.id}`)}
								>
									view
								</button>
							</footer>
						</article>
					);
				})}
			</div>
		</section>
	);
}
