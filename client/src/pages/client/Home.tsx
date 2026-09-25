import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Hero from "../../components/Hero";
import Hero2 from "../../components/Hero2";
import Intro from "../../components/Intro";
import Announcements from "../../components/Announcements";
import Slider from "../../components/Slider";
import Testimonials from "../../components/Testimonials";
import Pricing from "../../components/Pricing";
import FAQ from "../../components/FAQ";
import Footer from "../../components/Footer";
import ContactUs from "../../components/ContactUs";
import { getHomeSections, type PageSectionConfig } from "../../services/pageLayoutService";

type SectionComponent = React.ComponentType;

const SECTION_MAP: Record<string, SectionComponent> = {
  announcements: Announcements,
  intro: Intro,
  slider: Slider,
  testimonials: Testimonials,
  pricing: Pricing,
  faq: FAQ,
  contact: ContactUs,
};

// Fallback layout used if the API is unavailable
const FALLBACK_SECTIONS: PageSectionConfig[] = [
  { id: 0, page: "home", sectionKey: "hero",          label: "Hero Section",    icon: "bi-window-stack",      isVisible: true, order: 0, variant: "default" },
  { id: 0, page: "home", sectionKey: "announcements", label: "Announcements",   icon: "bi-megaphone",         isVisible: true, order: 1, variant: "default" },
  { id: 0, page: "home", sectionKey: "intro",         label: "Features / Intro",icon: "bi-grid-3x3-gap",      isVisible: true, order: 2, variant: "default" },
  { id: 0, page: "home", sectionKey: "slider",        label: "Channel Slider",  icon: "bi-images",            isVisible: true, order: 3, variant: "default" },
  { id: 0, page: "home", sectionKey: "testimonials",  label: "Testimonials",    icon: "bi-chat-square-quote", isVisible: true, order: 4, variant: "default" },
  { id: 0, page: "home", sectionKey: "pricing",       label: "Pricing Plans",   icon: "bi-list-check",        isVisible: true, order: 5, variant: "default" },
  { id: 0, page: "home", sectionKey: "faq",           label: "FAQ",             icon: "bi-question-circle",   isVisible: true, order: 6, variant: "default" },
  { id: 0, page: "home", sectionKey: "contact",       label: "Contact Us",      icon: "bi-envelope",          isVisible: true, order: 7, variant: "default" },
];

const renderHeroVariant = (variant: string) => {
  if (variant === "minimal") return <Hero2 key="hero" />;
  return <Hero key="hero" />;
};

const Home = () => {
  const [layout, setLayout] = useState<PageSectionConfig[] | null>(null);

  useEffect(() => {
    getHomeSections()
      .then((data) => setLayout(data))
      .catch(() => setLayout(null));
  }, []);

  const sections = (layout ?? FALLBACK_SECTIONS)
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <>
      <Header />
      {sections.map((section) => {
        if (section.sectionKey === "hero") {
          return renderHeroVariant(section.variant);
        }
        const Component = SECTION_MAP[section.sectionKey];
        return Component ? <Component key={section.sectionKey} /> : null;
      })}
      <Footer />
    </>
  );
};

export default Home;