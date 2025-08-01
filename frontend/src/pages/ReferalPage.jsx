import { useNavigate } from "react-router-dom";
import ReferralTree from "../components/user/ReferralTree";
import ArrowBackIosNewOutlinedIcon from "@mui/icons-material/ArrowBackIosNewOutlined";
import HeaderA from "../components/HeaderA";
import AnimatedPage from "../components/AnimatedPage";

const Referalpage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="w-full bg-[#181b2c] min-h-screen relative">
      <HeaderA title="My Team" onBack={() => navigate(-1)} />

      <AnimatedPage>
        <div className="max-w-[480px] md:max-w-[800px] lg:max-w-[1000px] mx-auto pt-[30px] px-4 md:px-6 pb-20">
          <ReferralTree />
        </div>
      </AnimatedPage>
    </div>
  );
};

export default Referalpage;
