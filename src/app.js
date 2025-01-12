const express = require('express');
const config = require('./config/env');
const db = require('./config/db');
const cors = require('cors');  // Middleware CORS

// Importer les routes
const courseRoutes = require('./routes/courseRoutes');
const studentRoutes = require('./routes/studentRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');

const app = express();

// Connexion aux bases de données
async function connectDatabases() {
  try {
    await db.connectMongo();  // Connexion MongoDB
    await db.connectRedis();  // Connexion Redis
    console.log('Successfully connected to MongoDB and Redis');
  } catch (error) {
    console.error('Failed to connect to databases:', error);
    process.exit(1);  // Arrêter l'application si la connexion échoue
  }
}

// Fonction pour démarrer le serveur
async function startServer() {
  try {
    // Initialiser les connexions aux bases de données
    await connectDatabases();

    // Configurer les middlewares
    app.use(express.json());  // Middleware express.json() pour parser les requêtes en JSON
    app.use(express.urlencoded({ extended: true }));  // Middleware pour analyser les formulaires URL-encodés
    app.use(cors());  // Middleware CORS pour autoriser les requêtes de n'importe quelle origine

    // Monter les routes
    app.use('/courses', courseRoutes);  // Définir les routes pour les cours
    app.use('/students', studentRoutes); // Routes pour les étudiants
    app.use('/enrollments', enrollmentRoutes); // Routes pour les inscriptions

    // Démarrer le serveur
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Gérer la fermeture du serveur
process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await db.closeConnections();  // Fermer les connexions aux bases de données
  process.exit(0);  // Terminer le processus
});

// Lancer le serveur
startServer();

// Exporter l'application pour les tests
module.exports = app;  // Cette ligne permet de rendre `app` disponible pour les tests
