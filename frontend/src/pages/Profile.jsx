import FloatingNavBar from "../components/FloatingNavBar";
import HelpdeskSection from "../components/user/HelpdeskSection";
import LogoutSection from "../components/user/LogoutSection";
import ProfileCard from "../components/user/ProfileCard";
import SettingsSection from "../components/user/SettingsSection";
import ReferralSection from "../components/user/ReferralSection";
import Header from "../components/Header";
import AnimatedPage from "../components/AnimatedPage";

const Profile = () => {
  return (
    <div className="w-full h-screen flex flex-col relative bg-gradient-to-br from-[#1f1f2f] via-[#191c2d] to-[#101015]">
      <Header title="Profile" />
      
      <div className="flex-1 overflow-y-auto scroll-smooth"> {/* Added scroll-smooth and flex layout */}
        <AnimatedPage>
          <div className="max-w-[480px] md:max-w-[800px] lg:max-w-[1000px] mx-auto pt-[40px] pb-20 mb-4">
            <ProfileCard />
            <SettingsSection />
            <ReferralSection />
            <HelpdeskSection />
            <LogoutSection />
          </div>
        </AnimatedPage>
      </div>
      
      {/* FloatingNavBar */}
      <FloatingNavBar />
    </div>
  );
};

export default Profile;