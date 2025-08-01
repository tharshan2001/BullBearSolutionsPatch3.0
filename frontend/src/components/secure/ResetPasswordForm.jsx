import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  SafetyOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Modal, Alert } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthProvider";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const ResetPasswordForm = () => {
  const [form] = Form.useForm();
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const validatePassword = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Please input your password!"));
    }
    if (value.length < 8) {
      return Promise.reject(new Error("Password must be at least 8 characters!"));
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

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError(null);

      const resetPromise = axios.post(
        `${API_BASE_URL}/api/auth/reset-password-old`,
        {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.promise(resetPromise, {
        loading: "Updating password...",
        success: "Password updated successfully!",
        error: (err) => {
          if (err.response?.status === 401) {
            return "Invalid current password. Please try again.";
          }
          return err.response?.data?.message || "Failed to update password";
        },
      });

      const response = await resetPromise;

      if (response.data.message === "Password updated successfully") {
        form.resetFields();
        await checkAuth();

        Modal.success({
          title: "Password Reset Successful",
          content: "Your password has been updated successfully.",
          okText: "Continue",
          okButtonProps: {
            className: "!bg-[#33eed5] !border-[#33eed5] !text-black",
          },
          onOk: () => {
            setTimeout(() => {
              navigate("./privacy");
              toast.success("Privacy settings loaded successfully", {
                duration: 4000,
                position: "top-right",
                style: {
                  background: "#33eed5",
                  color: "#000",
                  fontWeight: 500,
                },
                iconTheme: {
                  primary: "#000",
                  secondary: "#33eed5",
                },
              });
            }, 1500);
          },
        });
      }
    } catch (error) {
      console.error("Reset Password Error:", error);
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
            Reset Password
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
              label={<span className="text-white text-sm">Current Password</span>}
              name="oldPassword"
              rules={[
                { required: true, message: "Please input your current password!" },
              ]}
              className="mb-4"
            >
              <Input
                type={showOldPassword ? "text" : "password"}
                placeholder="Enter current password"
                prefix={<LockOutlined className="text-gray-400" />}
                suffix={
                  showOldPassword ? (
                    <EyeOutlined
                      className="text-gray-400 cursor-pointer hover:text-[#33eed5]"
                      onClick={() => setShowOldPassword(false)}
                    />
                  ) : (
                    <EyeInvisibleOutlined
                      className="text-gray-400 cursor-pointer hover:text-[#33eed5]"
                      onClick={() => setShowOldPassword(true)}
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
              label={<span className="text-white text-sm">New Password</span>}
              name="newPassword"
              rules={[{ validator: validatePassword }]}
              className="mb-4"
            >
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                prefix={<LockOutlined className="text-gray-400" />}
                suffix={
                  showNewPassword ? (
                    <EyeOutlined
                      className="text-gray-400 cursor-pointer hover:text-[#33eed5]"
                      onClick={() => setShowNewPassword(false)}
                    />
                  ) : (
                    <EyeInvisibleOutlined
                      className="text-gray-400 cursor-pointer hover:text-[#33eed5]"
                      onClick={() => setShowNewPassword(true)}
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
                <span className="text-white text-sm">Confirm New Password</span>
              }
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Please confirm your new password!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match!")
                    );
                  },
                }),
              ]}
              className="mb-6"
            >
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                prefix={<LockOutlined className="text-gray-400" />}
                suffix={
                  showConfirmPassword ? (
                    <EyeOutlined
                      className="text-gray-400 cursor-pointer hover:text-[#33eed5]"
                      onClick={() => setShowConfirmPassword(false)}
                    />
                  ) : (
                    <EyeInvisibleOutlined
                      className="text-gray-400 cursor-pointer hover:text-[#33eed5]"
                      onClick={() => setShowConfirmPassword(true)}
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
                Reset Password
                <ArrowRightOutlined className="ml-2" />
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;