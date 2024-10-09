import express, { json } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import setupSwaggerDocs from "./utils/swagger.js";
import { dirname, join } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';
import developerRouter from './routes/developer-routes.js';
import projectRouter from './routes/project-routes.js';
// Import the database setup function
import setupDatabase from './utils/database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = { credentials: true, origin: process.env.URL || '*' };

setupSwaggerDocs(app);
app.use(cors(corsOptions));
app.use(json());
app.use(cookieParser());

app.use(cors({
  origin: '*', // Replace with your frontend URL
  credentials: true
}));

// Setup database and start the server
setupDatabase().then(() => {
  app.listen(PORT, () => console.log(`Server is listening on ${PORT}`));
}).catch((err) => {
  console.error('Failed to set up database:', err);
  process.exit(1);
});

app.use('/documents/DeveloperImages', express.static(path.join(__dirname, 'documents/DeveloperImages')));
app.use('/documents/ProjectImages', express.static(path.join(__dirname, 'documents/ProjectImages')));
app.use('/', express.static(join(__dirname, 'public')));

app.use('/', developerRouter);
app.use('/', projectRouter);


