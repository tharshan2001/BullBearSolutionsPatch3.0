import {
  ArrowRightOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, Typography, message } from "antd";
import React, { useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import logo from '../assets/v3.png'; 

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await login(values.email, values.password);
      message.success("Login successful!");
      navigate("/");
    } catch (error) {
      message.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1f1f2f] via-[#191c2d] to-[#101015] p-4">
      <div className="backdrop-blur-xl bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-teal-400/30 transition-colors duration-200 shadow-lg rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-4">
          <img 
            src={logo} 
            alt="Bull Bear Logo" 
            className="h-20 mx-auto"
          />
        </div>

        {/* Form Container */}
        <div className="bg-[rgba(26,27,32,0.55)] p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.2)] backdrop-blur-md">
          <h4 className="text-left text-lg font-semibold bg-gradient-to-r from-[#4ab6a7] to-[#33eed5] bg-clip-text text-transparent mb-6">
            Login
            <hr className="!bg-[#33eed5] !my-2 w-[80px] h-[1.5px]" />
          </h4>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="on"
            requiredMark={false}
          >
            <Form.Item
              label={<span className="text-white text-sm">Email</span>}
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email" },
              ]}
              className="mb-4"
            >
              <Input
                placeholder="Enter Email"
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: "1px solid white",
                  color: "white",
                }}
                className="rounded-none h-9 text-sm focus:shadow-none vibrant-placeholder"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-white text-sm">Password</span>}
              name="password"
              rules={[
                { required: true, message: "Please input your password!" }
              ]}
              className="mb-4"
            >
              <Input.Password
                placeholder="Enter Password"
                iconRender={(visible) =>
                  visible ? (
                    <EyeOutlined style={{ color: "#33eed5" }} />
                  ) : (
                    <EyeInvisibleOutlined style={{ color: "#33eed5" }} />
                  )
                }
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: "1px solid white",
                  color: "white",
                }}
                className="rounded-none h-9 text-sm focus:shadow-none"
              />
            </Form.Item>

            <div className="flex justify-between text-white text-xs mt-4">
              <span>Don't have an account?</span>
              <span 
                className="text-[#33eed5] cursor-pointer hover:none"
                onClick={() => navigate("/register")}
              >
                Register Now
              </span>
            </div>

            <div className="flex justify-between items-center mt-6">
              <span 
                className="text-[#33eed5] text-xs cursor-pointer hover:underline"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password
              </span>

              <div className="flex items-center gap-2">
                <span className="text-[#33eed5] text-xs">Login Now</span>
                <Button
                  type="primary"
                  shape="circle"
                  icon={<ArrowRightOutlined />}
                  className="!bg-[#33eed5] !border-[#33eed5] !text-black shadow-[0_2px_8px_rgba(51,238,213,0.4)]"
                  htmlType="submit"
                  loading={loading}
                />
              </div>
            </div>
          </Form>
        </div>

        <div className="text-center text-xs text-gray-400 mt-4">
          2025, BULL BEAR Solutions, All Rights Reserved
        </div>
      </div>
    </div>
  );
};

export default Login;