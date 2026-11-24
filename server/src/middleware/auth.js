import jwt from 'jsonwebtoken';

export function authenticate(kind = 'user') {
  return (req, res, next) => {
    const token = req.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Login required' });
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.kind !== kind) return res.status(403).json({ error: 'Access denied' });
      req.auth = payload;
      next();
    } catch {
      return res.status(401).json({ error: 'Session expired or invalid' });
    }
  };
}

export function adminRoles(...roles) {
  return (req, res, next) => roles.includes(req.auth?.role)
    ? next() : res.status(403).json({ error: 'Insufficient admin role' });
}
