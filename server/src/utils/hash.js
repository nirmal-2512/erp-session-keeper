import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password, passwordHash) => {
  return await bcrypt.compare(password, passwordHash);
};

export const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, SALT_ROUNDS);
};

export const compareOTP = async (otp, otpHash) => {
  return await bcrypt.compare(otp, otpHash);
};