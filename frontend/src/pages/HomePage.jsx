import React from "react";
import AssemblyOfGods from "../components/display/AssemblyOfGods";
import FloatingNavBar from "../components/FloatingNavBar";
import ImageBanner from "../components/display/ImageBanner";
import Carsoul from "../components/display/Carsoul";
import ProjectTxB from "../components/display/ProjectTxB";
import HeaderB from "../components/HeaderB";
import GradientBanner from "../components/display/GradientBanner";
import VideoBanner from "../components/display/VideoBanner";
import AnimatedPage from "../components/AnimatedPage";

const HomePage = () => {
  return (
    <div className="w-full min-h-screen overflow-y-auto bg-gradient-to-br from-[#1f1f2f] via-[#191c2d] to-[#101015] pt-5">
      <HeaderB title="Home" />
      <AnimatedPage>
        <ProjectTxB />
        <Carsoul />
        <GradientBanner />
        <VideoBanner />
        <AssemblyOfGods />
      </AnimatedPage>
      <FloatingNavBar />
    </div>
  );
};

export default HomePage;
