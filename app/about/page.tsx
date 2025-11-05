export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#7a2d2d] mb-6">About Looms & Petals</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="text-gray-700 mb-6">
            Welcome to Looms & Petals, where tradition meets contemporary elegance. 
            Founded with a passion for preserving the rich heritage of handloom craftsmanship 
            while embracing modern design sensibilities, we bring you a curated collection 
            that celebrates both style and sustainability.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-6">
            We strive to support local artisans and sustainable practices while 
            delivering exceptional quality products to our customers. Each piece in 
            our collection tells a story of craftsmanship, dedication, and artistic excellence.
          </p>

          <h2 className="text-2xl font-semibold mb-4">Why Choose Us</h2>
          <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>Handcrafted Excellence</li>
            <li>Sustainable Practices</li>
            <li>Authentic Designs</li>
            <li>Fair Trade Commitment</li>
            <li>Customer-First Approach</li>
          </ul>
        </div>
      </div>
    </div>
  );
}