import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  SafetyOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Alert } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const ResetPinForm = () => {
  const [form] = Form.useForm();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError(null);

      const resetPromise = axios.post(
        `${API_BASE_URL}/api/auth/reset-pin`,
        {
          currentPassword: values.currentPassword,
          newPin: values.newPin,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.promise(resetPromise, {
        loading: "Updating security PIN...",
        success: "Security PIN updated successfully!",
        error: (err) => {
          if (err.response?.status === 401) {
            return "Invalid current password. Please try again.";
          }
          return err.response?.data?.message || "Failed to update security PIN";
        },
      });

      const response = await resetPromise;

      if (response.data.message === "Security PIN updated successfully") {
        form.resetFields();
        await checkAuth();
        toast.success("Your security PIN has been updated successfully!");
        navigate("/resources", { replace: true });
      }
    } catch (error) {
      console.error("Reset PIN Error:", error);
      setError(error.response?.data?.message || "An unexpected error occurred");
      await checkAuth();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" flex items-center justify-center p-4">
      <div className="backdrop-blur-xl bg-[rgba(25,28,45,0.75)] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-full max-w-md">
        <div className="bg-[rgba(26,27,32,0.75)] p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] backdrop-blur-md">
          <h4 className="text-left text-lg font-semibold bg-gradient-to-r from-[#4ab6a7] to-[#33eed5] bg-clip-text text-transparent mb-6">
            Reset Security PIN
            <hr className="!bg-[#33eed5] !my-2 w-[80px] h-[1.5px]" />
          </h4>

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              className="mb-4 !bg-[#2a1d2c] !border-[#442434]"
              onClose={() => setError(null)}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            requiredMark={false}
          >
            <Form.Item
              label={
                <span className="text-white text-sm">Current Password</span>
              }
              name="currentPassword"
              rules={[
                {
                  required: true,
                  message: "Please input your current password!",
                },
                { min: 8, message: "Password must be at least 8 characters!" },
              ]}
              className="mb-4"
            >
              <Input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Enter current password"
                prefix={<LockOutlined className="text-gray-400" />}
                suffix={
                  showCurrentPassword ? (
                    <EyeOutlined
                      className="text-gray-400 cursor-pointer hover:text-[#33eed5]"
                      onClick={() => setShowCurrentPassword(false)}
                    />
                  ) : (
                    <EyeInvisibleOutlined
                      className="text-gray-400 cursor-pointer hover:text-[#33eed5]"
                      onClick={() => setShowCurrentPassword(true)}
                    />
                  )
                }
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: "1px solid #33eed5",
                  color: "white",
                }}
                className="rounded-none focus:shadow-none"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-white text-sm">New 4-Digit PIN</span>
              }
              name="newPin"
              rules={[
                { required: true, message: "Please input your new PIN!" },
                {
                  pattern: /^[0-9]{4}$/,
                  message: "PIN must be exactly 4 digits",
                },
              ]}
              className="mb-4"
            >
              <Input
                type={showNewPin ? "text" : "password"}
                placeholder="Enter new 4-digit PIN"
                maxLength={4}
                prefix={<LockOutlined className="text-gray-400" />}
                suffix={
                  showNewPin ? (
                    <EyeOutlined
                      className="text-gray-400 cursor-pointer hover:text-[#33eed5]"
                      onClick={() => setShowNewPin(false)}
                    />
                  ) : (
                    <EyeInvisibleOutlined
                      className="text-gray-400 cursor-pointer hover:text-[#33eed5]"
                      onClick={() => setShowNewPin(true)}
                    />
                  )
                }
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: "1px solid #33eed5",
                  color: "white",
                }}
                className="rounded-none focus:shadow-none"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-white text-sm">Confirm New PIN</span>
              }
              name="confirmPin"
              dependencies={["newPin"]}
              rules={[
                { required: true, message: "Please confirm your new PIN!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPin") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two PINs do not match!")
                    );
                  },
                }),
              ]}
              className="mb-6"
            >
              <Input
                type={showConfirmPin ? "text" : "password"}
                placeholder="Confirm new 4-digit PIN"
                maxLength={4}
                prefix={<LockOutlined className="text-gray-400" />}
                suffix={
                  showConfirmPin ? (
                    <EyeOutlined
                      className="text-gray-400 cursor-pointer hover:text-[#33eed5]"
                      onClick={() => setShowConfirmPin(false)}
                    />
                  ) : (
                    <EyeInvisibleOutlined
                      className="text-gray-400 cursor-pointer hover:text-[#33eed5]"
                      onClick={() => setShowConfirmPin(true)}
                    />
                  )
                }
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: "1px solid #33eed5",
                  color: "white",
                }}
                className="rounded-none focus:shadow-none"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="!bg-[#33eed5] !border-[#33eed5] !text-black font-medium h-10 shadow-[0_2px_8px_rgba(51,238,213,0.4)] hover:!bg-[#2bd8c0] hover:!border-[#2bd8c0] flex items-center justify-center"
                icon={<SafetyOutlined />}
              >
                Reset Security PIN
                <ArrowRightOutlined className="ml-2" />
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ResetPinForm;