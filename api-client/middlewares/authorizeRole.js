// middlewares/authorizeRole.js
module.exports = function authorizeRole(...allowedRoles) {
    return (req, res, next) => {
      const userRole = req.user?.role;
  
      if (!userRole) {
        return res.status(403).json({ message: "Accès refusé : rôle non fourni" });
      }
  
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: "Accès refusé : rôle non autorisé" });
      }
  
      next();
    };
  };
  