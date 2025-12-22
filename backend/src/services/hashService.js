// Hash Service
// Password hashing and verification using bcrypt

const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error("Error hashing password:", error);
    throw new Error("Failed to hash password");
  }
};

const comparePassword = async (password, hash) => {
  try {
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error("Error comparing password:", error);
    throw new Error("Failed to compare password");
  }
};

module.exports = {
  hashPassword,
  comparePassword,
};
