import express from 'express';
import multer from 'multer';
import path from 'path';
import pool from '../db.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs'; // Import fs module

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if the ProjectImages directory exists, if not, create it
const projectImagesDir = path.join(__dirname, '..', 'documents', 'ProjectImages');

if (!fs.existsSync(projectImagesDir)) {
  fs.mkdirSync(projectImagesDir);
}

const router = express.Router();

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, projectImagesDir); // Use ProjectImages directory for file storage
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the filename
  }
});
const upload = multer({ storage });

// CREATE: Add a new project
router.post('/create_project', upload.array('images', 4), async (req, res) => {
  const { name, description, url, technologies, disabled, developer_ids } = req.body; // Expecting technologies and an array of developer IDs
  const images = req.files.map(file => file.filename); // Get filenames of uploaded images

  try {
    // Ensure developer_ids is parsed as an array
    let developerIdsArray = developer_ids;

    // If developer_ids is a string, convert it to an array
    if (typeof developer_ids === 'string') {
      developerIdsArray = JSON.parse(developer_ids);
    }

    // Insert into projects table, including technologies
    const newProject = await pool.query(
      `INSERT INTO projects (title, description, url, technologies, disabled, image1, image2, image3, image4) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        name, 
        description, 
        url,
        technologies,   // Added technologies field
        disabled || false, 
        images[0] || null, 
        images[1] || null, 
        images[2] || null, 
        images[3] || null
      ]
    );

    const projectId = newProject.rows[0].id;

    // Insert into project_developers table for each developer_id
    if (developerIdsArray && developerIdsArray.length > 0) {
      const insertPromises = developerIdsArray.map(developer_id =>
        pool.query(
          `INSERT INTO project_developers (project_id, developer_id) 
           VALUES ($1, $2)`,
          [projectId, developer_id]
        )
      );

      // Await all insertions to complete
      await Promise.all(insertPromises);
    }

    res.status(201).json(newProject.rows[0]); // Return the newly created project
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
});


router.get('/get_all_projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects');

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No projects found' });
    }

    // Map through projects and create image URLs
    const projectsWithImages = result.rows.map(project => {
      const imageUrls = {
        image1Url: project.image1 ? `${req.protocol}://${req.get('host')}/documents/ProjectImages/${project.image1}` : null,
        image2Url: project.image2 ? `${req.protocol}://${req.get('host')}/documents/ProjectImages/${project.image2}` : null,
        image3Url: project.image3 ? `${req.protocol}://${req.get('host')}/documents/ProjectImages/${project.image3}` : null,
        image4Url: project.image4 ? `${req.protocol}://${req.get('host')}/documents/ProjectImages/${project.image4}` : null,
      };

      // Combine project data with the image URLs
      return { ...project, ...imageUrls };
    });

    res.status(200).json(projectsWithImages); // Return all projects with their image URLs
  } catch (error) {
    console.error('Error retrieving projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get a specific project by ID along with contributing developers
router.get('/project/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Query to get the project details
    const projectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const project = projectResult.rows[0];

    // Generate URLs for the project images
    const imageUrls = {
      image1Url: project.image1 ? `${req.protocol}://${req.get('host')}/documents/ProjectImages/${project.image1}` : null,
      image2Url: project.image2 ? `${req.protocol}://${req.get('host')}/documents/ProjectImages/${project.image2}` : null,
      image3Url: project.image3 ? `${req.protocol}://${req.get('host')}/documents/ProjectImages/${project.image3}` : null,
      image4Url: project.image4 ? `${req.protocol}://${req.get('host')}/documents/ProjectImages/${project.image4}` : null,
    };

    // Query to get the developers who contributed to the project
    const developersResult = await pool.query(`
      SELECT d.id, d.name, d.email, d.role, d.image 
      FROM developers d
      JOIN project_developers pd ON pd.developer_id = d.id
      WHERE pd.project_id = $1
    `, [id]);

    // Map through developers and create image URLs for each developer
    const developersWithImages = developersResult.rows.map(developer => {
      const imageUrl = developer.image ? `${req.protocol}://${req.get('host')}/documents/DeveloperImages/${developer.image}` : null;
      return {
        id: developer.id,
        name: developer.name,
        email: developer.email,
        role: developer.role,
        imageUrl
      };
    });

    // Combine the project data with the image URLs and the contributing developers
    const projectWithDevelopers = { 
      ...project, 
      ...imageUrls, 
      developers: developersWithImages  // Include developers who contributed
    };

    res.status(200).json(projectWithDevelopers); // Return the project with developers
  } catch (error) {
    console.error('Error retrieving project:', error);
    res.status(500).json({ error: error.message });
  }
});


