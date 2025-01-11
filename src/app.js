const express = require('express');
const config = require('./config/env');
const db = require('./config/db');
const cors = require('cors');  // Middleware CORS

//importer les routes
const courseRoutes = require('./routes/courseRoutes');
//const studentRoutes = require('./routes/studentRoutes');

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

async function startServer() {
  try {
    // Initialiser les connexions aux bases de données
    await connectDatabases();

    // Configurer les middlewares
    //middleware express.json() pour parser les requêtes en JSON
    app.use(express.json());

    app.use(express.urlencoded({ extended: true }));  // Middleware pour analyser les formulaires URL-encodés
    
    // Middleware CORS 
    app.use(cors());  // Autoriser les requêtes de n'importe quelle origine

    // Monter les routes
    app.use('/courses', courseRoutes);
   // app.use('/students', studentRoutes);

    // Démarrer le serveur
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('Shutting down server...');
  await db.closeConnections();
  process.exit(0);
});

startServer();
