import { ArrowRightOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const OTPForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/send-otp`,
        { email: values.email },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("OTP sent successfully!");
        setOtpSent(true);
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error(
        error.response?.data?.message || "An error occurred while sending OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    const email = form.getFieldValue("email");
    if (!email) {
      toast("Please enter your email first", { icon: "⚠️" });
      return;
    }
    await onFinish({ email });
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
          <h4 className="text-left text-lg font-semibold bg-gradient-to-r from-[#4ab6a7] to-[#33eed5] bg-clip-text text-transparent mb-6">
            {otpSent ? "Enter OTP" : "OTP Verification"}
            <hr className="!bg-[#33eed5] !my-2 w-[80px] h-[1.5px]" />
          </h4>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label={<span className="text-white">Email</span>}
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
              className="mb-4"
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
                disabled={otpSent}
              />
            </Form.Item>

            {otpSent && (
              <Form.Item
                label={<span className="text-white">OTP</span>}
                name="otp"
                rules={[
                  { required: true, message: "Please input the OTP!" },
                  {
                    len: 6,
                    message: "OTP must be 6 characters long!",
                  },
                ]}
                className="mb-4"
              >
                <Input
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom: "1px solid white",
                    color: "white",
                  }}
                  className="rounded-none h-9 text-sm focus:shadow-none"
                />
              </Form.Item>
            )}
          </Form>
        </div>

        <div className="flex justify-between items-center mt-4">
          {otpSent ? (
            <span
              className="text-[#33eed5] text-xs cursor-pointer"
              onClick={handleResendOTP}
            >
              Resend OTP
            </span>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-1">
            <Button
              type="primary"
              shape="circle"
              size="small"
              icon={<ArrowRightOutlined className="text-xs" />}
              className="!bg-[#33eed5] !border-[#33eed5] shadow-[0_2px_6px_rgba(51,238,213,0.4)]"
              onClick={() => form.submit()}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPForm;