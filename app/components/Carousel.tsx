'use client';
import Carousel from 'react-bootstrap/Carousel';
import Image from 'next/image';
import styles from './Carousel.module.css';
import { carouselData } from './carouselData';

function Carousels() {
  // Only show image-based hero slides for the home banner
  const heroSlides = carouselData.filter((s) => !!s.image);
  return (
    <div className={styles['carousel-wrapper']}>
      <Carousel className={styles.carousel}>
        {heroSlides.map((slide, index) => (
          <Carousel.Item key={slide.id} interval={4000}>
            <div className={styles['carousel-card']}>
              <div className={styles['carousel-image-container']}>
                <Image
                  src={slide.image as string}
                  alt={`Slide ${index + 1}`}
                  fill
                  sizes="100vw"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                  priority={index === 0} // Only first image gets priority loading
                />
              </div>
              <Carousel.Caption>
                <h3>{slide.title}</h3>
                <p>{slide.description}</p>
              </Carousel.Caption>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
}

export default Carousels;