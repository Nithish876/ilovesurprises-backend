import { Router } from 'express';
import { adminController } from './admin.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import {
  updateUserSchema,
  updateUserRoleSchema,
  listUsersSchema,
} from './admin.validation';
import { UserRole } from '@prisma/client';

export const adminRouter = Router();

// Protect all admin routes with authentication and ADMIN role check
adminRouter.use(authenticate, requireRole(UserRole.ADMIN));

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: List and search users
 *     description: Retrieve a paginated list of users with optional filtering by search keyword and role. Requires ADMIN role.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Items per page (max 100)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by email, firstName, or lastName
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [CUSTOMER, AFFILIATE, STAFF, ADMIN]
 *         description: Filter by user role
 *     responses:
 *       200:
 *         description: Paginated users list.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 45
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden - Insufficient permissions (Requires ADMIN role).
 */
adminRouter.get('/users', validateRequest(listUsersSchema), (req, res, next) => {
  adminController.listUsers(req, res, next);
});

/**
 * @openapi
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve detailed user account information by ID. Requires ADMIN role.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (Requires ADMIN role).
 *       404:
 *         description: User not found.
 */
adminRouter.get('/users/:id', (req, res, next) => {
  adminController.getUserById(req, res, next);
});

/**
 * @openapi
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Update user details
 *     description: Update user profile attributes and active/suspended status. Requires ADMIN role.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Alexander
 *               lastName:
 *                 type: string
 *                 example: Bell
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (Requires ADMIN role).
 *       404:
 *         description: User not found.
 */
adminRouter.patch('/users/:id', validateRequest(updateUserSchema), (req, res, next) => {
  adminController.updateUser(req, res, next);
});

/**
 * @openapi
 * /api/admin/users/{id}/role:
 *   patch:
 *     summary: Update user role
 *     description: Change user role to CUSTOMER, AFFILIATE, STAFF, or ADMIN. Requires ADMIN role.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [CUSTOMER, AFFILIATE, STAFF, ADMIN]
 *                 example: STAFF
 *     responses:
 *       200:
 *         description: User role updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User role updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid role specified.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (Requires ADMIN role).
 *       404:
 *         description: User not found.
 */
adminRouter.patch(
  '/users/:id/role',
  validateRequest(updateUserRoleSchema),
  (req, res, next) => {
    adminController.updateUserRole(req, res, next);
  }
);
