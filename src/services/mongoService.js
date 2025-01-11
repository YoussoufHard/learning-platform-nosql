

const { ObjectId } = require('mongodb');
const db = require('../config/db');

// Fonctions utilitaires pour MongoDB

/**
 * Trouver un document par ID dans une collection donnée.
 * @param {string} collection - Le nom de la collection.
 * @param {string} id - L'ID du document.
 * @returns {Promise<Object|null>} Le document trouvé ou null.
 */
async function findOneById(collection, id) {
  if (!ObjectId.isValid(id)) {
    throw new Error('Invalid ObjectId');
  }
  return await db.collection(collection).findOne({ _id: new ObjectId(id) });
}

/**
 * Insérer un document dans une collection donnée.
 * @param {string} collection - Le nom de la collection.
 * @param {Object} data - Les données à insérer.
 * @returns {Promise<Object>} Le document inséré.
 */
async function insertOne(collection, data) {
  const result = await db.collection(collection).insertOne(data);
  return result.ops[0];
}

/** 
 * Mettre à jour un document par ID dans une collection donnée.
 * @param {string} collection - Le nom de la collection.
 * @param {string} id - L'ID du document à mettre à jour.
 * @param {Object} updates - Les champs à mettre à jour.
 * @returns {Promise<Object|null>} Le document mis à jour ou null.
 */
async function updateOneById(collection, id, updates) {
  if (!ObjectId.isValid(id)) {
    throw new Error('Invalid ObjectId');
  }
  const result = await db
    .collection(collection)
    .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updates }, { returnDocument: 'after' });
  return result.value;
}

/**
 * Supprimer un document par ID dans une collection donnée.
 * @param {string} collection - Le nom de la collection.
 * @param {string} id - L'ID du document à supprimer.
 * @returns {Promise<boolean>} true si la suppression a réussi, sinon false.
 */
async function deleteOneById(collection, id) {
  if (!ObjectId.isValid(id)) {
    throw new Error('Invalid ObjectId');
  }
  const result = await db.collection(collection).deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

 /**
   * Obtenir le nombre total de documents d'une collection
   * @param {string} collectionName - Nom de la collection
   * @returns {number} - Nombre total de documents
   */
 async function getTotalCount(collectionName) {
  try {
    const collection = db.collection(collectionName);
    return await collection.countDocuments();
  } catch (error) {
    console.error(`Error counting documents in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Calculer la moyenne d'un champ dans une collection
 * @param {string} collectionName - Nom de la collection
 * @param {string} fieldName - Nom du champ
 * @returns {number|null} - Moyenne du champ ou null si aucun document
 */
async function getAverageField(collectionName, fieldName) {
  try {
    const collection = db.collection(collectionName);
    const result = await collection.aggregate([
      { $group: { _id: null, avgField: { $avg: `$${fieldName}` } } },
    ]).toArray();
    return result.length > 0 ? result[0].avgField : null;
  } catch (error) {
    console.error(`Error calculating average for field ${fieldName} in ${collectionName}:`, error);
    throw error;
  }
}
// Export des services
module.exports = {
  findOneById,
  insertOne,
  updateOneById,
  deleteOneById,
  getTotalCount,
  getAverageField
};






const db = require('../config/db'); // Votre connexion à MongoDB

// Fonction pour récupérer le nombre total de cours
async function getTotalCourses() {
  const collection = db.collection('courses'); // Utilisez le nom de votre collection
  const count = await collection.countDocuments();
  return count;
}

// Fonction pour récupérer la moyenne des évaluations des cours (par exemple, si vous avez un champ 'rating')
async function getAverageCourseRating() {
  const collection = db.collection('courses');
  const avg = await collection.aggregate([
    { $group: { _id: null, averageRating: { $avg: "$rating" } } }
  ]).toArray();

  return avg.length > 0 ? avg[0].averageRating : 0; // Retourne 0 si aucun cours n'a de note
}

module.exports = {
  getTotalCourses,
  getAverageCourseRating,
  // Ajoutez les autres fonctions existantes ici
};
