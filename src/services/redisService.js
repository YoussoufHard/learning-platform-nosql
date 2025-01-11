const redisClient = require('../config/db'); // Connexion Redis déjà établie dans la configuration

// Fonctions utilitaires pour Redis

/**
 * Mettre en cache des données avec une clé et un TTL
 * @param {string} key - La clé pour identifier les données dans Redis
 * @param {Object} data - Les données à mettre en cache
 * @param {number} ttl - Temps de vie des données en cache (en secondes)
 * @returns {Promise<void>}
 */
async function cacheData(key, data, ttl) {
  try {
    const stringData = JSON.stringify(data);
    await redisClient.set(key, stringData, { EX: ttl });
  } catch (error) {
    console.error(`Erreur lors de la mise en cache avec la clé "${key}":`, error);
    throw error;
  }
}

/**
 * Récupérer des données depuis le cache
 * @param {string} key - La clé pour identifier les données dans Redis
 * @returns {Promise<Object|null>} - Les données mises en cache ou null si non trouvées
 */
async function getCachedData(key) {
  try {
    const stringData = await redisClient.get(key);
    return stringData ? JSON.parse(stringData) : null;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la clé "${key}":`, error);
    throw error;
  }
}

/**
 * Supprimer une clé spécifique dans Redis
 * @param {string} key - La clé à supprimer
 * @returns {Promise<boolean>} - Indique si la suppression a réussi
 */
async function deleteCache(key) {
  try {
    const result = await redisClient.del(key);
    return result > 0;
  } catch (error) {
    console.error(`Erreur lors de la suppression de la clé "${key}":`, error);
    throw error;
  }
}

/**
 * Vérifier si une clé existe dans Redis
 * @param {string} key - La clé à vérifier
 * @returns {Promise<boolean>} - Indique si la clé existe
 */
async function keyExists(key) {
  try {
    const exists = await redisClient.exists(key);
    return exists === 1;
  } catch (error) {
    console.error(`Erreur lors de la vérification de la clé "${key}":`, error);
    throw error;
  }
}

/**
 * Effacer tout le cache Redis (utilisation prudente)
 * @returns {Promise<void>}
 */
async function clearCache() {
  try {
    await redisClient.flushAll();
  } catch (error) {
    console.error('Erreur lors de la suppression de tout le cache Redis:', error);
    throw error;
  }
}

// Export des services Redis
module.exports = {
  cacheData,
  getCachedData,
  deleteCache,
  keyExists,
  clearCache,
};
