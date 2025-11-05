export interface CarouselItem {
  id: number;
  image?: string; // optional fallback image
  video?: string; // optional video source (mp4/webm in public or remote)
  youtube?: string; // YouTube id or full url for Shorts/regular
  title: string;
  description: string;
}

// You can add more slides here
export const carouselData: CarouselItem[] = [
  // Demo YouTube Shorts/Video (uses YouTube IFrame embed)
  {
    id: 0,
    image: '/Images/Home.png', // official YouTube API demo id
    title: 'Diamonds are all you…',
    description: 'Exquisite Vines Diamond Necklace Set',
  },
  {
    id: 1,
    image: '/Images/Home.png', // Using public path
    title: "Welcome to Looms & Petals",
    description: "Discover our exclusive collection of handcrafted designs."
  },
  {
    id: 2,
    image: '/Images/Home.png',
    title: "Unique Designs",
    description: "Each piece tells a story of artistry and excellence."
  },
  {
    id: 3,
    image: '/Images/Home.png',
    title: "Crafted with Love",
    description: "Traditional craftsmanship meets modern elegance."
  }
];

// Function to add a new slide
export function addCarouselSlide(image: string, title: string, description: string) {
  const newId = carouselData.length + 1;
  const newSlide = {
    id: newId,
    image,
    title,
    description
  };
  carouselData.push(newSlide);
}