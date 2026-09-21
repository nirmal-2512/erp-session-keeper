import supabase from "../config/supabase.js";

import jwt from "jsonwebtoken";

import {
  hashPassword,
  hashOTP,
  compareOTP,
  comparePassword,
} from "../utils/hash.js";
import {
  generateOTP,
  getOTPExpiry,
  sendOTPEmail,
} from "../services/otpService.js";


export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // -------------------------
    // Validate input
    // -------------------------

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // -------------------------
    // Check existing user
    // -------------------------

    const { data: existingUser, error: existingUserError } =
      await supabase
        .from("users")
        .select("id, is_email_verified")
        .eq("email", normalizedEmail)
        .maybeSingle();

    if (existingUserError) {
      console.error("Existing user check:", existingUserError);

      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: existingUser.is_email_verified
          ? "An account with this email already exists"
          : "An account exists but email verification is pending",
      });
    }

    // -------------------------
    // Hash password
    // -------------------------

    const passwordHash = await hashPassword(password);

    // -------------------------
    // Generate OTP
    // -------------------------

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const otpExpiresAt = getOTPExpiry();

    // -------------------------
    // Create user
    // -------------------------

    const { data: user, error: insertError } = await supabase
      .from("users")
      .insert({
        name: name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash,
        is_email_verified: false,
        otp_hash: otpHash,
        otp_expires_at: otpExpiresAt.toISOString(),
      })
      .select("id, name, email, is_email_verified")
      .single();

    if (insertError) {
      console.error("User creation:", insertError);

      return res.status(500).json({
        success: false,
        message: "Could not create account",
      });
    }

    // TEMPORARY:
    // We will replace this with Brevo email sending.
    const emailResult = await sendOTPEmail(
      normalizedEmail,
      name.trim(),
      otp
    );


    return res.status(201).json({
      success: true,
      message: "Registration successful. OTP sent to your email.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be 6 digits",
      });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select(
        "id, name, email, is_email_verified, otp_hash, otp_expires_at, otp_attempts"
      )
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error("Find user:", error);

      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (user.is_email_verified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    if (!user.otp_hash || !user.otp_expires_at) {
      return res.status(400).json({
        success: false,
        message: "No active OTP. Please request a new OTP.",
      });
    }

    if (new Date(user.otp_expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    if ((user.otp_attempts || 0) >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    const isValidOTP = await compareOTP(
      otp,
      user.otp_hash
    );

    if (!isValidOTP) {
      await supabase
        .from("users")
        .update({
          otp_attempts: (user.otp_attempts || 0) + 1,
        })
        .eq("id", user.id);

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_email_verified: true,
        otp_hash: null,
        otp_expires_at: null,
        otp_attempts: 0,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Verify OTP update:", updateError);

      return res.status(500).json({
        success: false,
        message: "Could not verify email",
      });
    }

    return res.json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: user, error } = await supabase
      .from("users")
      .select(
        "id, name, email, password_hash, is_email_verified"
      )
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error("Login user lookup:", error);

      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.is_email_verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const validPassword = await comparePassword(
      password,
      user.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("erp_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, is_email_verified")
      .eq("id", req.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("erp_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  });

  return res.json({
    success: true,
    message: "Logged out successfully",
  });
};