const bcrypt = require("bcryptjs");

async function generateHash() {
  const password = "password123";
  const hash = await bcrypt.hash(password, 10);
  console.log("\nPassword:", password);
  console.log("Bcrypt Hash:", hash);
  console.log("\n📋 Copy this hash to seed file:");
  console.log(hash);
}

generateHash();
