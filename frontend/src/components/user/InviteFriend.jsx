import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthProvider';
import { QRCodeSVG } from 'qrcode.react';
import { 
  CheckOutlined,
  ShareOutlined,
  QrCodeOutlined,
  PersonAddOutlined,
  LinkOutlined,
  TagOutlined,
} from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import logo from "../../assets/BullLogo.png";


const InviteFriend = () => {
  const { user } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    if (user?.code) {
      const frontendUrl = import.meta.env.VITE_FRONTEND_URL;
      setReferralLink(`${frontendUrl}/register?ref=${user.code}`);
    }
  }, [user]);

  // Clipboard copy with fallback
  const copyText = async (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.error('Clipboard writeText failed:', err);
        return false;
      }
    } else {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';  // Prevent scrolling to bottom
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        console.error('Fallback copy failed:', err);
        return false;
      }
    }
  };

  const handleCopyLink = async () => {
    const success = await copyText(referralLink);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyCode = async () => {
    const success = await copyText(user?.code || '');
    if (success) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join me on BullBear Solutions!',
          text: `Use my referral code ${user?.code} to register and get bonus rewards!`,
          url: referralLink,
        });
      } else {
        handleCopyLink();
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-300">
        <PersonAddOutlined className="text-4xl mb-4 text-[#33eed5]" />
        <p className="text-lg">Please login to access referral features</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full px-4 max-w-[500px]">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Invite Friends</h2>
        <p className="text-[#a0a0a8]">Earn rewards when friends sign up using your code</p>
      </div>

      {/* QR Code Container */}
      <div className="bg-gradient-to-r bg-[#33eed5]/10 rounded-lg border border-[#33eed5]/20 rounded-xl p-6 mb-8 border border-[#3a3a42] hover:border-[#33eed5]/30 transition-colors duration-200">
        <div className="flex flex-col items-center">
          <h3 className="text-white font-medium mb-4 flex items-center">
            <QrCodeOutlined className="mr-2 text-[#33eed5]" />
            Scan to Register
          </h3>
          
          <div className="bg-white p-4 rounded-lg mb-4 shadow-inner relative">
            {referralLink ? (
              <>
                <QRCodeSVG 
                  value={referralLink} 
                  size={180} 
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={true}
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <img 
                    src={logo} 
                    alt="Logo" 
                    className="w-12 h-12 object-contain rounded-lg border-2 border-white" 
                  />
                </div>
              </>
            ) : (
              <div className="w-[180px] h-[180px] flex items-center justify-center text-gray-400">
                <QrCodeOutlined className="text-5xl" />
              </div>
            )}
          </div>
          
          <p className="text-[#a0a0a8] text-sm text-center max-w-[240px]">
            Scan this QR code with your phone's camera to open the registration page
          </p>
        </div>
      </div>

      {/* Action Buttons - Parallel Layout */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Copy Link Button */}
        <Tooltip title={copiedLink ? "Copied!" : "Copy referral link"} arrow placement="top">
          <button
            onClick={handleCopyLink}
            disabled={!referralLink}
            className={`flex items-center justify-center py-3 px-4 rounded-lg border transition-all duration-200 ${
              copiedLink 
                ? "border-[#33eed5] bg-[#33eed5]/10 text-[#33eed5]"
                : "border-[#3a3a42] hover:border-[#33eed5] hover:bg-[#33eed5]/10 text-white"
            }`}
          >
            {copiedLink ? (
              <CheckOutlined className="mr-2" />
            ) : (
              <LinkOutlined className="mr-2 text-[#33eed5]" />
            )}
            {copiedLink ? "Copied!" : "Copy Link"}
          </button>
        </Tooltip>

        {/* Copy Code Button */}
        <Tooltip title={copiedCode ? "Copied!" : "Copy referral code"} arrow placement="top">
          <button
            onClick={handleCopyCode}
            disabled={!user?.code}
            className={`flex items-center justify-center py-3 px-4 rounded-lg border transition-all duration-200 ${
              copiedCode 
                ? "border-[#33eed5] bg-[#33eed5]/10 text-[#33eed5]"
                : "border-[#3a3a42] hover:border-[#33eed5] hover:bg-[#33eed5]/10 text-white"
            }`}
          >
            {copiedCode ? (
              <CheckOutlined className="mr-2" />
            ) : (
              <TagOutlined className="mr-2 text-[#33eed5]" />
            )}
            {copiedCode ? "Copied!" : "Copy Code"}
          </button>
        </Tooltip>
      </div>

      {/* Share Button */}
      <Tooltip title="Share via your device" arrow placement="top">
        <button
          onClick={handleShare}
          disabled={!user?.code || !referralLink}
          className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-[#33eed5] to-[#2ac0a8] text-black font-medium flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_4px_12px_rgba(51,238,213,0.3)]"
        >
          <ShareOutlined className="mr-2" />
          Share Invitation
        </button>
      </Tooltip>

      {/* Rewards Info */}
      <div className="mt-8 p-4 bg-[#33eed5]/10 rounded-lg border border-[#33eed5]/20">
        <h4 className="text-[#33eed5] font-medium mb-2">Your Rewards</h4>
        <p className="text-white text-sm">
          You earn <span className="font-bold">5%</span> of your friend's trading fees for their first 3 months.
        </p>
      </div>
    </div>
  );
};

export default InviteFriend;
