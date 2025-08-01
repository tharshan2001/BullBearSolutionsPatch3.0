import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Form, Input, Typography } from "antd";
import React, { useRef, useState, useEffect } from "react";

const { Text } = Typography;

const OTPVerification = () => {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);
  const [timeLeft, setTimeLeft] = useState(() => {
    // Get saved time from localStorage or default to 120
    const savedTime = localStorage.getItem('otpTimer');
    return savedTime ? Math.max(0, parseInt(savedTime)) : 120;
  });
  const [isTimerRunning, setIsTimerRunning] = useState(() => {
    // Check if timer was running before refresh
    const savedTime = localStorage.getItem('otpTimer');
    return savedTime ? parseInt(savedTime) > 0 : true;
  });
  const [lastResendTime, setLastResendTime] = useState(() => {
    // Get last resend time from localStorage
    return localStorage.getItem('lastResendTime') || null;
  });

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          localStorage.setItem('otpTimer', newTime.toString());
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      localStorage.removeItem('otpTimer');
    }
    return () => clearInterval(timer);
  }, [timeLeft, isTimerRunning]);

  // Handle OTP input change
  const handleChange = (index, value) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  // Handle backspace key
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').slice(0, 6);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = [...otp];
      for (let i = 0; i < pasteData.length; i++) {
        if (i < 6) {
          newOtp[i] = pasteData[i];
        }
      }
      setOtp(newOtp);
      const lastFilledIndex = Math.min(pasteData.length, 5);
      inputRefs.current[lastFilledIndex].focus();
    }
  };

  // Handle resend OTP
  const handleResend = () => {
    const now = new Date().getTime();
    setTimeLeft(120);
    localStorage.setItem('otpTimer', '120');
    localStorage.setItem('lastResendTime', now.toString());
    setLastResendTime(now.toString());
    setIsTimerRunning(true);
    // Add your OTP resend logic here
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate if resend is allowed (prevent spamming)
  const canResend = () => {
    if (!lastResendTime) return true;
    const now = new Date().getTime();
    const lastResend = parseInt(lastResendTime);
    return (now - lastResend) > 30000; // 30 seconds cooldown
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1f1f2f] via-[#191c2d] to-[#101015] p-4">
      <div className="backdrop-blur-xl bg-[rgba(25,28,45,0.75)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-6">
          <h2 className="text-[#33eed5] text-2xl font-bold font-[Luckiest_Guy]">
            BULL BEAR
          </h2>
        </div>

        {/* Form Container */}
        <div className="bg-[rgba(26,27,32,0.75)] p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] backdrop-blur-md">
          <h4 className="text-left text-lg font-semibold bg-gradient-to-r from-[#4ab6a7] to-[#33eed5] bg-clip-text text-transparent mb-6">
            OTP Verification
            <hr className="!bg-[#33eed5] !my-2 w-[80px] h-[1.5px]" />
          </h4>

          <div className="text-white text-sm mb-6">
            We've sent a 6-digit code to your email. Enter it below to verify.
          </div>

          <Form layout="vertical">
            <Form.Item
              label={<span className="text-white text-sm">6-Digit Code</span>}
              name="otp"
              className="mb-6"
            >
              <div 
                className="flex justify-between"
                onPaste={handlePaste}
              >
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={digit}
                    maxLength={1}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    style={{
                      width: '40px',
                      height: '50px',
                      backgroundColor: "transparent",
                      border: "none",
                      borderBottom: "2px solid #33eed5",
                      color: "white",
                      textAlign: 'center',
                      fontSize: '1.2rem',
                      marginRight: index < 5 ? '10px' : '0'
                    }}
                    className="rounded-none focus:shadow-none"
                  />
                ))}
              </div>
            </Form.Item>

            <div className="flex justify-between items-center mb-6">
              <span 
                className={`text-xs cursor-pointer hover:underline ${
                  timeLeft === 0 && canResend() ? 'text-[#33eed5]' : 'text-gray-400'
                }`}
                onClick={timeLeft === 0 && canResend() ? handleResend : undefined}
              >
                {timeLeft === 0 ? 
                  (canResend() ? 'Resend Code' : 'Wait to resend') : 
                  'Code expires in'}
              </span>
              <span className={`text-xs ${
                timeLeft < 30 ? 'text-red-400' : 'text-white'
              }`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <Button
              type="primary"
              block
              className="!bg-[#33eed5] !border-[#33eed5] !text-black font-medium h-10 shadow-[0_2px_8px_rgba(51,238,213,0.4)] flex items-center justify-center"
              disabled={otp.some(digit => !digit)}
            >
              Verify OTP
              <ArrowRightOutlined className="ml-2" />
            </Button>
          </Form>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 mt-4">
          2025, BULL BEAR Project 1.0, All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;