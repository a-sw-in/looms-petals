
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import styles from "./ProductPage.module.css";
import { Navbar } from "../../components/Navbar";
import Footer from "../../components/Footer";
import Loader from "../../components/Loader";

type Product = {
	id: number;
	name: string;
	description: string;
	price: number;
	discount_price: number | null;
	category: string;
	subcategory: string | null;
	brand: string | null;
	image_url: string;
	images: string[];
	stock: number;
	sizes: string[];
	colors: string[];
	status: string;
	type: string;
	is_featured: boolean;
	created_at: string;
};

// Skeleton loader component
const ProductSkeleton = () => (
	<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
		<Loader />
	</div>
);

export default function ProductPage() {
	const params = useParams();
	const router = useRouter();
	const { addToCart, setIsCartOpen, items } = useCart();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [selectedSize, setSelectedSize] = useState<string>("");
	const [selectedColor, setSelectedColor] = useState<string>("");
	const [quantity, setQuantity] = useState(1);
	const [currentImage, setCurrentImage] = useState(0);
	const [addingToCart, setAddingToCart] = useState(false);
	const [showGallery, setShowGallery] = useState(false);
	const [expandedImage, setExpandedImage] = useState<number | null>(null);

	// Zoom State
	const [zoom, setZoom] = useState(1);
	const [position, setPosition] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

	const fetchProduct = useCallback(async (slug: string) => {
		try {
			// Extract ID from slug (format: "product-name-123")
			const id = slug.split('-').pop();
			if (!id) {
				router.push("/");
				return;
			}

			const response = await fetch(`/api/admin/products?id=${id}`);
			const data = await response.json();

			if (data.success) {
				setProduct(data.data);
			} else {
				router.push("/");
			}
		} catch (error) {
			console.error("Failed to fetch product:", error);
			router.push("/");
		} finally {
			setLoading(false);
		}
	}, [router]);

	useEffect(() => {
		if (params.slug) {
			fetchProduct(params.slug as string);
		}
	}, [params.slug, fetchProduct]);

	const images = useMemo(() => {
		if (!product) return [];

		// Try to parse image_url if it's a JSON array
		if (product.image_url) {
			try {
				const parsedImages = JSON.parse(product.image_url);
				if (Array.isArray(parsedImages) && parsedImages.length > 0) {
					return parsedImages;
				}
			} catch {
				// If parse fails, it's a single URL string
				return [product.image_url];
			}
		}

		// Fallback to product.images array or placeholder
		return product.images && product.images.length > 0
			? product.images
			: [`https://picsum.photos/seed/${product.id}/800/1000`];
	}, [product]);

	const discount = useMemo(() => {
		if (!product?.discount_price) return 0;
		return Math.round(((product.price - product.discount_price) / product.price) * 100);
	}, [product]);

	const handleQuantityChange = useCallback((delta: number) => {
		setQuantity((prev) => {
			const newQty = prev + delta;
			return Math.max(1, Math.min(product?.stock || 1, newQty));
		});
	}, [product?.stock]);

	const handleImageChange = useCallback((index: number) => {
		setCurrentImage(index);
	}, []);

	const handleGalleryOpen = useCallback(() => {
		setShowGallery(true);
	}, []);

	const handleGalleryClose = useCallback(() => {
		setShowGallery(false);
		setExpandedImage(null);
	}, []);

	const handleZoom = useCallback((delta: number) => {
		setZoom(prev => {
			const next = prev + delta;
			return Math.max(1, Math.min(5, next));
		});
	}, []);

	const resetZoom = useCallback(() => {
		setZoom(1);
		setPosition({ x: 0, y: 0 });
	}, []);

	const handleImageExpand = useCallback((index: number) => {
		resetZoom();
		setExpandedImage(index);
	}, [resetZoom]);

	const handleImageCollapse = useCallback(() => {
		setExpandedImage(null);
		resetZoom();
	}, [resetZoom]);

	// Mouse events for zoom/pan
	const handleWheel = useCallback((e: React.WheelEvent) => {
		const delta = e.deltaY > 0 ? -0.5 : 0.5;
		handleZoom(delta);
	}, [handleZoom]);

	const onMouseDown = useCallback((e: React.MouseEvent) => {
		if (zoom > 1) {
			setIsDragging(true);
			setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
		}
	}, [zoom, position]);

	const onMouseMove = useCallback((e: React.MouseEvent) => {
		if (isDragging && zoom > 1) {
			setPosition({
				x: e.clientX - dragStart.x,
				y: e.clientY - dragStart.y
			});
		}
	}, [isDragging, zoom, dragStart]);

	const onMouseUp = useCallback(() => {
		setIsDragging(false);
	}, []);

	// Touch events for zoom/pan
	const onTouchStart = useCallback((e: React.TouchEvent) => {
		if (e.touches.length === 1 && zoom > 1) {
			setIsDragging(true);
			setDragStart({
				x: e.touches[0].clientX - position.x,
				y: e.touches[0].clientY - position.y
			});
		}
	}, [zoom, position]);

	const onTouchMove = useCallback((e: React.TouchEvent) => {
		if (isDragging && e.touches.length === 1 && zoom > 1) {
			setPosition({
				x: e.touches[0].clientX - dragStart.x,
				y: e.touches[0].clientY - dragStart.y
			});
		}
	}, [isDragging, zoom, dragStart]);


	const handleAddToCart = useCallback(() => {
		if (!product) return;

		// Validate selections
		if (product.sizes?.length > 0 && !selectedSize) {
			alert("Please select a size");
			return;
		}
		if (product.colors?.length > 0 && !selectedColor) {
			alert("Please select a color");
			return;
		}

		setAddingToCart(true);

		// Parse image_url to get the first image if it's an array
		let imageUrl = product.image_url;
		if (product.image_url) {
			try {
				const images = JSON.parse(product.image_url);
				if (Array.isArray(images) && images.length > 0 && images[0]) {
					imageUrl = images[0];
				}
			} catch {
				// If parse fails, use the original value (it's already a string URL)
				imageUrl = product.image_url;
			}
		}

		const success = addToCart({
			id: product.id,
			name: product.name,
			price: product.price,
			discount_price: product.discount_price,
			image_url: imageUrl,
			selectedSize: selectedSize || undefined,
			selectedColor: selectedColor || undefined,
			brand: product.brand || '',
			category: product.category,
			stock: product.stock,
		}, quantity);

		if (success) {
			// Show cart sidebar
			setIsCartOpen(true);
		} else {
			// Stock exceeded
			alert(`Cannot add to cart. Only ${product.stock} items available in stock.`);
		}

		// Reset adding state
		setTimeout(() => setAddingToCart(false), 300);
	}, [product, quantity, selectedSize, selectedColor, addToCart, setIsCartOpen]);

	const handleBuyNow = useCallback(() => {
		handleAddToCart();
		router.push("/checkout");
	}, [handleAddToCart, router]);

	// Calculate quantity already in cart
	const quantityInCart = useMemo(() => {
		if (!product) return 0;

		return items
			.filter(
				(item) =>
					item.id === product.id &&
					item.selectedSize === (selectedSize || undefined) &&
					item.selectedColor === (selectedColor || undefined)
			)
			.reduce((sum, item) => sum + item.quantity, 0);
	}, [items, product, selectedSize, selectedColor]);

	// Check if any variant of this product is in cart (for button display)
	const isInCart = useMemo(() => {
		if (!product) return false;
		return items.some((item) => item.id === product.id);
	}, [items, product]);

	// Get total quantity of this product in cart (all variants)
	const totalInCart = useMemo(() => {
		if (!product) return 0;
		return items
			.filter((item) => item.id === product.id)
			.reduce((sum, item) => sum + item.quantity, 0);
	}, [items, product]);

	// Calculate available quantity to add
	const availableToAdd = useMemo(() => {
		if (!product) return 0;
		return product.stock - quantityInCart;
	}, [product, quantityInCart]);

	const handleViewCart = useCallback(() => {
		setIsCartOpen(true);
	}, [setIsCartOpen]);

	if (loading) {
		return <ProductSkeleton />;
	}

	if (!product) {
		return null;
	}

	// Structured data for SEO
	const structuredData = {
		"@context": "https://schema.org/",
		"@type": "Product",
		name: product.name,
		image: images,
		description: product.description || `${product.name} - ${product.category}`,
		brand: {
			"@type": "Brand",
			name: product.brand || "Looms & Petals",
		},
		offers: {
			"@type": "Offer",
			url: typeof window !== "undefined" ? window.location.href : "",
			priceCurrency: "INR",
				price: product.discount_price || product.price,
			availability:
				product.stock > 0
					? "https://schema.org/InStock"
					: "https://schema.org/OutOfStock",
			priceValidUntil: new Date(
				Date.now() + 30 * 24 * 60 * 60 * 1000
			).toISOString(),
		},
		category: product.category,
	};

	return (
		<>
			<Navbar />
			{/* SEO: Structured Data */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>

			{/* Image Gallery Modal */}
			{showGallery && (
				<div className={styles.galleryModal} onClick={handleGalleryClose}>
					<div className={styles.galleryContent} onClick={(e) => e.stopPropagation()}>
						<button className={styles.galleryClose} onClick={handleGalleryClose}>
							✕
						</button>
						<div className={styles.galleryGrid}>
							{images.map((img, index) => (
								<div
									key={index}
									className={styles.galleryItem}
									onClick={() => handleImageExpand(index)}
								>
									<Image
										src={img}
										alt={`${product.name} ${index + 1}`}
										fill
										sizes="(max-width: 768px) 100vw, 33vw"
										quality={80}
										style={{ objectFit: "cover" }}
									/>
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* Expanded Image Modal */}
			{expandedImage !== null && (
				<div
					className={styles.expandedModal}
					onClick={handleImageCollapse}
					onWheel={handleWheel}
				>
					<button className={styles.expandedClose} onClick={handleImageCollapse}>
						✕
					</button>
					<div
						className={styles.expandedImageWrapper}
						onClick={(e) => e.stopPropagation()}
						onMouseDown={onMouseDown}
						onMouseMove={onMouseMove}
						onMouseUp={onMouseUp}
						onMouseLeave={onMouseUp}
						onTouchStart={onTouchStart}
						onTouchMove={onTouchMove}
						onTouchEnd={onMouseUp}
					>
						<div
							className={styles.zoomContainer}
							style={{
								transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
								cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
							}}
						>
							<Image
								src={images[expandedImage]}
								alt={`${product.name} ${expandedImage + 1}`}
								fill
								sizes="100vw"
								quality={100}
								style={{ objectFit: "contain" }}
								priority
								draggable={false}
							/>
						</div>

						{/* Zoom Controls */}
						<div className={styles.zoomControls}>
							<button onClick={() => handleZoom(0.5)} aria-label="Zoom In">+</button>
							<button onClick={() => handleZoom(-0.5)} aria-label="Zoom Out">−</button>
							<button onClick={resetZoom} aria-label="Reset Zoom">↺</button>
						</div>
					</div>
				</div>
			)}

			<div className={styles.container}>
				<div className={styles.wrapper}>
					{/* Back Button */}
					<button onClick={() => router.back()} className={styles.backBtn}>
						← Back
					</button>

					<div className={styles.productGrid}>
						{/* Image Gallery */}
						<div className={styles.imageSection}>
							<div className={styles.mainImage}>
								<Image
									src={images[currentImage]}
									alt={product.name}
									fill
									sizes="(max-width: 768px) 100vw, 50vw"
									priority={currentImage === 0}
									quality={85}
									style={{ objectFit: "cover" }}
								/>
								{product.status !== "normal" && (
									<span className={`${styles.statusBadge} ${styles[product.status]}`}>
										{product.status.replace("_", " ").toUpperCase()}
									</span>
								)}
							</div>
							{images.length > 1 && (
								<div className={styles.thumbnails}>
									{images.slice(0, 2).map((img, index) => (
										<button
											key={index}
											className={`${styles.thumbnail} ${currentImage === index ? styles.activeThumbnail : ""
												}`}
											onClick={() => handleImageChange(index)}
											aria-label={`View image ${index + 1}`}
										>
											<Image
												src={img}
												alt={`${product.name} ${index + 1}`}
												fill
												sizes="100px"
												quality={60}
												style={{ objectFit: "cover" }}
											/>
										</button>
									))}
									{images.length > 2 && (
										<button
											className={`${styles.thumbnail} ${styles.showAllThumbnail}`}
											onClick={handleGalleryOpen}
											aria-label="View all images"
										>
											<Image
												src={images[2]}
												alt={`${product.name} 3`}
												fill
												sizes="100px"
												quality={60}
												style={{ objectFit: "cover" }}
											/>
											<div className={styles.showAllOverlay}>
												<span className={styles.showAllText}>+{images.length - 2}</span>
												<span className={styles.showAllLabel}>View All</span>
											</div>
										</button>
									)}
								</div>
							)}
						</div>

						{/* Product Details */}
						<div className={styles.detailsSection}>
							<div className={styles.breadcrumb}>
								{product.type} / {product.category}
							</div>

							<h1 className={styles.productName}>{product.name}</h1>

							{product.brand && (
								<p className={styles.brand}>by {product.brand}</p>
							)}

							<div className={styles.priceSection}>
								<div className={styles.priceRow}>
									<span className={styles.currentPrice}>
									₹{product.discount_price || product.price}
								</span>
								{product.discount_price && (
									<>
										<span className={styles.originalPrice}>₹{product.price}</span>
											<span className={styles.discountBadge}>{discount}% OFF</span>
										</>
									)}
								</div>
								<p className={styles.taxInfo}>Inclusive of all taxes</p>
							</div>

							{/* Description */}
							{product.description && (
								<div className={styles.description}>
									<h3>Description</h3>
									<p>{product.description}</p>
								</div>
							)}

							{/* Size Selection */}
							{product.sizes && product.sizes.length > 0 && (
								<div className={styles.optionGroup}>
									<h3>Select Size</h3>
									<div className={styles.sizeOptions}>
										{product.sizes.map((size) => (
											<button
												key={size}
												className={`${styles.sizeBtn} ${selectedSize === size ? styles.selected : ""
													}`}
												onClick={() => setSelectedSize(size)}
											>
												{size}
											</button>
										))}
									</div>
								</div>
							)}

							{/* Color Selection */}
							{product.colors && product.colors.length > 0 && (
								<div className={styles.optionGroup}>
									<h3>Select Color</h3>
									<div className={styles.colorOptions}>
										{product.colors.map((color) => (
											<button
												key={color}
												className={`${styles.colorBtn} ${selectedColor === color ? styles.selected : ""
													}`}
												onClick={() => setSelectedColor(color)}
												style={{ background: color }}
											>
												{selectedColor === color && <span>✓</span>}
											</button>
										))}
									</div>
								</div>
							)}

							{/* Quantity */}
							<div className={styles.optionGroup}>
								<h3>Quantity</h3>
								<div className={styles.quantitySelector}>
									<button
										onClick={() => handleQuantityChange(-1)}
										className={styles.qtyBtn}
										aria-label="Decrease quantity"
										disabled={quantity <= 1}
									>
										−
									</button>
									<span className={styles.quantity}>{quantity}</span>
									<button
										onClick={() => handleQuantityChange(1)}
										className={styles.qtyBtn}
										aria-label="Increase quantity"
										disabled={quantity >= availableToAdd}
									>
										+
									</button>
								</div>
								<p className={styles.stockInfo}>
									{product.stock > 0 ? (
										<>
											<span className={styles.inStock}>
												{product.stock} items in stock
											</span>
											{quantityInCart > 0 && (
												<span className={styles.cartInfo}>
													{" "}• {quantityInCart} already in cart
												</span>
											)}
										</>
									) : (
										<span className={styles.outOfStock}>Out of stock</span>
									)}
								</p>
							</div>

							{/* Action Buttons */}
							<div className={styles.actions}>
								{isInCart ? (
									<button
										className={styles.viewCartBtn}
										onClick={handleViewCart}
									>
										View Cart ({totalInCart})
									</button>
								) : (
									<button
										className={styles.addToCartBtn}
										disabled={product.stock === 0 || addingToCart}
										onClick={handleAddToCart}
									>
										{addingToCart ? "Adding..." : "Add to Cart"}
									</button>
								)}
								<button
									className={styles.buyNowBtn}
									disabled={product.stock === 0}
									onClick={handleBuyNow}
								>
									Buy Now
								</button>
							</div>

							{/* Additional Info */}
							<div className={styles.infoCards}>
								<div className={styles.infoCard}>
									<span className={styles.infoIcon}>🚚</span>
									<div>
										<h4>Free Delivery</h4>
										<p>On orders above ₹999</p>
									</div>
								</div>
								<div className={styles.infoCard}>
									<span className={styles.infoIcon}>↩️</span>
									<div>
										<h4>Easy Returns</h4>
										<p>7 days return policy</p>
									</div>
								</div>
								<div className={styles.infoCard}>
									<span className={styles.infoIcon}>✓</span>
									<div>
										<h4>Authentic Product</h4>
										<p>100% original</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</>
	);
}
