// middlewares/role.js

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.client.role)) {
        return res.status(403).json({ message: 'Accès interdit : rôle insuffisant' });
      }
      next();
    };
  };
  