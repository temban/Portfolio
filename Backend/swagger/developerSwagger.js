/**
 * @swagger
 * /create_developer:
 *   post:
 *     summary: Create a new developer
 *     tags: [Developers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               bio:
 *                 type: string
 *               linkedin:
 *                 type: string
 *               github:
 *                 type: string
 *               role:
 *                 type: string
 *               disabled:
 *                 type: boolean
 *               admin:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Developer created successfully
 *       500:
 *         description: Error creating developer
 */

/**
 * @swagger
 * /get_all_developers:
 *   get:
 *     summary: Get all developers
 *     tags: [Developers]
 *     responses:
 *       200:
 *         description: List of developers
 *       404:
 *         description: No developers found
 *       500:
 *         description: Error retrieving developers
 */

/**
 * @swagger
 * /developer/{id}:
 *   get:
 *     summary: Get a specific developer by ID
 *     tags: [Developers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the developer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Developer details
 *       404:
 *         description: Developer not found
 *       500:
 *         description: Error retrieving developer
 */

/**
 * @swagger
 * /update_developer/{id}:
 *   put:
 *     summary: Update a specific developer by ID
 *     tags: [Developers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the developer
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               bio:
 *                 type: string
 *               linkedin:
 *                 type: string
 *               github:
 *                 type: string
 *               role:
 *                 type: string
 *               disabled:
 *                 type: boolean
 *               admin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Developer updated successfully
 *       404:
 *         description: Developer not found
 *       500:
 *         description: Error updating developer
 */

/**
 * @swagger
 * /delete_developer/{id}:
 *   delete:
 *     summary: Delete a specific developer by ID
 *     tags: [Developers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the developer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Developer deleted successfully
 *       404:
 *         description: Developer not found
 *       500:
 *         description: Error deleting developer
 */

/**
 * @swagger
 * /developer/{id}/toggle_disabled:
 *   put:
 *     summary: Toggle the disabled status of a developer by ID
 *     tags: [Developers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the developer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Developer disabled/enabled successfully
 *       404:
 *         description: Developer not found
 *       500:
 *         description: Error toggling developer disabled status
 */

/**
 * @swagger
 * /developer/{id}/toggle_admin:
 *   put:
 *     summary: Toggle the admin status of a developer by ID
 *     tags: [Developers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the developer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Developer admin status updated successfully
 *       404:
 *         description: Developer not found
 *       500:
 *         description: Error toggling developer admin status
 */

/**
 * @swagger
 * /update_developer/{id}/profile-picture:
 *   put:
 *     summary: Update developer's profile picture
 *     tags: [Developers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the developer
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Developer's profile picture updated successfully
 *       403:
 *         description: Cannot modify a disabled developer
 *       404:
 *         description: Developer not found
 *       500:
 *         description: Error updating profile picture
 */

/**
 * @swagger
 * /delete_profile_picture/{id}:
 *   delete:
 *     summary: Delete developer's profile picture by ID
 *     tags: [Developers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the developer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile picture deleted successfully
 *       404:
 *         description: Developer not found
 *       500:
 *         description: Error deleting profile picture
 */

/**
 * @swagger
 * /profile_picture/{id}:
 *   get:
 *     summary: Get the developer's profile picture by ID
 *     tags: [Developers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the developer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Developer's profile picture URL
 *       404:
 *         description: Developer or profile image not found
 *       500:
 *         description: Error retrieving profile picture
 */
