// Authentication Controller
// Handles: register-tenant, login, get current user, logout

const tenantModel = require('../models/tenantModel');
const userModel = require('../models/userModel');
const { hashPassword, comparePassword } = require('../services/hashService');
const { generateToken } = require('../services/tokenService');
const { logAction } = require('../services/auditService');
const { buildSuccessResponse, buildErrorResponse } = require('../utils/helpers');
const { USER_ROLES, TENANT_STATUS, SUBSCRIPTION_PLANS, AUDIT_ACTIONS } = require('../utils/constants');

const registerTenant = async (req, res, next) => {
  try {
    const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;

    // Check if subdomain already exists
    const existingTenant = await tenantModel.findBySubdomain(subdomain);
    if (existingTenant) {
      return res.status(409).json(
        buildErrorResponse('Subdomain already taken')
      );
    }

    // Create tenant
    const tenant = await tenantModel.create({
      name: tenantName,
      subdomain,
      status: TENANT_STATUS.ACTIVE,
      subscription_plan: SUBSCRIPTION_PLANS.FREE,
    });

    // Hash password
    const passwordHash = await hashPassword(adminPassword);

    // Create admin user
    const adminUser = await userModel.create({
      tenant_id: tenant.id,
      email: adminEmail,
      password_hash: passwordHash,
      full_name: adminFullName,
      role: USER_ROLES.TENANT_ADMIN,
    });

    // Log action
    await logAction({
      tenantId: tenant.id,
      userId: adminUser.id,
      action: AUDIT_ACTIONS.CREATE,
      entityType: 'tenant',
      entityId: tenant.id,
      ipAddress: req.ip,
    });

    // Generate token
    const token = generateToken({
      userId: adminUser.id,
      tenantId: tenant.id,
      role: adminUser.role,
    });

    return res.status(201).json(
      buildSuccessResponse({
        tenant: {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
        },
        user: {
          id: adminUser.id,
          email: adminUser.email,
          fullName: adminUser.full_name,
          role: adminUser.role,
        },
        token,
      }, 'Tenant registered successfully')
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password, tenantSubdomain } = req.body;

    // Find tenant
    const tenant = await tenantModel.findBySubdomain(tenantSubdomain);
    if (!tenant) {
      return res.status(401).json(
        buildErrorResponse('Invalid credentials')
      );
    }

    if (tenant.status !== TENANT_STATUS.ACTIVE) {
      return res.status(403).json(
        buildErrorResponse('Tenant account is not active')
      );
    }

    // Find user with password
    const user = await userModel.findByEmailWithPassword(email, tenant.id);
    if (!user) {
      return res.status(401).json(
        buildErrorResponse('Invalid credentials')
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json(
        buildErrorResponse('Invalid credentials')
      );
    }

    // Log action
    await logAction({
      tenantId: tenant.id,
      userId: user.id,
      action: AUDIT_ACTIONS.LOGIN,
      entityType: 'user',
      entityId: user.id,
      ipAddress: req.ip,
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      tenantId: tenant.id,
      role: user.role,
    });

    return res.status(200).json(
      buildSuccessResponse({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: tenant.id,
        },
        token,
      }, 'Login successful')
    );
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const { userId, tenantId } = req.user;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json(
        buildErrorResponse('User not found')
      );
    }

    return res.status(200).json(
      buildSuccessResponse({
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId: user.tenant_id,
      })
    );
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { userId, tenantId } = req.user;

    // Log action
    await logAction({
      tenantId,
      userId,
      action: AUDIT_ACTIONS.LOGOUT,
      entityType: 'user',
      entityId: userId,
      ipAddress: req.ip,
    });

    return res.status(200).json(
      buildSuccessResponse(null, 'Logout successful')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerTenant,
  login,
  getProfile,
  logout,
};
