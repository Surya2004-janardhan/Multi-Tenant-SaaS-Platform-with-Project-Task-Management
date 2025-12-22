// JWT configuration
// Token generation and verification settings

require('dotenv').config();

const jwtConfig = {
  secret: process.env.JWT_SECRET || 'multi_tenant_saas_jwt_secret_key_2024_development_only',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  algorithm: 'HS256',
};

module.exports = jwtConfig;
