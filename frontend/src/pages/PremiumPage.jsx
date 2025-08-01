import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import HeaderA from "../components/HeaderA";
import SubscriptionsPage from "../components/premium/SubscriptionsPage";
import PremiumCard from "../components/premium/PremiumCard";
import UpgradePremium from "../components/premium/UpgradePremium";
import SubscriptionNavigation from "../components/premium/SubscriptionNavigation";
import AnimatedPage from "../components/AnimatedPage";

const PremiumPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#181b2c] min-h-screen overflow-y-auto">
      <HeaderA title="Premium" onBack={() => navigate(-1)} />

      {/* Main content area */}
      <div className="max-w-[480px] md:max-w-[800px] lg:max-w-[1000px] mx-auto mt-15 px-4 md:px-6">
        <AnimatedPage>
        <UpgradePremium />
        <SubscriptionNavigation/>
        </AnimatedPage>
      </div>
    </div>
  );
};

export default PremiumPage;
