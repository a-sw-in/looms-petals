import Carousels from "./components/Carousel";
import Section from "./components/section";
import Trend from "./components/trend";
import Price from "./components/price";
import CardSection from "./components/cardSection";
import ScrollTrend from "./components/scrollTrend";
import ScrollTrendJewel from "./components/scrollTrendJewel";
import WhatsAppFeedback from "./components/WhatsAppFeedback";
import Footer from "./components/Footer";
import { Navbar } from "./components/Navbar";
import CardSectionJewel from "./components/cardSectionJewel";


export default function Home() {
  return (
    <div className="home w-screen">
      <Navbar />
      <Carousels />
      <Price />
      <CardSection />
      <CardSectionJewel />
      <Trend />
      <ScrollTrend />
      <ScrollTrendJewel />
      <Section />
      <WhatsAppFeedback />
      <Footer />
    </div>
  );
}
