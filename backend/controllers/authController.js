import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import TempUser from "../models/TempUser.js";
import { sendEmail } from "../utils/emailHandler.js";
import { createNotification } from "../controllers/notificationController.js";
import PremiumPlan from "../models/PremiumPlan.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to generate 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//register user
export const registerUser = async (req, res) => {
  try {
    const {
      email,
      fullName,
      nic,
      phoneNumber,
      password,
      securityPin,
      referredBy,
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if email is verified in TempUser
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser || !tempUser.verified) {
      return res.status(400).json({ message: "Email not verified via OTP" });
    }

    let referringUser = null;

    if (referredBy) {
      if (!mongoose.Types.ObjectId.isValid(referredBy)) {
        return res
          .status(400)
          .json({ message: "Invalid referredBy ID format" });
      }

      referringUser = await User.findById(referredBy);
      if (!referringUser) {
        return res.status(400).json({ message: "Invalid Referral Code" });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const pinHash = await bcrypt.hash(securityPin, 10);

    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(now.getFullYear() + 1);

    const newUser = new User({
      email,
      fullName,
      nic,
      phoneNumber,
      passwordHash,
      securityPin: pinHash,
      referredBy: referringUser ? referringUser._id : null,
      premium: {
        active: true,
        activatedDate: now,
        expiryDate: oneYearLater,
      },
    });

    const savedUser = await newUser.save();

    // Update referring user
    if (referringUser) {
      referringUser.references = referringUser.references || [];
      referringUser.references.push(savedUser._id);

      // Increase level by 2, capped at 20
      referringUser.level = Math.min(referringUser.level + 2, 20);

      await referringUser.save();
    }

    // Remove temp user record
    await TempUser.deleteOne({ email });

    // Create notifications
    await createNotification(
      savedUser._id,
      "Your account has been created successfully!",
      "success"
    );

    await createNotification(
      savedUser._id,
      "Enjoy your Premium membership for 1 year!",
      "success"
    );

    if (referringUser) {
      await createNotification(
        referringUser._id,
        `${fullName} Accepted Your Invite.`,
        "referral"
      );

      await createNotification(
        savedUser._id,
        `You became a team member of ${referringUser.fullName}.`,
        "info"
      );
    }

    const welcomeHtml = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333; line-height: 1.5;">
    <h2 style="color:rgb(36, 59, 49); margin-bottom: 16px;">Welcome to BullBear Solution!</h2>
    <p>Hi ${fullName},</p>
    <p>Your account has been successfully created, and your <strong>Premium membership is now active!</strong> 🎉</p>
    <p>We're excited to have you on board. Here’s what you can do next:</p>
    <ul style="padding-left: 20px; margin: 16px 0;">
      <li>Log in to your account to explore Premium features</li>
      <li>Reply to this email if you need assistance</li>
    </ul>
    <p>Thank you for choosing BB Solution!</p>
    <p style="margin-top: 24px;">— The BullBear Solution Team</p>
    <img src="cid:bbsolution-logo" alt="BB Solution Logo" style="width: 100%; display: block; margin: 20px 0;" />
    <hr style="border: none; height: 1px; background-color: #e0e0e0; margin: 20px 0;">
    <p style="font-size: 12px; color: #777777;">
      BullBearSolutions<br>
      <a href="https://bullbear.solutions/" style="color: #2A5DB0; text-decoration: none;">www.bullbear.solutions</a>
    </p>
  </div>
`;

    await sendEmail({
      to: email,
      subject: "Welcome to BB Solution!",
      html: welcomeHtml,
      attachments: [
        {
          filename: "logo.png",
          path: path.resolve(__dirname, "../assets/image.png"),
          cid: "bbsolution-logo",
        },
      ],
    });

    // Respond to client
    res.status(201).json({
      _id: savedUser._id,
      email: savedUser.email,
      fullName: savedUser.fullName,
    });
  } catch (error) {
    console.error("registerUser error:", error);
    res.status(500).json({ message: error.message });
  }
};

//test register
export const testRegisterUser = async (req, res) => {
  try {
    const {
      email,
      fullName,
      nic,
      phoneNumber,
      password,
      securityPin,
      referredBy,
    } = req.body;

    if (!referredBy) {
      return res.status(400).json({ message: "referredBy is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(referredBy)) {
      return res.status(400).json({ message: "Invalid referredBy ID format" });
    }

    const referringUser = await User.findById(referredBy);
    if (!referringUser) {
      return res.status(400).json({ message: "referring user not found" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const pinHash = await bcrypt.hash(securityPin, 10);

    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(now.getFullYear() + 1);

    console.log("referredBy before save:", referredBy);

    const newUser = new User({
      email,
      fullName,
      nic,
      phoneNumber,
      passwordHash,
      securityPin: pinHash,
      referredBy,
      premium: {
        active: true,
        activatedDate: now,
        expiryDate: oneYearLater,
      },
    });

    const savedUser = await newUser.save();

    referringUser.references = referringUser.references || [];
    referringUser.references.push(savedUser._id);
    await referringUser.save();
    // CREATE NOTIFICATIONS:

    // 1. For new user: Account created
    await createNotification(
      savedUser._id,
      "Your account has been created successfully!",
      "success"
    );

    await createNotification(
      savedUser._id,
      "Enjoy your Premium membership for 1 year!",
      "success"
    );

    if (referringUser) {
      // 2. For referring user: New team member referred
      await createNotification(
        referringUser._id,
        `${fullName} Accepted Your Invite, Get your rewards!`,
        "referral"
      );

      // 3. For new user: Became team member of referring user
      await createNotification(
        savedUser._id,
        `You became a team member of ${referringUser.fullName}.`,
        "info"
      );
    }

    res.status(201).json({
      message: "Test user registered successfully with referral",
      userId: savedUser._id,
      premium: savedUser.premium,
    });
  } catch (error) {
    console.error("testRegisterUser error:", error);
    res.status(500).json({ message: error.message });
  }
};

//login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user);

    // Set token as HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: false,
      secure: true,
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Send user data without token
    res.json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//send otp
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      console.error("User not found for email:", email);
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 2 * 60 * 1000);
    await user.save();

    const emailHtml = `
      <h3>Your OTP Code</h3>
      <p>Hello ${user.fullName || "User"},</p>
      <p>Your OTP code is: <strong>${otp}</strong></p>
      <p>This code will expire in 2 minutes.</p>
    `;

    // You can optionally wrap this in try/catch to catch sendEmail errors separately
    await sendEmail({
      to: user.email,
      subject: "Your OTP Code",
      html: emailHtml,
    });

    return res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//otp verify
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json(false);
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json(false);

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json(false);
    }

    if (user.otpExpires < new Date()) {
      return res.status(400).json(false);
    }

    if (user.otp !== otp) {
      return res.status(400).json(false);
    }

    // OTP is valid, clear it if you want
    // user.otp = null;
    // user.otpExpires = null;
    // await user.save();

    res.json(true);
  } catch (error) {
    console.error("verifyOtp error:", error);
    res.status(500).json(false);
  }
};

//profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select(
      "-passwordHash -securityPin -otp -otpExpires -nic -referredBy -phoneNumber -_id"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//logout user
export const logoutUser = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    expires: new Date(0), // Expire the cookie immediately
  });
  res.json({ message: "Logged out successfully" });
};

// walllet details
export const getWalletDetails = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find user and select only wallet field
    const user = await User.findById(userId).select("wallet");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.wallet);
  } catch (error) {
    console.error("getWalletDetails error:", error);
    res.status(500).json({ message: error.message });
  }
};

//premium upgrade
export const upgradePremium = async (req, res) => {
  try {
    const userId = req.user._id;
    const { planId, walletMethod } = req.body;

    // Validate planId
    if (!mongoose.Types.ObjectId.isValid(planId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid plan ID." });
    }

    // Validate wallet method
    if (!walletMethod || !["usdt", "cw"].includes(walletMethod)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing wallet method." });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Find premium plan
    const plan = await PremiumPlan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: "Premium plan not found or inactive.",
      });
    }

    const now = new Date();

    // Check if premium is already active and not expired
    if (user.premium && user.premium.active && user.premium.expiryDate > now) {
      return res.status(400).json({
        success: false,
        message: `You already have an active premium plan until ${user.premium.expiryDate.toISOString()}.`,
      });
    }

    const cost = plan.prices.yearly;

    // Atomically check balance and deduct
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, [`wallet.${walletMethod}`]: { $gte: cost } },
      {
        $inc: { [`wallet.${walletMethod}`]: -cost },
        $set: { "wallet.lastUpdated": new Date() },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${walletMethod.toUpperCase()} balance.`,
      });
    }

    // Calculate new expiry date
    let newExpiryDate = now;
    if (
      updatedUser.premium &&
      updatedUser.premium.active &&
      updatedUser.premium.expiryDate > now
    ) {
      newExpiryDate = new Date(updatedUser.premium.expiryDate);
    }

    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1); // extend by one year

    // Update premium info
    updatedUser.premium = {
      active: true,
      plan: plan._id,
      activatedDate: now,
      expiryDate: newExpiryDate,
    };

    await updatedUser.save();

    return res.status(200).json({
      success: true,
      message: "Premium membership upgraded successfully.",
      premium: updatedUser.premium,
      wallet: updatedUser.wallet,
    });
  } catch (error) {
    console.error("Error upgrading premium:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

//reset password
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res
        .status(400)
        .json({ message: "Email, OTP, and new password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    // Check if OTP is set
    if (!user.otp || !user.otpExpires) {
      return res
        .status(400)
        .json({ message: "No OTP found. Please request a new one." });
    }

    // Check if OTP expired
    if (user.otpExpires < new Date()) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new one." });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password and clear OTP
    user.passwordHash = passwordHash;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({
      message:
        "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ message: error.message });
  }
};

// reset security pin
export const resetSecurityPin = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user is authenticated and ID is in req.user
    const { currentPassword, newPin } = req.body;

    if (!currentPassword || !newPin) {
      return res
        .status(400)
        .json({ message: "Current password and new PIN are required." });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid current password." });
    }

    // Hash the new security PIN
    const newPinHash = await bcrypt.hash(newPin, 10);

    // Update the securityPin
    user.securityPin = newPinHash;
    await user.save();

    res.json({ message: "Security PIN updated successfully." });
  } catch (error) {
    console.error("resetSecurityPin error:", error);
    res.status(500).json({ message: error.message });
  }
};

// reset password with old password
export const resetPasswordWithOld = async (req, res) => {
  try {
    const userId = req.user._id; // assuming user is authenticated
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old password and new password are required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check if old password matches
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid old password." });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update passwordHash
    user.passwordHash = newPasswordHash;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("resetPasswordWithOld error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get user by ID or Email (admin)
export const getUserById = async (req, res) => {
  try {
    const identifier = req.params.id?.trim();

    if (!identifier) {
      return res.status(400).json({ message: "User identifier is required." });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    let query;
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query = { _id: identifier };
    } else if (isEmail) {
      query = { email: identifier.toLowerCase() };
    } else {
      return res.status(400).json({ message: "Invalid ID or email format." });
    }

    const user = await User.findOne(query).select(
      "-passwordHash -securityPin -otp -otpExpires"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("getUserById error:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

// Update user by ID or Email (admin)
export const updateUserById = async (req, res) => {
  try {
    const identifier = req.params.id; // could be ObjectId or email
    const updates = req.body;

    // Disallow updates to sensitive fields
    const disallowedFields = [
      "passwordHash",
      "securityPin",
      "otp",
      "otpExpires",
    ];
    disallowedFields.forEach((field) => delete updates[field]);

    let updatedUser;

    // Simple email validation
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      // Update by ObjectId
      updatedUser = await User.findByIdAndUpdate(identifier, updates, {
        new: true,
        runValidators: true,
        context: "query",
      }).select("-passwordHash -securityPin -otp -otpExpires");
    } else if (isEmail) {
      // Update by email
      updatedUser = await User.findOneAndUpdate(
        { email: identifier.toLowerCase().trim() },
        updates,
        {
          new: true,
          runValidators: true,
          context: "query",
        }
      ).select("-passwordHash -securityPin -otp -otpExpires");
    } else {
      return res.status(400).json({ message: "Invalid ID or email format." });
    }

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("updateUserById error:", error);
    res.status(500).json({ message: error.message });
  }
};
