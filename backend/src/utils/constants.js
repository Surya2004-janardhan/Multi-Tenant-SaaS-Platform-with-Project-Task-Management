// Constants
// Application-wide constants

const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  TENANT_ADMIN: "tenant_admin",
  USER: "user",
};

const TENANT_STATUS = {
  ACTIVE: "active",
  SUSPENDED: "suspended",
  TRIAL: "trial",
};

const SUBSCRIPTION_PLANS = {
  FREE: "free",
  PRO: "pro",
  ENTERPRISE: "enterprise",
};

const PLAN_LIMITS = {
  free: {
    max_users: 5,
    max_projects: 3,
  },
  pro: {
    max_users: 25,
    max_projects: 15,
  },
  enterprise: {
    max_users: 100,
    max_projects: 50,
  },
};

const PROJECT_STATUS = {
  ACTIVE: "active",
  ARCHIVED: "archived",
  COMPLETED: "completed",
};

const TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};

const AUDIT_ACTIONS = {
  LOGIN: "LOGIN",
  LOGOUT: "LOGOUT",
  REGISTER_TENANT: "REGISTER_TENANT",
  CREATE_USER: "CREATE_USER",
  UPDATE_USER: "UPDATE_USER",
  DELETE_USER: "DELETE_USER",
  CREATE_PROJECT: "CREATE_PROJECT",
  UPDATE_PROJECT: "UPDATE_PROJECT",
  DELETE_PROJECT: "DELETE_PROJECT",
  CREATE_TASK: "CREATE_TASK",
  UPDATE_TASK: "UPDATE_TASK",
  DELETE_TASK: "DELETE_TASK",
  UPDATE_TENANT: "UPDATE_TENANT",
};

module.exports = {
  USER_ROLES,
  TENANT_STATUS,
  SUBSCRIPTION_PLANS,
  PLAN_LIMITS,
  PROJECT_STATUS,
  TASK_STATUS,
  TASK_PRIORITY,
  AUDIT_ACTIONS,
};
