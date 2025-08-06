import { ArrowRightOutlined, EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";

const OTPFlow = () => {
  const [form1] = Form.useForm();
  const [form3] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [formValid, setFormValid] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const prevStepRef = useRef(currentStep);

  const FormItemNoAsterisk = ({ label, ...props }) => (
    <Form.Item
      label={<span style={{ color: "white" }}>{label}</span>}
      required={false}
      {...props}
    />
  );

  const validateFields = useCallback(
    debounce(() => {
      if (currentStep === 1) {
        try {
          const allValues = form1.getFieldsValue();
          setFormValid(
            !!allValues.email && 
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(allValues.email)
          );
        } catch (error) {
          setFormValid(false);
        }
      } else if (currentStep === 3) {
        try {
          const password = form3.getFieldValue("password");
          const confirmPassword = form3.getFieldValue("confirmPassword");
          setFormValid(
            password &&
            password.length >= 8 &&
            confirmPassword &&
            password === confirmPassword
          );
        } catch (error) {
          setFormValid(false);
        }
      }
    }, 300),
    [form1, form3, currentStep]
  );

  const onFieldsChange = useCallback(() => {
    validateFields();
  }, [validateFields]);

  useEffect(() => {
    if (currentStep === 2 && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    
    if (currentStep === 3 && prevStepRef.current !== 3) {
      form3.resetFields();
      setFormValid(false);
    }
    
    prevStepRef.current = currentStep;
  }, [currentStep, form3]);

  useEffect(() => {
    if (otpExpiry) {
      const timer = setTimeout(() => {
        if (new Date() > new Date(otpExpiry)) {
          toast.error("OTP has expired. Please request a new one.");
          setOtpExpiry(null);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [otpExpiry]);

  const handleOtpChange = (index, e) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    if (value.length > 1) {
      const chars = value.slice(0, 6 - index).split("");
      chars.forEach((char, i) => {
        if (index + i < 6) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
    }
    setFormValid(newOtp.every((digit) => digit !== ""));
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = "";
      } else if (index > 0) {
        newOtp[index - 1] = "";
        inputRefs.current[index - 1]?.focus();
      }
      setOtp(newOtp);
      setFormValid(newOtp.every((digit) => digit !== ""));
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = Array(6).fill("");
    [...pasteData].forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    setFormValid(newOtp.every((digit) => digit !== ""));
    const nextIndex = Math.min(pasteData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const requestOTP = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/send-otp`,
        {
          email: values.email,
        }
      );
      if (response.data.message === "OTP sent successfully") {
        toast.success("OTP sent successfully!");
        setEmail(values.email);
        setCurrentStep(2);
        setOtp(["", "", "", "", "", ""]);
        setFormValid(false);
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 5);
        setOtpExpiry(expiryTime);
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    try {
      setLoading(true);
      const otpValue = otp.join("");
      if (otpValue.length !== 6) {
        toast.error("Please enter a 6-digit OTP");
        return;
      }

      if (otpExpiry && new Date() > new Date(otpExpiry)) {
        toast.error("OTP has expired. Please request a new one.");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-otp`,
        {
          email,
          otp: otpValue,
        }
      );
      if (response.data === true) {
        toast.success("OTP verified!");
        setCurrentStep(3);
        setFormValid(false);
        setOtpExpiry(null);
      } else {
        toast.error("Invalid or expired OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`,
        {
          email,
          otp: otp.join(""),
          password: values.password,
        }
      );
      if (response.data.message?.includes("Password reset successfully")) {
        toast.success("Password reset successfully!");
        navigate("/login");
      } else {
        toast.error(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/send-otp`,
        {
          email,
        }
      );
      if (response.data.message === "OTP sent successfully") {
        toast.success("New OTP sent!");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 5);
        setOtpExpiry(expiryTime);
      } else {
        toast.error(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error resending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1f1f2f] via-[#191c2d] to-[#101015] p-4">
      <div className="backdrop-blur-xl bg-[rgba(25,28,45,0.75)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-full max-w-md">
        <div className="text-center mb-4">
          <h2 className="text-[#33eed5] text-2xl font-bold font-[Luckiest_Guy]">
            BULL BEAR
          </h2>
        </div>
        <div className="bg-[rgba(26,27,32,0.75)] p-5 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] backdrop-blur-md">
          {currentStep === 1 && (
            <>
              <h4 className="text-left text-lg font-semibold bg-gradient-to-r from-[#4ab6a7] to-[#33eed5] bg-clip-text text-transparent mb-6">
                Request OTP
                <hr className="!bg-[#33eed5] !my-2 w-[80px] h-[1.5px]" />
              </h4>
              <Form
                form={form1}
                layout="vertical"
                onFinish={requestOTP}
                onFieldsChange={onFieldsChange}
              >
                <FormItemNoAsterisk
                  name="email"
                  rules={[
                    { required: true, message: "Please input your email!" },
                    { type: "email", message: "Enter a valid email!" },
                  ]}
                  className="mb-4"
                  label="Email"
                >
                  <Input
                    placeholder="Enter your email to receive OTP"
                    allowClear
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      borderBottom: "1px solid white",
                      color: "white",
                    }}
                    className="rounded-none h-9 text-sm focus:shadow-none"
                  />
                </FormItemNoAsterisk>
                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    shape="circle"
                    size="small"
                    icon={<ArrowRightOutlined className="text-xs" />}
                    className="!bg-[#33eed5] !border-[#33eed5] shadow-[0_2px_6px_rgba(51,238,213,0.4)] float-right"
                    htmlType="submit"
                    loading={loading}
                    disabled={!formValid || loading}
                  />
                </Form.Item>
              </Form>
            </>
          )}

          {currentStep === 2 && (
            <>
              <h4 className="text-left text-lg font-semibold bg-gradient-to-r from-[#4ab6a7] to-[#33eed5] bg-clip-text text-transparent mb-6">
                Verify OTP
                <hr className="!bg-[#33eed5] !my-2 w-[80px] h-[1.5px]" />
              </h4>
              <div className="text-white text-sm mb-4">
                We've sent a 6-digit code to{" "}
                <span className="text-[#33eed5]">{email}</span>
                {otpExpiry && (
                  <div className="text-xs mt-1">
                    OTP expires at: {new Date(otpExpiry).toLocaleTimeString()}
                  </div>
                )}
              </div>
              <Form onFinish={verifyOTP}>
                <div
                  className="flex justify-between mb-4"
                  onPaste={handlePaste}
                >
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      value={digit}
                      maxLength={1}
                      onChange={(e) => handleOtpChange(index, e)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onFocus={(e) => e.target.select()}
                      style={{
                        width: "40px",
                        height: "50px",
                        backgroundColor: "transparent",
                        border: "none",
                        borderBottom: "2px solid #33eed5",
                        color: "white",
                        textAlign: "center",
                        fontSize: "1.2rem",
                        marginRight: index < 5 ? "10px" : "0",
                      }}
                      className="rounded-none focus:shadow-none"
                      disabled={loading}
                    />
                  ))}
                </div>
                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    shape="circle"
                    size="small"
                    icon={<ArrowRightOutlined className="text-xs" />}
                    className="!bg-[#33eed5] !border-[#33eed5] shadow-[0_2px_6px_rgba(51,238,213,0.4)] float-right"
                    htmlType="submit"
                    loading={loading}
                    disabled={!formValid || loading}
                  />
                </Form.Item>
              </Form>
            </>
          )}

          {currentStep === 3 && (
            <>
              <h4 className="text-left text-lg font-semibold bg-gradient-to-r from-[#4ab6a7] to-[#33eed5] bg-clip-text text-transparent mb-6">
                Reset Password
                <hr className="!bg-[#33eed5] !my-2 w-[80px] h-[1.5px]" />
              </h4>
              <div className="text-white text-sm mb-4">
                Reset password for{" "}
                <span className="text-[#33eed5]">{email}</span>
              </div>
              <Form
                form={form3}
                layout="vertical"
                onFinish={resetPassword}
                onFieldsChange={onFieldsChange}
              >
                <FormItemNoAsterisk
                  name="password"
                  rules={[
                    { required: true, message: "Please input your password!" },
                    { min: 8, message: "At least 8 characters!" },
                  ]}
                  className="mb-4"
                  label="New Password"
                >
                  <Input.Password
                    placeholder="Enter new password"
                    visibilityToggle={{
                      visible: showPassword,
                      onVisibleChange: setShowPassword,
                    }}
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      borderBottom: "1px solid white",
                      color: "white",
                    }}
                    className="rounded-none h-9 text-sm focus:shadow-none"
                  />
                </FormItemNoAsterisk>

                <FormItemNoAsterisk
                  name="confirmPassword"
                  dependencies={["password"]}
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your password!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value)
                          return Promise.resolve();
                        return Promise.reject(
                          new Error("Passwords do not match!")
                        );
                      },
                    }),
                  ]}
                  className="mb-4"
                  label="Confirm Password"
                >
                  <Input.Password
                    placeholder="Confirm new password"
                    visibilityToggle={{
                      visible: showConfirmPassword,
                      onVisibleChange: setShowConfirmPassword,
                    }}
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      borderBottom: "1px solid white",
                      color: "white",
                    }}
                    className="rounded-none h-9 text-sm focus:shadow-none"
                  />
                </FormItemNoAsterisk>

                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    shape="circle"
                    size="small"
                    icon={<ArrowRightOutlined className="text-xs" />}
                    className="!bg-[#33eed5] !border-[#33eed5] shadow-[0_2px_6px_rgba(51,238,213,0.4)] float-right"
                    htmlType="submit"
                    loading={loading}
                    disabled={!formValid || loading}
                  />
                </Form.Item>
              </Form>
            </>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          {currentStep === 1 && (
            <span
              className="text-[#33eed5] text-xs cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </span>
          )}
          {currentStep === 2 && (
            <span
              className="text-[#33eed5] text-xs cursor-pointer hover:underline"
              onClick={handleResendOTP}
            >
              Resend OTP
            </span>
          )}
          {currentStep === 3 && (
            <span
              className="text-[#33eed5] text-xs cursor-pointer hover:underline"
              onClick={() => setCurrentStep(2)}
            >
              Back to OTP Verification
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPFlow;