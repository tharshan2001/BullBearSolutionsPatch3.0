import {
  EyeInvisibleOutlined,
  EyeOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Form,
  Input,
  Typography,
  message,
  Modal,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { isValidPhoneNumber } from "react-phone-number-input";
import logo from "../assets/v3.png";


// API endpoints
const API = {
  SEND_OTP: `${import.meta.env.VITE_API_BASE_URL}/api/temp/send-otp`,
  VERIFY_OTP: `${import.meta.env.VITE_API_BASE_URL}/api/temp/verify-otp`,
  REGISTER_USER: `${import.meta.env.VITE_API_BASE_URL}/api/auth/register`,
};

// Constants
const STEPS = {
  BASIC_INFO: 1,
  OTP_VERIFICATION: 2,
  COMPLETE_REGISTRATION: 3,
};

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [currentStep, setCurrentStep] = useState(STEPS.BASIC_INFO);
  const [formData, setFormData] = useState({});
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timeLeft, setTimeLeft] = useState(120);
  const [referralCode, setReferralCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState({});
  const [isReferralCodeFromUrl, setIsReferralCodeFromUrl] = useState(false);
  const [isTermsModalVisible, setIsTermsModalVisible] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      setReferralCode(refCode);
      setIsReferralCodeFromUrl(true);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (currentStep === STEPS.OTP_VERIFICATION && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, currentStep]);

  const handleOtpChange = (index, value) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handlePaste = (e, index) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d+$/.test(pastedData)) {
      const digits = pastedData.split("").slice(0, 6);
      const newOtp = [...otp];

      // Fill OTP array starting from the current index
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });

      setOtp(newOtp);

      // Focus the next empty input after the pasted digits
      const nextIndex = Math.min(index + digits.length, 5);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
  };

  const onBasicInfoSubmit = async (values) => {
    try {
      setOtpLoading(true);
      setApiErrors({});

      const response = await axios.post(API.SEND_OTP, {
        email: values.email,
        name: values.fullName,
        phoneNumber: values.phone,
      });

      if (response.data.message === "OTP sent to email") {
        setFormData(values);
        message.success(`OTP sent to ${values.email}`);
        setCurrentStep(STEPS.OTP_VERIFICATION);
      } else {
        throw new Error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("OTP Send Error:", error);
      const errorMsg =
        error.response?.data?.message || "Please try again in few minutes.";
      message.error(errorMsg);

      if (error.response?.data?.errors) {
        setApiErrors(error.response.data.errors);
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      message.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setOtpLoading(true);
      setApiErrors({});

      const response = await axios.post(API.VERIFY_OTP, {
        email: formData.email,
        otp: enteredOtp,
      });

      if (response.data.message === "OTP verified successfully") {
        message.success("Email verified successfully!");
        setCurrentStep(STEPS.COMPLETE_REGISTRATION);
      } else {
        throw new Error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("OTP Verification Error:", error);
      message.error(error.response?.data?.message || "OTP verification failed");

      setOtp(Array(6).fill(""));
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const onCompleteRegistration = async (values) => {
    const registrationData = {
      fullName: formData.fullName,
      nic: formData.nic,
      phoneNumber: formData.phone,
      email: formData.email,
      password: values.password,
      securityPin: values.securityPin,
      referredBy: referralCode,
    };

    try {
      setRegisterLoading(true);
      setApiErrors({});

      const response = await axios.post(API.REGISTER_USER, registrationData);

      if (response.data._id) {
        message.success("Registration successful!");
        localStorage.setItem("userId", response.data._id);
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            _id: response.data._id,
            email: response.data.email,
            fullName: response.data.fullName,
          })
        );
        setTimeout(() => navigate("/login"), 1500);
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      const errorMsg =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      message.error(errorMsg);

      if (error.response?.data?.errors) {
        setApiErrors(error.response.data.errors);
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      setOtpLoading(true);
      setApiErrors({});

      const response = await axios.post(API.SEND_OTP, {
        email: formData.email,
      });

      if (response.data.message === "OTP sent to email") {
        setTimeLeft(120);
        setOtp(Array(6).fill(""));
        message.success("New OTP sent to your email");
      } else {
        throw new Error(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP Error:", error);
      message.error(
        error.response?.data?.message ||
          "Failed to resend OTP. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Please input your password!"));
    }
    if (value.length < 8) {
      return Promise.reject(
        new Error("Password must be at least 8 characters!")
      );
    }
    if (!/[A-Z]/.test(value)) {
      return Promise.reject(
        new Error("Password must contain at least one uppercase letter!")
      );
    }
    if (!/[a-z]/.test(value)) {
      return Promise.reject(
        new Error("Password must contain at least one lowercase letter!")
      );
    }
    if (!/[0-9]/.test(value)) {
      return Promise.reject(
        new Error("Password must contain at least one number!")
      );
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      return Promise.reject(
        new Error("Password must contain at least one special character!")
      );
    }
    return Promise.resolve();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const showTermsModal = () => {
    setIsTermsModalVisible(true);
  };

  const handleTermsOk = () => {
    setIsTermsModalVisible(false);
  };

  const handleTermsCancel = () => {
    setIsTermsModalVisible(false);
  };

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case STEPS.BASIC_INFO:
        return (
          <BasicInfoForm
            form={form}
            onFinish={onBasicInfoSubmit}
            loading={otpLoading}
            apiErrors={apiErrors}
            navigate={navigate}

          />
        );
      case STEPS.OTP_VERIFICATION:
        return (
          <OTPVerificationStep
            email={formData.email}
            otp={otp}
            timeLeft={timeLeft}
            handleOtpChange={handleOtpChange}
            handlePaste={handlePaste}
            verifyOtp={verifyOtp}
            resendOtp={resendOtp}
            formatTime={formatTime}
            inputRefs={inputRefs}
            loading={otpLoading}
          />
        );
      case STEPS.COMPLETE_REGISTRATION:
        return (
          <CompleteRegistrationForm
            onFinish={onCompleteRegistration}
            showPassword={showPassword}
            showPin={showPin}
            setShowPassword={setShowPassword}
            setShowPin={setShowPin}
            referralCode={referralCode}
            setReferralCode={setReferralCode}
            loading={registerLoading}
            apiErrors={apiErrors}
            validatePassword={validatePassword}
            isReferralCodeFromUrl={isReferralCodeFromUrl}
            showTermsModal={showTermsModal}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case STEPS.BASIC_INFO:
        return "Register Now";
      case STEPS.OTP_VERIFICATION:
        return "Verify Your Email";
      case STEPS.COMPLETE_REGISTRATION:
        return "Complete Registration";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1f1f2f] via-[#191c2d] to-[#101015] p-4">
      <div className="backdrop-blur-xl bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-teal-400/30 transition-colors duration-200 shadow-lg rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-full max-w-md">
        <div className="text-center mb-4">
          <img src={logo} alt="Bull Bear Logo" className="h-20 mx-auto" />
        </div>

        <div className="bg-[rgba(26,27,32,0.55)] p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] backdrop-blur-md">
          <h4 className="text-left text-lg font-semibold bg-gradient-to-r from-[#4ab6a7] to-[#33eed5] bg-clip-text text-transparent mb-6">
            {getStepTitle()}
            <hr className="!bg-[#33eed5] !my-2 w-[80px] h-[1.5px]" />
          </h4>

          {getCurrentStepComponent()}
        </div>

        <div className="text-center text-xs text-gray-400 mt-4">
          2025, BULL BEAR Solutions, All Rights Reserved
        </div>

        {/* Terms and Conditions Modal */}
        <Modal
          title={
            <span className="text-[#00E7BD] font-semibold">
              Terms and Conditions{" "}
              <span className="text-slate-400 text-sm font-normal">
                (Effective: {new Date().toLocaleDateString()})
              </span>
            </span>
          }
          open={isTermsModalVisible}
          onOk={handleTermsOk}
          onCancel={handleTermsCancel}
          footer={[
            <Button
              key="submit"
              type="primary"
              onClick={handleTermsOk}
              className="!bg-[#00E7BD] hover:!bg-[#00C7A3] !border-[#00E7BD] !text-gray-900 font-medium"
            >
              Accept & Continue
            </Button>,
          ]}
          className="terms-modal"
          styles={{
            header: {
              backgroundColor: "#0F172A",
              borderBottom: "1px solid #1E293B",
              borderRadius: "12px 12px 0 0",
            },
            body: {
              maxHeight: "60vh",
              overflowY: "auto",
              color: "#CBD5E1",
              backgroundColor: "#0F172A",
              padding: "24px",
            },
            footer: {
              backgroundColor: "#0F172A",
              borderTop: "1px solid #1E293B",
              borderRadius: "0 0 12px 12px",
            },
            content: {
              backgroundColor: "#0F172A",
              borderRadius: "12px",
              border: "1px solid #1E293B",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.6)",
            },
          }}
          width={800}
          closeIcon={
            <CloseOutlined className="text-slate-400 hover:text-[#00E7BD]" />
          }
        >
          {/* ... modal content remains the same ... */}
        </Modal>
      </div>
    </div>
  );
};

// Sub-components
const BasicInfoForm = ({ form, onFinish, loading, apiErrors,navigate }) => (
  <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
    <Form.Item
      label={<span className="text-white text-sm">Full Name</span>}
      name="fullName"
      rules={[
        { required: true, message: "Please input your full name!" },
        { min: 3, message: "Name must be at least 3 characters" },
      ]}
      className="mb-4"
      validateStatus={apiErrors.fullName ? "error" : ""}
      help={apiErrors.fullName}
    >
      <Input
        placeholder="Enter Full Name"
        style={{
          backgroundColor: "transparent",
          border: "none",
          borderBottom: `1px solid ${apiErrors.fullName ? "#ff4d4f" : "white"}`,
          color: "white",
        }}
        className="rounded-none h-9 text-sm focus:shadow-none vibrant-placeholder"
      />
    </Form.Item>

    <Form.Item
      label={<span className="text-white text-sm">NIC Number</span>}
      name="nic"
      rules={[
        { required: true, message: "Please input your NIC number!" },
        {
          pattern: /^([0-9]{9}[xXvV]|[0-9]{12})$/,
          message: "Please enter a valid NIC number",
        },
      ]}
      className="mb-4"
      validateStatus={apiErrors.nic ? "error" : ""}
      help={apiErrors.nic}
    >
      <Input
        placeholder="Enter NIC Number"
        style={{
          backgroundColor: "transparent",
          border: "none",
          borderBottom: `1px solid ${apiErrors.nic ? "#ff4d4f" : "white"}`,
          color: "white",
        }}
        className="rounded-none h-9 text-sm focus:shadow-none vibrant-placeholder"
      />
    </Form.Item>

    <Form.Item
      label={<span className="text-white text-sm">Phone Number</span>}
      name="phone"
      rules={[
        { required: true, message: "Please input your phone number!" },
        {
          validator: (_, value) => {
            if (!value || isValidPhoneNumber(value)) {
              return Promise.resolve();
            }
            return Promise.reject(
              new Error("Please enter a valid phone number")
            );
          },
        },
      ]}
      className="mb-4"
      validateStatus={apiErrors.phone ? "error" : ""}
      help={apiErrors.phone}
    >
      <PhoneInput
        international
        defaultCountry="LK"
        placeholder="Enter phone number"
        value={form.getFieldValue("phone")}
        onChange={(value) => form.setFieldsValue({ phone: value })}
        className="custom-phone-input"
        countrySelectProps={{
          className: "country-select",
          // Remove unsupported props like searchStyle, searchPlaceholder, etc.
        }}
      />
    </Form.Item>

    <Form.Item
      label={<span className="text-white text-sm">Email</span>}
      name="email"
      rules={[
        { required: true, message: "Please input your email!" },
        { type: "email", message: "Please enter a valid email!" },
      ]}
      className="mb-4"
      validateStatus={apiErrors.email ? "error" : ""}
      help={apiErrors.email}
    >
      <Input
        placeholder="Enter Email"
        style={{
          backgroundColor: "transparent",
          border: "none",
          borderBottom: `1px solid ${apiErrors.email ? "#ff4d4f" : "white"}`,
          color: "white",
        }}
        className="rounded-none h-9 text-sm focus:shadow-none vibrant-placeholder"
      />
    </Form.Item>

    <Button
      type="primary"
      htmlType="submit"
      block
      className="!bg-[#33eed5] !border-[#33eed5] !text-black font-medium h-10 shadow-[0_2px_8px_rgba(51,238,213,0.4)]"
      loading={loading}
    >
      Continue
    </Button>

    <div className="flex justify-between text-white text-xs mt-6">
      <span>Already have an account ?</span>
      <span
        className="text-[#33eed5] cursor-pointer hover:none"
        onClick={() => navigate("/login")}
      >
        Login Now
      </span>
    </div>
  </Form>
);

const OTPVerificationStep = ({
  email,
  otp,
  timeLeft,
  handleOtpChange,
  handlePaste,
  verifyOtp,
  resendOtp,
  formatTime,
  inputRefs,
  loading,
}) => (
  <>
    <div className="text-white text-sm mb-6">
      We've sent a 6-digit code to{" "}
      <span className="text-[#33eed5]">{email}</span>. Enter it below to verify.
    </div>

    <Form layout="vertical">
      <Form.Item
        label={<span className="text-white text-sm">6-Digit Code</span>}
        name="otp"
        className="mb-6"
      >
        <div className="flex justify-between">
          {otp.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                if (el) {
                  inputRefs.current[index] = el;
                }
              }}
              value={digit}
              maxLength={1}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digit && index > 0) {
                  inputRefs.current[index - 1]?.focus();
                }
              }}
              onPaste={(e) => handlePaste(e, index)}
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
      </Form.Item>

      <div className="flex justify-between items-center mb-6">
        <span
          className={`text-xs cursor-pointer hover:underline ${
            timeLeft === 0 ? "text-[#33eed5]" : "text-gray-400"
          }`}
          onClick={timeLeft === 0 && !loading ? resendOtp : undefined}
        >
          {timeLeft === 0 ? "Resend Code" : "Code expires in"}
        </span>
        <span
          className={`text-xs ${timeLeft < 30 ? "text-red-400" : "text-white"}`}
        >
          {formatTime(timeLeft)}
        </span>
      </div>

      <Button
        type="primary"
        block
        onClick={verifyOtp}
        className="!bg-[#33eed5] !border-[#33eed5] !text-black font-medium h-10 shadow-[0_2px_8px_rgba(51,238,213,0.4)] flex items-center justify-center"
        disabled={otp.some((digit) => !digit) || loading}
        loading={loading}
      >
        {!loading && (
          <>
            Verify OTP
            <ArrowRightOutlined className="ml-2" />
          </>
        )}
      </Button>
    </Form>
  </>
);

const CompleteRegistrationForm = ({
  onFinish,
  showPassword,
  showPin,
  setShowPassword,
  setShowPin,
  referralCode,
  setReferralCode,
  loading,
  apiErrors,
  validatePassword,
  isReferralCodeFromUrl,
  showTermsModal,
}) => (
  <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
    <Form.Item
      label={<span className="text-white text-sm">Password</span>}
      name="password"
      rules={[{ validator: validatePassword }]}
      className="mb-4"
      validateStatus={apiErrors.password ? "error" : ""}
      help={apiErrors.password}
    >
      <Input
        type={showPassword ? "text" : "password"}
        placeholder="Enter Password"
        style={{
          backgroundColor: "transparent",
          border: "none",
          borderBottom: `1px solid ${apiErrors.password ? "#ff4d4f" : "white"}`,
          color: "white",
        }}
        className="rounded-none h-9 text-sm focus:shadow-none"
        suffix={
          showPassword ? (
            <EyeOutlined
              className="text-gray-400"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <EyeInvisibleOutlined
              className="text-gray-400"
              onClick={() => setShowPassword(true)}
            />
          )
        }
      />
    </Form.Item>

    <Form.Item
      label={<span className="text-white text-sm">Confirm Password</span>}
      name="confirmPassword"
      dependencies={["password"]}
      rules={[
        { required: true, message: "Please confirm your password!" },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue("password") === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error("The two passwords do not match!"));
          },
        }),
      ]}
      className="mb-4"
    >
      <Input
        type={showPassword ? "text" : "password"}
        placeholder="Confirm Password"
        style={{
          backgroundColor: "transparent",
          border: "none",
          borderBottom: "1px solid white",
          color: "white",
        }}
        className="rounded-none h-9 text-sm focus:shadow-none"
        suffix={
          showPassword ? (
            <EyeOutlined
              className="text-gray-400"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <EyeInvisibleOutlined
              className="text-gray-400"
              onClick={() => setShowPassword(true)}
            />
          )
        }
      />
    </Form.Item>

    <Form.Item
      label={
        <span className="text-white text-sm">Security PIN (4 digits)</span>
      }
      name="securityPin"
      rules={[
        { required: true, message: "Please input your 4-digit security PIN!" },
        {
          pattern: /^[0-9]{4}$/,
          message: "PIN must be exactly 4 digits",
        },
      ]}
      className="mb-4"
      validateStatus={apiErrors.securityPin ? "error" : ""}
      help={apiErrors.securityPin}
    >
      <Input
        type={showPin ? "text" : "password"}
        placeholder="Enter 4-digit PIN"
        maxLength={4}
        style={{
          backgroundColor: "transparent",
          border: "none",
          borderBottom: `1px solid ${
            apiErrors.securityPin ? "#ff4d4f" : "white"
          }`,
          color: "white",
        }}
        className="rounded-none h-9 text-sm focus:shadow-none"
        suffix={
          showPin ? (
            <EyeOutlined
              className="text-gray-400"
              onClick={() => setShowPin(false)}
            />
          ) : (
            <EyeInvisibleOutlined
              className="text-gray-400"
              onClick={() => setShowPin(true)}
            />
          )
        }
      />
    </Form.Item>

    <Form.Item
      label={<span className="text-white text-sm">Referral Code</span>}
      name="referralCode"
      className="mb-4"
    >
      <Input
        value={referralCode}
        onChange={(e) =>
          !isReferralCodeFromUrl && setReferralCode(e.target.value)
        }
        placeholder="Enter Referral Code"
        readOnly={isReferralCodeFromUrl}
        style={{
          backgroundColor: "transparent",
          border: "none",
          borderBottom: "1px solid white",
          color: "white",
          cursor: isReferralCodeFromUrl ? "not-allowed" : "text",
        }}
        className={`rounded-none h-9 text-sm focus:shadow-none ${
          isReferralCodeFromUrl ? "opacity-80" : ""
        }`}
      />
      {isReferralCodeFromUrl && (
        <p className="text-xs text-[#33eed5] mt-1">
          Referral code applied from invitation link
        </p>
      )}
    </Form.Item>

    <Form.Item
      name="agreement"
      valuePropName="checked"
      rules={[
        {
          validator: (_, value) =>
            value
              ? Promise.resolve()
              : Promise.reject(
                  new Error("You must accept the terms and conditions")
                ),
        },
      ]}
      className="mb-4"
    >
      <div className="ant-checkbox-wrapper">
        {" "}
        {/* Maintains Ant Design's checkbox spacing */}
        <Checkbox className="[&>.ant-checkbox+span]:text-xs">
          <span className="text-white inline-flex items-center">
            {" "}
            {/* Exact positioning */}I agree to the{" "}
            <button
              type="button"
              onClick={showTermsModal}
              className="text-[#33eed5] hover:underline focus:outline-none ml-1"
            >
              Terms and Conditions
            </button>
          </span>
        </Checkbox>
      </div>
    </Form.Item>

    <Button
      type="primary"
      htmlType="submit"
      block
      className="!bg-[#33eed5] !border-[#33eed5] !text-black font-medium h-10 shadow-[0_2px_8px_rgba(51,238,213,0.4)]"
      loading={loading}
    >
      Complete Registration
    </Button>
  </Form>
);

export default Register;
