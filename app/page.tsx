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


export default function Home() {
  return (
    <div className="home w-screen">
      <Navbar />
      <Carousels />
      <Price />
      <CardSection />
      <Trend />
      <ScrollTrend />
      <ScrollTrendJewel />
      <WhatsAppFeedback />
      <Section />
      <Footer />
    </div>
  );
}
