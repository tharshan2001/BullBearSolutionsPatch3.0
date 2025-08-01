import React from "react";
import { useNavigate } from "react-router-dom"; 
import Account from "../components/transaction/Account";
import AnimatedPage from "../components/AnimatedPage";
import HeaderA from "../components/HeaderA";
import TransactionNavigation from "../components/transaction/TransactionNavigation";

const AccountPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#181b2c] min-h-screen">
      <div className="max-w-[480px] md:max-w-[800px] lg:max-w-[1000px] mx-auto px-4 md:px-6 flex flex-col min-h-screen ">
        <HeaderA title="Account & Transaction" onBack={() => navigate(-1)} />
        <AnimatedPage>
          <Account />
          <TransactionNavigation/>
        </AnimatedPage>
      </div>
    </div>
  );
};

export default AccountPage;
