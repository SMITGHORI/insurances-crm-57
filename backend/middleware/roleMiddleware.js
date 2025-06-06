
const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. No user role found.'
        });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Role verification failed'
      });
    }
  };
};

module.exports = roleMiddleware;
