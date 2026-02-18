import Header from "../../components/Header";
import Hero from "../../components/Hero"
import Intro from "../../components/Intro";
import Announcements from "../../components/Announcements";
import Slider from "../../components/Slider";
import Testimonials from "../../components/Testimonials";
import Pricing from "../../components/Pricing";

const Home = () => {


    return (
        <>
            <Header />
            <Hero />
            <Announcements />
            <Intro />
            <Slider />
            <Testimonials />
            <Pricing />
        </>
    )
}

export default Home;