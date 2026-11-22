import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Updates from "./components/Updates";
import VideoShowcase from "./components/VideoShowcase";
import About from "./components/About";
import Availability from "./components/Availability";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Updates />
      <VideoShowcase />
      <About />
      <Availability />
      <Footer />
    </>
  );
}
