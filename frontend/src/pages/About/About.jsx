import React from "react";
import style from "./about.module.css";
import Headers from "../../component/utilities/Header/Headers";
import Footer from "../../component/utilities/footer/footer";
import headerImage from "../../assets/headers.jpg";
import about1 from "../../assets/about1.webp";
import vision from "../../assets/vision.jpg";
import mission from "../../assets/mission.jpg";

const About = () => {
  return (
    <>
      <Headers title="About Us" image={headerImage}>
        <p style={{ color: "white" }}>
          Filler text is text that shares some characteristics of a real written
          text, but is random or otherwise generated. It may be used to display
          a sample of fonts, generate text for testing,{" "}
        </p>
      </Headers>

      {/* about us */}
      <section className={style.aboutStory}>
        <div className={`${style.container}, ${style.aboutStoryContainer}`}>
          <div className={style.aboutSectionImg}>
            <img src={about1} alt="about story" />
          </div>
          <div className={style.aboutSectionContent}>
            <h1>ABOUT US</h1>
            <p>
              LAWFAX – A gateway to seamless legal assistance and expert
              guidance. LawFax provides a cutting-edge legal solution to
              streamline Lawyer’s practice and enhance there client service
              experience.
            </p>
            <p>
              It’s a specialised app meticulously crafted to revolutionise the
              way lawyers practice law. Our app stands as a comprehensive
              digital tool, uniquely designed to cater the dynamic needs of
              legal professionals.
            </p>
            <p>
              With a sophisticated blend of innovative features, seamless case
              management, and streamlined communication, our application serves
              as the quintessential partner for every lawyer.
            </p>
            <p>
              Embrace a future where technology empowers legal excellence, where
              every tap and swipe leads to enhanced advocacy and a more just
              world. Welcome to the future of legal practice, welcome to LAWFax
            </p>
          </div>
        </div>
      </section>

      {/* Our vision */}
      <section className={style.visionStory}>
        <div className={`${style.container}, ${style.visionStoryContainer}`}>
          <div className={style.aboutSectionContent}>
            <h1>Our Vision</h1>
            <p>
              At LawFax, our vision is to lead a paradigm shift in the legal
              industry by harnessing the power of technology to create an
              all-encompassing platform tailored to the needs of lawyers. We
              envision a future where legal professionals seamlessly integrate
              innovation into their practice, enabling them to exceed client
              expectations and make a lasting impact on the legal landscape.
            </p>
          </div>
          <div className={style.visionSectionImg}>
            <img src={vision} alt="Our Vision" />
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className={style.missionStory}>
        <div className={`${style.container}, ${style.missionStoryContainer}`}>
          <div className={style.missionSectionImg}>
            <img src={mission} alt="Our Mission" />
          </div>
          <div className={style.aboutSectionContent}>
            <h1>Our Mission</h1>
            <p>
              At LawFax, our mission is to equip lawyers with a tool that
              enhances their productivity, efficiency and effectiveness in
              navigating the complex legal world. We are dedicated to providing
              an innovative platform tailored to the unique needs of lawyers,
              enabling them to achieve greater heights of success in their
              practice.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default About;
