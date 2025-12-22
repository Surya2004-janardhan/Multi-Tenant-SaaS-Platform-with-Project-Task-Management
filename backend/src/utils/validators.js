// Validators
// Input validation helper functions

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidSubdomain = (subdomain) => {
  // 3-63 characters, alphanumeric and hyphens, cannot start/end with hyphen
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  return (
    subdomain.length >= 3 &&
    subdomain.length <= 63 &&
    subdomainRegex.test(subdomain)
  );
};

const isValidPassword = (password) => {
  // Minimum 8 characters, at least one letter, one number
  return password.length >= 8;
};

const isValidRole = (role) => {
  const validRoles = ["super_admin", "tenant_admin", "user"];
  return validRoles.includes(role);
};

const isValidStatus = (status, type = "tenant") => {
  const statusMap = {
    tenant: ["active", "suspended", "trial"],
    project: ["active", "archived", "completed"],
    task: ["todo", "in_progress", "completed"],
  };
  return statusMap[type] && statusMap[type].includes(status);
};

const isValidPriority = (priority) => {
  const validPriorities = ["low", "medium", "high"];
  return validPriorities.includes(priority);
};

const isValidPlan = (plan) => {
  const validPlans = ["free", "pro", "enterprise"];
  return validPlans.includes(plan);
};

module.exports = {
  isValidEmail,
  isValidSubdomain,
  isValidPassword,
  isValidRole,
  isValidStatus,
  isValidPriority,
  isValidPlan,
};
