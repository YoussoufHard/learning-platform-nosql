const { MongoClient } = require('mongodb');
const redis = require('redis');
const config = require('./env');

let mongoClient, redisClient, db;

// Fonction pour se connecter à MongoDB
// Fonction pour se connecter à MongoDB
async function connectMongo() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;

    if (!mongoUri || !dbName) {
      throw new Error('MONGODB_URI or MONGODB_DB_NAME is not defined in environment variables');
    }

    // Construire la chaîne complète de connexion MongoDB
      // Connexion à MongoDB sans les options obsolètes
      mongoClient = new MongoClient(mongoUri);
      await mongoClient.connect();
 db = mongoClient.db(dbName); // Sélection de la base de données
    await mongoClient.connect();
    db = mongoClient.db(dbName); // Sélection de la base de données
    console.log(`Connexion à MongoDB réussie (Base de données : ${dbName})`);
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error.message);
    // Implémentation de retries sur la connexion
    setTimeout(connectMongo, 5000); // Nouvelle tentative après 5 secondes
  }
}

// Fonction pour se connecter à Redis
async function connectRedis() {
  try {
    // Connexion à Redis avec gestion des erreurs et des retries
    redisClient = redis.createClient({ url: config.REDIS_URI });
    redisClient.on('connect', () => {
      console.log('Connexion à Redis réussie');
    });
    redisClient.on('error', (err) => {
      console.error('Erreur de connexion à Redis:', err);
      // Tentatives de reconnexion en cas d'erreur
      setTimeout(connectRedis, 5000); // Nouvelle tentative après 5 secondes
    });
    await redisClient.connect();
  } catch (error) {
    console.error('Erreur de connexion à Redis:', error);
    // Tentatives de reconnexion en cas d'erreur
    setTimeout(connectRedis, 5000); // Nouvelle tentative après 5 secondes
  }
}

// Fonction pour fermer proprement les connexions
async function closeConnections() {
  try {
    if (mongoClient) {
      await mongoClient.close();
      console.log('Connexion MongoDB fermée');
    }
    if (redisClient) {
      await redisClient.quit();
      console.log('Connexion Redis fermée');
    }
  } catch (error) {
    console.error('Erreur lors de la fermeture des connexions:', error);
  }
}

// Export des fonctions et clients
module.exports = {
  connectMongo,
  connectRedis,
  closeConnections,
  getDb: () => db,
  getRedisClient: () => redisClient,
};
