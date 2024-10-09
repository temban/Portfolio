// utils/database.js

import pkg from 'pg';
const { Client } = pkg;

// PostgreSQL connection string to connect to the default database
const defaultConnectionString = process.env.DATABASE_URL || 'postgresql://postgres:allpha01@localhost'; 
// Connection string for the new database (potfolio)
const databaseName = 'potfolio';
const newConnectionString = process.env.DATABASE_URL || `postgresql://postgres:allpha01@localhost/${databaseName}`;

// SQL Query to create the new database
const createDatabaseQuery = `CREATE DATABASE ${databaseName}`;

// SQL Queries to create tables
const createTables = `
-- Create Developers Table
CREATE TABLE IF NOT EXISTS developers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    bio TEXT,
    linkedin VARCHAR(255),
    github VARCHAR(255),
    role VARCHAR(100),
    disabled BOOLEAN DEFAULT false,  -- Field to indicate if the developer is disabled
    admin BOOLEAN DEFAULT false,       -- Field to indicate if the developer is an admin
    image VARCHAR(255)                 -- Field for the profile image
);

-- Create Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    url VARCHAR(255),
    technologies VARCHAR(255),         -- To store technologies used in the project
    image1 VARCHAR(255),               -- First image link
    image2 VARCHAR(255),               -- Second image link
    image3 VARCHAR(255),               -- Third image link
    image4 VARCHAR(255),               -- Fourth image link
    disabled BOOLEAN DEFAULT false      -- Field to indicate if the project is disabled
);

-- Create Junction Table for Project Developers
CREATE TABLE IF NOT EXISTS project_developers (
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, developer_id)
);
`;


// Function to run the SQL commands
const setupDatabase = async () => {
  const defaultClient = new Client({
    connectionString: defaultConnectionString,
  });

  try {
    await defaultClient.connect();
    console.log('Connected to the PostgreSQL server');

    // Check if the database already exists
    const dbCheckQuery = `SELECT 1 FROM pg_database WHERE datname='${databaseName}'`;
    const res = await defaultClient.query(dbCheckQuery);
    
    // If the database does not exist, create it
    if (res.rowCount === 0) {
      await defaultClient.query(createDatabaseQuery);
      console.log(`Database '${databaseName}' created successfully`);
    } else {
      console.log(`Database '${databaseName}' already exists, skipping creation.`);
    }

    // End the default client connection
    await defaultClient.end();

    // Now connect to the new database
    const newClient = new Client({
      connectionString: newConnectionString,
    });

    await newClient.connect();
    console.log(`Connected to the '${databaseName}' database`);

    // Execute the SQL query to create tables
    await newClient.query(createTables);
    console.log('Tables created successfully');

    // End the new client connection
    await newClient.end();
  } catch (err) {
    console.error('Error setting up the database:', err);
    throw err; // Rethrow the error to stop the app in case of failure
  }
};

export default setupDatabase;
