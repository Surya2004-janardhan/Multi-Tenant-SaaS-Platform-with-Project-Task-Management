const bcrypt = require("bcryptjs");

const testPassword = "Admin@123";
const dbHash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

console.log("Testing super admin password...");
console.log("Password:", testPassword);
console.log("DB Hash:", dbHash);

bcrypt.compare(testPassword, dbHash).then((match) => {
  console.log("Password matches:", match);

  if (!match) {
    console.log("\nGenerating new hash...");
    bcrypt.hash(testPassword, 10).then((newHash) => {
      console.log("New hash:", newHash);
    });
  }
});