// UPDATE: Update a specific project entry by ID
router.put('/update_project/:id', upload.array('images', 4), async (req, res) => {
  const { id } = req.params;
  const { name, description, url, technologies, disabled, developer_ids } = req.body;
  const images = req.files.map(file => file.filename); // Get filenames of uploaded images

  try {
    // Fetch the current project data
    const currentProjectResult = await pool.query('SELECT * FROM projects WHERE id = $1', [id]);

    if (currentProjectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const currentProject = currentProjectResult.rows[0];

    // Only update fields that were provided, keep the rest unchanged
    const updatedProject = {
      name: name || currentProject.title,
      description: description || currentProject.description,
      url: url || currentProject.url,
      technologies: technologies || currentProject.technologies,
      disabled: disabled !== undefined ? disabled : currentProject.disabled,
      image1: images[0] || currentProject.image1,
      image2: images[1] || currentProject.image2,
      image3: images[2] || currentProject.image3,
      image4: images[3] || currentProject.image4,
    };

    // Update the project in the database
    const updateQuery = `
      UPDATE projects 
      SET title = $1, description = $2, url = $3, technologies = $4, disabled = $5, image1 = $6, image2 = $7, image3 = $8, image4 = $9 
      WHERE id = $10 RETURNING *
    `;
    const updatedProjectResult = await pool.query(updateQuery, [
      updatedProject.name,
      updatedProject.description,
      updatedProject.url,
      updatedProject.technologies,
      updatedProject.disabled,
      updatedProject.image1,
      updatedProject.image2,
      updatedProject.image3,
      updatedProject.image4,
      id
    ]);

    // Handle developers update if developer_ids are provided
    if (developer_ids) {
      // If developer_ids is a string (from form-data), convert it to an array
      let developerIdsArray = developer_ids;
      if (typeof developer_ids === 'string') {
        developerIdsArray = JSON.parse(developer_ids);
      }

      // First, delete the existing developers for this project
      await pool.query('DELETE FROM project_developers WHERE project_id = $1', [id]);

      // Insert the new set of developer IDs
      if (developerIdsArray && developerIdsArray.length > 0) {
        const insertPromises = developerIdsArray.map(developer_id =>
          pool.query('INSERT INTO project_developers (project_id, developer_id) VALUES ($1, $2)', [id, developer_id])
        );
        await Promise.all(insertPromises);
      }
    }

    res.status(200).json(updatedProjectResult.rows[0]); // Return the updated project
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Delete a specific project entry by ID
router.delete('/delete_project/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found for deletion' });
    }

    res.status(200).json({ message: 'Project deleted successfully' }); // Confirm deletion
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
});

// TOGGLE DISABLED STATUS: Enable/Disable project
router.put('/project/:id/toggle_disabled', async (req, res) => {
  const { id } = req.params;

  try {
    // Get the current disabled status
    const result = await pool.query('SELECT disabled FROM projects WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const currentDisabledStatus = result.rows[0].disabled;
    const newDisabledStatus = !currentDisabledStatus; // Toggle the status

    // Update the project's disabled status
    await pool.query(
      'UPDATE projects SET disabled = $1 WHERE id = $2',
      [newDisabledStatus, id]
    );

    res.status(200).json({
      message: `Project ${newDisabledStatus ? 'disabled' : 'enabled'} successfully`,
      disabled: newDisabledStatus
    });
  } catch (error) {
    console.error('Error toggling project disabled status:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
