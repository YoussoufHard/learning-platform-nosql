// Question: Pourquoi créer des services séparés ?
// Réponse: 

const { ObjectId } = require('mongodb');

// Fonctions utilitaires pour MongoDB
async function findOneById(collection, id) {
  // TODO: Implémenter une fonction générique de recherche par ID
}

// Export des services
module.exports = {
  // TODO: Exporter les fonctions utilitaires
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
