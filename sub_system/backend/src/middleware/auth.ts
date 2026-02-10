import { Request, Response, NextFunction } from 'express'
import { verifyToken, DecodedToken } from '../utils/jwt'

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken
    }
  }
}

/**
 * Authentication middleware - Verifies JWT token and adds user to request
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'unauthorized', message: 'No token provided' })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // Verify token
    const decoded = verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({ error: 'unauthorized', message: 'Invalid or expired token' })
    }

    // Attach user data to request
    req.user = decoded
    
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(401).json({ error: 'unauthorized', message: 'Authentication failed' })
  }
}

/**
 * Optional authentication - Adds user to request if token is valid, but doesn't reject if missing
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = verifyToken(token)
      
      if (decoded) {
        req.user = decoded
      }
    }
    
    next()
  } catch (error) {
    // Silently continue without authentication
    next()
  }
}
