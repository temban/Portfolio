/**
 * @swagger
 * /create_project:
 *   post:
 *     summary: Create a new project with images and developers.
 *     tags: [Projects]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               url:
 *                 type: string
 *               technologies:
 *                 type: string
 *               disabled:
 *                 type: boolean
 *               developer_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Project created successfully.
 *       500:
 *         description: Error creating project.
 */

/**
 * @swagger
 * /get_all_projects:
 *   get:
 *     summary: Retrieve all projects with their images.
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: A list of all projects with their images.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   url:
 *                     type: string
 *                   technologies:
 *                     type: string
 *                   disabled:
 *                     type: boolean
 *                   image1Url:
 *                     type: string
 *                   image2Url:
 *                     type: string
 *                   image3Url:
 *                     type: string
 *                   image4Url:
 *                     type: string
 *       404:
 *         description: No projects found.
 *       500:
 *         description: Error retrieving projects.
 */

/**
 * @swagger
 * /project/{id}:
 *   get:
 *     summary: Get a specific project by ID along with contributing developers.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the project
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project details with contributing developers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 url:
 *                   type: string
 *                 technologies:
 *                   type: string
 *                 disabled:
 *                   type: boolean
 *                 image1Url:
 *                   type: string
 *                 image2Url:
 *                   type: string
 *                 image3Url:
 *                   type: string
 *                 image4Url:
 *                   type: string
 *                 developers:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       imageUrl:
 *                         type: string
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Error retrieving project.
 */

/**
 * @swagger
 * /update_project/{id}:
 *   put:
 *     summary: Update a specific project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the project
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               url:
 *                 type: string
 *               technologies:
 *                 type: string
 *               disabled:
 *                 type: boolean
 *               developer_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Project updated successfully.
 *       404:
 *         description: Project not found for update.
 *       500:
 *         description: Error updating project.
 */

/**
 * @swagger
 * /delete_project/{id}:
 *   delete:
 *     summary: Delete a specific project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the project
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project deleted successfully.
 *       404:
 *         description: Project not found for deletion.
 *       500:
 *         description: Error deleting project.
 */

/**
 * @swagger
 * /project/{id}/toggle_disabled:
 *   put:
 *     summary: Toggle the disabled status of a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the project
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Project disabled/enabled successfully.
 *       404:
 *         description: Project not found.
 *       500:
 *         description: Error toggling project disabled status.
 */
