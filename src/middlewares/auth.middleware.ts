import { Request, Response, NextFunction } from 'express';
import { rolesHierarchy } from '../models/user.model';
import { UnauthorizedError } from '../utils/errors';

export const permit = (...allowedPermissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role as keyof typeof rolesHierarchy | undefined;

    if (!userRole) {
      res.status(401).json({ sucess: false, message: 'Unauthorized, you are not authorized to perform this action!' });
      return;
    }
    const userPermissions = rolesHierarchy[userRole];
    const hasPermission = allowedPermissions.some(permission => userPermissions.includes(permission));

    if (!hasPermission) {
      res.status(403).json({ message: 'Forbidden, you do not have the permission to perform this action!' });
      return;
    }

    next();
  };
};

export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const userRole = req.user?.role as keyof typeof rolesHierarchy;

  if (userRole === 'admin') {
    next();
  } else {
    return next(new UnauthorizedError('Unauthorized, you do not have permission to perform this action'));
  }
};

export const requiredRoles = (roles: (keyof typeof rolesHierarchy)[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role as keyof typeof rolesHierarchy | undefined;

    if (!userRole || !roles.includes(userRole)) {
      return next(new UnauthorizedError('Unauthorized, you do not have permission to perform this action'));
    }

    next();
  };
};
