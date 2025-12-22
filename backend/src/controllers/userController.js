// User Controller
// Handles: add user, list users, get user, update user, delete user

const userModel = require("../models/userModel");
const { hashPassword } = require("../services/hashService");
const { checkUserLimit } = require("../services/subscriptionService");
const { logAction } = require("../services/auditService");
const {
  buildSuccessResponse,
  buildErrorResponse,
} = require("../utils/helpers");
const { AUDIT_ACTIONS } = require("../utils/constants");

const createUser = async (req, res, next) => {
  try {
    const { tenantId } = req.user;
    const { email, password, fullName, role } = req.body;

    // Check subscription limit
    const limitCheck = await checkUserLimit(tenantId);
    if (!limitCheck.allowed) {
      return res
        .status(403)
        .json(
          buildErrorResponse(
            `User limit reached. Current: ${limitCheck.current}, Limit: ${limitCheck.limit}`
          )
        );
    }

    // Check if user already exists
    const existingUser = await userModel.findByEmail(email, tenantId);
    if (existingUser) {
      return res
        .status(409)
        .json(buildErrorResponse("User with this email already exists"));
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await userModel.create({
      tenant_id: tenantId,
      email,
      password_hash: passwordHash,
      full_name: fullName,
      role: role || "user",
    });

    // Log action
    await logAction({
      tenantId,
      userId: req.user.userId,
      action: AUDIT_ACTIONS.CREATE,
      entityType: "user",
      entityId: user.id,
      ipAddress: req.ip,
    });

    return res.status(201).json(
      buildSuccessResponse(
        {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
        "User created successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

const getUsersByTenant = async (req, res, next) => {
  try {
    const { tenantId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || null;
    const role = req.query.role || null;

    const users = await userModel.findByTenant(
      tenantId,
      page,
      limit,
      search,
      role
    );

    return res.status(200).json(buildSuccessResponse(users));
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { tenantId } = req.user;
    const { id } = req.params;
    const { fullName, role, password } = req.body;

    const updates = {};
    if (fullName) updates.full_name = fullName;
    if (role) updates.role = role;
    if (password) {
      updates.password_hash = await hashPassword(password);
    }

    const updatedUser = await userModel.update(id, tenantId, updates);
    if (!updatedUser) {
      return res.status(404).json(buildErrorResponse("User not found"));
    }

    // Log action
    await logAction({
      tenantId,
      userId: req.user.userId,
      action: AUDIT_ACTIONS.UPDATE,
      entityType: "user",
      entityId: id,
      ipAddress: req.ip,
    });

    return res.status(200).json(
      buildSuccessResponse(
        {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.full_name,
          role: updatedUser.role,
        },
        "User updated successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { tenantId, userId: currentUserId } = req.user;
    const { id } = req.params;

    // Prevent self-deletion
    if (id === currentUserId) {
      return res
        .status(400)
        .json(buildErrorResponse("Cannot delete your own account"));
    }

    const deleted = await userModel.deleteById(id, tenantId);
    if (!deleted) {
      return res.status(404).json(buildErrorResponse("User not found"));
    }

    // Log action
    await logAction({
      tenantId,
      userId: currentUserId,
      action: AUDIT_ACTIONS.DELETE,
      entityType: "user",
      entityId: id,
      ipAddress: req.ip,
    });

    return res
      .status(200)
      .json(buildSuccessResponse(null, "User deleted successfully"));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUsersByTenant,
  updateUser,
  deleteUser,
};
