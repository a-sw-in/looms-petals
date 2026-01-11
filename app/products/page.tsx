"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./products.module.css";
import { Navbar } from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";

type Product = {
	id: number;
	name: string;
	image_url: string;
	category: string;
	price: number;
	discount_price: number | null;
	status: string;
	stock: number;
};

export default function ProductsPage() {
	const router = useRouter();
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchAllProducts();
	}, []);

	const fetchAllProducts = async () => {
		try {
			const response = await fetch('/api/admin/products');
			const data = await response.json();

			if (data.success) {
				// Filter out jewellery and show only clothing items
				const clothingProducts = data.data.filter((product: Product) =>
					product.category.toLowerCase() !== 'jewellery' &&
					product.category.toLowerCase() !== 'jewelry'
				);
				setProducts(clothingProducts);
			}
		} catch (error) {
			console.error('Failed to fetch products:', error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
				<Loader />
			</div>
		);
	}

	if (products.length === 0) {
		return (
			<main className={styles.container}>
				<div className={styles.header}>
					<h1 className={styles.title}>All Products</h1>
				</div>
				<div style={{ textAlign: 'center', padding: '80px 20px', color: '#666' }}>
					<p>No products available at the moment.</p>
				</div>
			</main>
		);
	}

	return (
		<>
			<Navbar />
			<main className={styles.container}>
				<button
					className={styles.backButton}
					onClick={() => router.back()}
				>
					← Back
				</button>
				<div className={styles.header}>
					<h1 className={styles.title}>All Products</h1>
					<p className={styles.subtitle}>Browse our complete collection of {products.length} products</p>
				</div>

				<div className={styles.grid}>
					{products.map((product) => {
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

						const discount = product.discount_price
							? Math.round(((product.price - product.discount_price) / product.price) * 100)
							: 0;

						return (
							<div
								key={product.id}
								className={styles.productCard}
								onClick={() => router.push(`/product/${slug}-${product.id}`)}
							>
								<div className={styles.imageWrapper}>
									<img
										src={imageUrl}
										alt={product.name}
										className={styles.productImage}
										onError={(e) => {
											console.error(`Failed to load image for ${product.name}: ${imageUrl}`);
											e.currentTarget.src = `https://picsum.photos/seed/${product.id}/600/700`;
										}}
									/>
									{product.status !== "normal" && product.status !== "trending" && (
										<span className={`${styles.badge} ${styles[product.status]}`}>
											{product.status.replace("_", " ").toUpperCase()}
										</span>
									)}
									{discount > 0 && (
										<span className={styles.discountBadge}>{discount}% OFF</span>
									)}
								</div>

								<div className={styles.details}>
									<h3 className={styles.productName}>{product.name}</h3>
									<p className={styles.categoryText}>{product.category}</p>

									<div className={styles.priceSection}>
										<div className={styles.priceRow}>
											<span className={styles.currentPrice}>
												₹{product.discount_price || product.price}
											</span>
											{product.discount_price && (
												<span className={styles.originalPrice}>₹{product.price}</span>
											)}
										</div>
									</div>

									<div className={styles.stock}>
										{product.stock > 0 ? (
											<span className={styles.inStock}>In Stock ({product.stock})</span>
										) : (
											<span className={styles.outOfStock}>Out of Stock</span>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</main>
			<Footer />
		</>
	);
}
