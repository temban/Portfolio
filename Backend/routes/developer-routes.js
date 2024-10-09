import fs from 'fs';
import pool from '../db.js'; // Adjust the path based on your structure
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer'; // Ensure multer is imported
import express from 'express';

const router = express.Router();

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'documents', 'DeveloperImages');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// CREATE: Add a new developer
router.post('/create_developer', async (req, res) => {
  const { name, email, bio, linkedin, github, role, disabled, admin } = req.body;

  try {
    const newDeveloper = await pool.query(
      `INSERT INTO developers (name, email, bio, linkedin, github, role, disabled, admin, image) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, email, bio, linkedin, github, role, disabled || false, admin || false, req.file?.filename || null]
    );
    res.status(201).json(newDeveloper.rows[0]); // Return the newly created developer
  } catch (error) {
    console.error('Error creating developer:', error);
    res.status(500).json({ error: error.message });
  }
});

// READ: Get all developers
router.get('/get_all_developers', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM developers');
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No developers found' });
      }
  
      // Map through developers and create image URLs
      const developersWithImages = result.rows.map(developer => {
        const imageUrl = developer.image ? `${req.protocol}://${req.get('host')}/documents/DeveloperImages/${developer.image}` : null;
        return { ...developer, imageUrl }; // Add imageUrl to each developer object
      });
  
      res.status(200).json(developersWithImages); // Return all developers with their image URLs
    } catch (error) {
      console.error('Error retrieving developers:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Route to get a specific developer by ID
  router.get('/developer/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query('SELECT * FROM developers WHERE id = $1', [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Developer not found' });
      }
  
      const developer = result.rows[0];
      const imageUrl = developer.image ? `${req.protocol}://${req.get('host')}/documents/DeveloperImages/${developer.image}` : null;
      
      // Return the specific developer with their image URL
      res.status(200).json({ ...developer, imageUrl }); 
    } catch (error) {
      console.error('Error retrieving developer:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
// UPDATE: Update a specific developer entry by ID
router.put('/update_developer/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, bio, linkedin, github, role, disabled, admin } = req.body;

  // Start building the update query
  let query = 'UPDATE developers SET ';
  const values = [];
  let setFields = [];

  // Only add fields to update if they are provided
  if (name) {
    setFields.push(`name = $${values.length + 1}`);
    values.push(name);
  }

  if (email) {
    setFields.push(`email = $${values.length + 1}`);
    values.push(email);
  }

  if (bio) {
    setFields.push(`bio = $${values.length + 1}`);
    values.push(bio);
  }

  if (linkedin) {
    setFields.push(`linkedin = $${values.length + 1}`);
    values.push(linkedin);
  }

  if (github) {
    setFields.push(`github = $${values.length + 1}`);
    values.push(github);
  }

  if (role) {
    setFields.push(`role = $${values.length + 1}`);
    values.push(role);
  }

  if (typeof disabled === 'boolean') {
    setFields.push(`disabled = $${values.length + 1}`);
    values.push(disabled);
  }

  if (typeof admin === 'boolean') {
    setFields.push(`admin = $${values.length + 1}`);
    values.push(admin);
  }

  if (setFields.length === 0) {
    return res.status(400).json({ message: 'No fields to update' });
  }

  query += setFields.join(', ');
  query += ' WHERE id = $' + (values.length + 1);
  values.push(id); // Add the id for the WHERE clause

  try {
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Developer not found for update' });
    }

    res.status(200).json({ message: 'Developer updated successfully' }); // Return success message
  } catch (error) {
    console.error('Error updating developer:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE: Delete a specific developer entry by ID
router.delete('/delete_developer/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM developers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Developer not found for deletion' });
    }

    res.status(200).json({ message: 'Developer deleted successfully' }); // Confirm deletion
  } catch (error) {
    console.error('Error deleting developer:', error);
    res.status(500).json({ error: error.message });
  }
});

// TOGGLE DISABLED STATUS: Enable/Disable developer
router.put('/developer/:id/toggle_disabled', async (req, res) => {
  const { id } = req.params;

  try {
    // Get the current disabled status
    const result = await pool.query('SELECT disabled FROM developers WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Developer not found' });
    }

    const currentDisabledStatus = result.rows[0].disabled;
    const newDisabledStatus = !currentDisabledStatus; // Toggle the status

    // Update the developer's disabled status
    await pool.query(
      'UPDATE developers SET disabled = $1 WHERE id = $2',
      [newDisabledStatus, id]
    );

    res.status(200).json({
      message: `Developer ${newDisabledStatus ? 'disabled' : 'enabled'} successfully`,
      disabled: newDisabledStatus
    });
  } catch (error) {
    console.error('Error toggling developer disabled status:', error);
    res.status(500).json({ error: error.message });
  }
});

//set or unset admin
// Toggle admin status for a developer
router.put('/developer/:id/toggle_admin', async (req, res) => {
    const { id } = req.params;
  
    try {
      // Get the current admin status
      const result = await pool.query('SELECT admin FROM developers WHERE id = $1', [id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Developer not found' });
      }
  
      const currentAdminStatus = result.rows[0].admin;
      const newAdminStatus = !currentAdminStatus; // Toggle the status
  
      // Update the developer's admin status
      await pool.query(
        'UPDATE developers SET admin = $1 WHERE id = $2',
        [newAdminStatus, id]
      );
  
      res.status(200).json({
        message: `Developer's admin status ${newAdminStatus ? 'granted' : 'revoked'} successfully`,
        admin: newAdminStatus
      });
    } catch (error) {
      console.error('Error toggling developer admin status:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  
  // Route to update developer profile picture
  router.put('/update_developer/:id/profile-picture', upload.single('profilePicture'), async (req, res) => {
    const { id } = req.params;
  
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
  
      const developer = await pool.query('SELECT * FROM developers WHERE id = $1', [id]);
  
      if (developer.rows.length === 0) {
        return res.status(404).json({ message: 'Developer not found' });
      }
  
      const isDisabled = developer.rows[0].disabled;
      if (isDisabled) {
        return res.status(403).json({ message: 'Cannot modify a disabled developer' });
      }
  
      const profileImagePath = req.file.filename; // Get the filename of the uploaded image
  
      // Update the developer's profile image in the database
      await pool.query('UPDATE developers SET image = $1 WHERE id = $2', [profileImagePath, id]);
  
      res.status(200).json({ message: 'Developer\'s profile picture updated successfully', profileImagePath });
    } catch (error) {
        console.error('Error updating developer\'s profile picture:', error);
        res.status(500).json({ message: 'Error updating developer\'s profile picture', error: error.message });
      }
      
  });

  
  // Route to delete developer profile picture
  router.delete('/delete_profile_picture/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      // Set the profile image to null in the database
      await pool.query('UPDATE developers SET image = NULL WHERE id = $1', [id]);
  
      res.json({ message: 'Profile picture deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Route to display developer profile picture
  router.get('/profile_picture/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      // Retrieve the developer's profile image path from the database
      const developer = await pool.query('SELECT image FROM developers WHERE id = $1', [id]);
  
      if (developer.rows.length === 0) {
        return res.status(404).json({ error: 'Developer not found' });
      }
  
      const profileImage = developer.rows[0].image;
  
      if (!profileImage) {
        return res.status(404).json({ error: 'Profile image not found' });
      }
  
      // Send the profile image URL
      const imageUrl = `${req.protocol}://${req.get('host')}/documents/DeveloperImages/${profileImage}`;
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

export default router;
