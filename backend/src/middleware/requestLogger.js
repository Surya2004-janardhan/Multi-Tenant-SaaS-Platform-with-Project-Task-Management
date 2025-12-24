// API Request Logger Middleware
// Logs all incoming API requests with details

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  console.log(
    "\n╔════════════════════════════════════════════════════════════"
  );
  console.log(`║ 📨 INCOMING REQUEST`);
  console.log(`║ Time: ${new Date().toISOString()}`);
  console.log(`║ Method: ${req.method}`);
  console.log(`║ URL: ${req.originalUrl}`);
  console.log(`║ IP: ${req.ip || req.connection.remoteAddress}`);

  // Log tenant if present
  if (req.headers["x-tenant-subdomain"]) {
    console.log(`║ Tenant: ${req.headers["x-tenant-subdomain"]}`);
  }

  // Log auth status
  if (req.headers.authorization) {
    console.log(`║ Auth: Bearer Token Present`);
  }

  // Log request body for POST/PUT/PATCH (excluding sensitive data)
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
    const sanitizedBody = { ...req.body };

    // Remove sensitive fields from logging
    if (sanitizedBody.password) sanitizedBody.password = "[REDACTED]";
    if (sanitizedBody.password_hash) sanitizedBody.password_hash = "[REDACTED]";
    if (sanitizedBody.adminPassword) sanitizedBody.adminPassword = "[REDACTED]";

    console.log(`║ Body: ${JSON.stringify(sanitizedBody)}`);
  }

  // Log query params if present
  if (Object.keys(req.query).length > 0) {
    console.log(`║ Query: ${JSON.stringify(req.query)}`);
  }

  console.log("╚════════════════════════════════════════════════════════════");

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;

    console.log(
      "\n╔════════════════════════════════════════════════════════════"
    );
    console.log(`║ 📤 RESPONSE`);
    console.log(`║ Method: ${req.method} ${req.originalUrl}`);
    console.log(`║ Status: ${res.statusCode}`);
    console.log(`║ Duration: ${duration}ms`);

    // Log response preview for errors
    if (res.statusCode >= 400) {
      try {
        const responseData = JSON.parse(data);
        console.log(`║ Error: ${responseData.message || "Unknown error"}`);
      } catch (e) {
        // Not JSON, skip
      }
    }

    console.log(
      "╚════════════════════════════════════════════════════════════\n"
    );

    originalSend.apply(res, arguments);
  };

  next();
};

module.exports = requestLogger;
