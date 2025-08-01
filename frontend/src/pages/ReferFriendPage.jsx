import React from "react";
import { useNavigate } from "react-router-dom";
import InviteFriend from "../components/user/InviteFriend";
import Header from "../components/Header";
import HeaderA from "../components/HeaderA";

const ReferFriendPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#181b2c] min-h-screen overflow-y-auto">
      <Header title="Refer a Friend" />
      <HeaderA title="Invite" onBack={() => navigate(-1)} />

      {/* Main content area */}
      <div className="max-w-[480px] md:max-w-[800px] lg:max-w-[1000px] mx-auto mt-15 px-4 md:px-6">
        <InviteFriend />
      </div>
    </div>
  );
};

export default ReferFriendPage;
