
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const academicRoutes = require('./routes/academic');
const professorRoutes = require('./routes/professor');
const censeurRoutes = require('./routes/censeur');
const bulletinRoutes = require('./routes/bulletin');
const secretaryRoutes = require('./routes/secretary');
const portalRoutes = require('./routes/portal');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/professor', professorRoutes);
app.use('/api/censeur', censeurRoutes);
app.use('/api/bulletins', bulletinRoutes);
app.use('/api/secretary', secretaryRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/proviseur', require('./routes/proviseur'));

// Swagger Documentation
const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Base Route
app.get('/', (req, res) => {
    res.json({ message: 'School Management System API is running' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;
