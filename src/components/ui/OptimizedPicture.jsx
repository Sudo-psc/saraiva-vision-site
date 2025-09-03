import React from 'react';

/**
 * OptimizedPicture component - Modern image optimization with AVIF/WebP support and responsive variants
 * @param {Object} props
 * @param {string} props.src - Base image path (without extension)
 * @param {string} props.alt - Alt text for accessibility
 * @param {number} props.width - Image width for layout
 * @param {number} props.height - Image height for layout
 * @param {string} props.loading - Loading strategy ('lazy' | 'eager')
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.sizes - Responsive sizes attribute
 * @param {string} props.decoding - Decoding strategy ('async' | 'sync' | 'auto')
 * @param {boolean} props.responsive - Enable responsive variants (default: true)
 * @param {function} props.onError - Error callback
 */
const OptimizedPicture = ({
	src,
	alt,
	width,
	height,
	loading = 'lazy',
	className = '',
	sizes = '100vw',
	decoding = 'async',
	responsive = true,
	onError,
	...props
}) => {
	// Extract base name from src
	const lastDotIndex = src.lastIndexOf('.');
	const baseName = lastDotIndex > 0 ? src.substring(0, lastDotIndex) : src;

	// Generate responsive srcsets if enabled
	const generateSrcSet = (format) => {
		if (!responsive) {
			return `${baseName}.${format}`;
		}

		const breakpoints = [320, 640, 960, 1280, 1920];
		return breakpoints
			.map(bp => `/images/${baseName.split('/').pop()}-${bp}w.${format} ${bp}w`)
			.join(', ');
	};

	return (
		<picture>
			{/* AVIF - Melhor compressão (primeira escolha) */}
			<source
				srcSet={generateSrcSet('avif')}
				type="image/avif"
				sizes={sizes}
			/>

			{/* WebP - Boa compressão e suporte amplo */}
			<source
				srcSet={generateSrcSet('webp')}
				type="image/webp"
				sizes={sizes}
			/>

			{/* Fallback original (PNG/JPEG) */}
			<img
				src={src}
				alt={alt}
				width={width}
				height={height}
				loading={loading}
				decoding={decoding}
				className={className}
				sizes={sizes}
				onError={onError}
				{...props}
			/>
		</picture>
	);
};

export default OptimizedPicture;
