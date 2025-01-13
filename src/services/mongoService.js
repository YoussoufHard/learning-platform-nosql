const { ObjectId } = require('mongodb');
const dbConnection = require('../config/db'); // Importer le module de connexion
// const { get } = require('../app');

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
  await dbConnection.connectMongo(); // Assurer la connexion à MongoDB
  const db = dbConnection.getDb(); // Obtenir l'instance de la base de données
  return await db.collection(collection).findOne({ _id: new ObjectId(id) });
}

/**
 * Récupérer tous les documents d'une collection donnée.
 * @param {string} collection - Le nom de la collection.
 * @returns {Promise<Array>} Un tableau de documents.
 */
async function getAll(collection) {
  await dbConnection.connectMongo(); // Assurer la connexion à MongoDB
  const db = dbConnection.getDb(); // Obtenir l'instance de la base de données
  const courses = await db.collection(collection).find().toArray(); // Récupérer tous les documents
  return courses;
}

/**
 * Insérer un document dans une collection donnée.
 * @param {string} collection - Le nom de la collection.
 * @param {Object} data - Les données à insérer.
 * @returns {Promise<Object>} Le document inséré.
 */
async function insertOne(collection, data) {
  await dbConnection.connectMongo(); // Assurer la connexion à MongoDB
  const db = dbConnection.getDb(); // Obtenir l'instance de la base de données
  const result = await db.collection(collection).insertOne(data);

 // Retourner l'objet inséré en utilisant l'ID inséré (si nécessaire)
 return { ...data, _id: result.insertedId };
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
  await dbConnection.connectMongo(); // Assurer la connexion à MongoDB
  const db = dbConnection.getDb(); // Obtenir l'instance de la base de données
  const result = await db
    .collection(collection)
    .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updates }, { returnDocument: 'after' });
  
  return result;
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
  await dbConnection.connectMongo(); // Assurer la connexion à MongoDB
  const db = dbConnection.getDb(); // Obtenir l'instance de la base de données
  const result = await db.collection(collection).deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

/**
 * Obtenir le nombre total de documents d'une collection.
 * @param {string} collectionName - Nom de la collection.
 * @returns {Promise<number>} Nombre total de documents.
 */
async function getTotalCount(collectionName) {
  await dbConnection.connectMongo(); // Assurer la connexion à MongoDB
  const db = dbConnection.getDb(); // Obtenir l'instance de la base de données
  const collection = db.collection(collectionName);
  return await collection.countDocuments();
}

/**
 * Calculer la moyenne d'un champ dans une collection.
 * @param {string} collectionName - Nom de la collection.
 * @param {string} fieldName - Nom du champ.
 * @returns {Promise<number|null>} Moyenne du champ ou null si aucun document.
 */
async function getAverageField(collectionName, fieldName) {
  await dbConnection.connectMongo(); // Assurer la connexion à MongoDB
  const db = dbConnection.getDb(); // Obtenir l'instance de la base de données
  const collection = db.collection(collectionName);
  const result = await collection.aggregate([
    { $group: { _id: null, avgField: { $avg: `$${fieldName}` } } },
  ]).toArray();
  return result.length > 0 ? result[0].avgField : null;
}

async function aggregate(collectionName, pipeline) {
  await dbConnection.connectMongo(); // Assurer la connexion à MongoDB
  const db = dbConnection.getDb(); // Obtenir l'instance de la base de données
  const collection = db.collection(collectionName); // Obtenir la collection

  // Effectuer l'agrégation avec le pipeline
  return await collection.aggregate(pipeline).toArray();
}
// un test pour la fonction getAverageField
// async function main() {
//   console.log("Récupération du total d'étudiants...");

//   try {
//     const totalStudents = await getTotalCount('courses');
//     console.log('Total étudiants :', totalStudents);
//   } catch (error) {
//     console.error('Erreur lors de la récupération du total d\'étudiants :', error);
//   }
// }

// // Appeler la fonction principale
// main();


// Export des services
module.exports = {
  findOneById,
  insertOne,
  updateOneById,
  deleteOneById,
  getTotalCount,
  getAverageField,
  getAll,
  aggregate
};
