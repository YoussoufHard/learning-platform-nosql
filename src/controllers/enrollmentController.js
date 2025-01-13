const { ObjectId } = require('mongodb');
const mongoService = require('../services/mongoService');
const redisService = require('../services/redisService');

// Fonction pour créer une inscription
async function createEnrollment(req, res) {
  const { studentId, courseId, enrollmentDate } = req.body;

  // Vérification des champs requis
  if (!studentId || !courseId) {
    return res.status(400).json({ error: 'Les champs studentId et courseId sont requis.' });
  }

  try {
    const enrollment = {
      studentId: new ObjectId(studentId),
      courseId: new ObjectId(courseId),
      enrollmentDate: enrollmentDate || new Date(),
    };

    // Création de l'inscription dans MongoDB
    const result = await mongoService.insertOne('enrollments', enrollment);

    // Mise en cache de l'inscription
    await redisService.cacheData(`enrollment:${result._id}`, result, 3600);

    return res.status(201).json(result);
  } catch (error) {
    console.error('Erreur lors de la création de l\'inscription :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
}

// Fonction pour récupérer toutes les inscriptions
async function getAllEnrollments(req, res) {
  try {
    const enrollments = await mongoService.getAll('enrollments');
    return res.status(200).json(enrollments);
  } catch (error) {
    console.error('Erreur lors de la récupération des inscriptions :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
}

// Fonction pour récupérer une inscription spécifique par ID
async function getEnrollmentById(req, res) {
  const { id } = req.params;

  try {

          // Vérifier dans le cache Redis
        const cachedEnrollment = await redisService.getCachedData(`enrollment:${id}`);
        if (cachedEnrollment) {
          return res.status(200).json(cachedEnrollment); // Pas besoin de JSON.parse ici
        }

    // Si non trouvé dans Redis, chercher dans MongoDB
    const enrollment = await mongoService.findOneById('enrollments', id);
    if (!enrollment) {
      return res.status(404).json({ error: 'Inscription non trouvée.' });
    }

    // Mettre en cache l'inscription récupérée
    await redisService.cacheData(`enrollment:${id}`, enrollment, 3600);

    return res.status(200).json(enrollment);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'inscription :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
}

// Fonction pour mettre à jour une inscription
async function updateEnrollment(req, res) {
  const { id } = req.params;
  const { studentId, courseId, enrollmentDate } = req.body;

  try {
    const updatedEnrollment = await mongoService.updateOneById('enrollments', id, {
      studentId: studentId ? ObjectId(studentId) : undefined,
      courseId: courseId ? ObjectId(courseId) : undefined,
      enrollmentDate,
    });

    if (!updatedEnrollment) {
      return res.status(404).json({ error: 'Inscription non trouvée.' });
    }

    // Mettre à jour le cache Redis
    await redisService.cacheData(`enrollment:${id}`, updatedEnrollment, 3600);

    return res.status(200).json(updatedEnrollment);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'inscription :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
}

// Fonction pour supprimer une inscription
async function deleteEnrollment(req, res) {
  const { id } = req.params;

  try {
    const result = await mongoService.deleteOneById('enrollments', id);
    if (!result) {
      return res.status(404).json({ error: 'Inscription non trouvée.' });
    }

    // Supprimer le cache Redis associé
    await redisService.deleteCache(`enrollment:${id}`);

    return res.status(200).json({ message: 'Inscription supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'inscription :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
}

// Fonction pour obtenir les statistiques des inscriptions
async function getEnrollmentStats(req, res) {
  try {
    const totalEnrollments = await mongoService.getTotalCount('enrollments');
    const coursesWithMostEnrollments = await mongoService.aggregate('enrollments', [
      { $group: { _id: '$courseId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    return res.status(200).json({
      totalEnrollments,
      mostPopularCourse: coursesWithMostEnrollments[0],
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
}

// Export des fonctions du contrôleur
module.exports = {
  createEnrollment,
  getAllEnrollments,
  getEnrollmentById,
  updateEnrollment,
  deleteEnrollment,
  getEnrollmentStats,
};
