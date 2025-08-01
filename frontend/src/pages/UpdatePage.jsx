import React from "react";
import Updates from "../components/annoucements/Updates";
import Header from "../components/Header";
import AnnouncementList from "../components/annoucements/AnnouncementList";
import AnimatedPage from "../components/AnimatedPage";
import FloatingNavBar from "../components/FloatingNavBar";

const UpdatePage = () => {
  return (
    <div className="w-full bg-[#181b2c] min-h-screen">
      <Header title="Updates" />

      <AnimatedPage>
        <div className="max-w-[480px] md:max-w-[800px] lg:max-w-[1000px] mx-auto  px-4 md:px-6 flex flex-col h-[calc(100vh-80px)]">
          <Updates />

          {/* Only AnnouncementList scrolls */}
          <div className="flex-1 overflow-y-auto mt-4">
            <AnnouncementList />
          </div>
        </div>

      {/* FloatingNavBar */}
      </AnimatedPage>
            <FloatingNavBar />

    </div>
  );
};

export default UpdatePage;
