const { ObjectId } = require('mongodb');
const mongoService = require('../services/mongoService');
const redisService = require('../services/redisService');

// Fonction pour créer un cours
async function createCourse(req, res) {
  const { name, duration } = req.body;

  // Vérification des champs requis
  if (!name || !duration) {
    return res.status(400).json({ error: 'All fields are required: name and duration' });
  }

  try {
    // Créer le cours dans MongoDB
    const course = await mongoService.insertOne('courses', { name, duration });

    // Stocker les informations du cours dans Redis pour la mise en cache
    await redisService.cacheData(`course:${course._id}`, course, 3600);

    return res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Fonction pour lire tous les cours
async function getAllCourses(req, res) {
  try {
    const courses = await mongoService.getAll('courses');
    return res.status(200).json(courses);
  } catch (error) {
    console.error('Error retrieving courses:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Fonction pour lire un cours par ID
async function getCourseById(req, res) {
  const { id } = req.params;

  try {
    // Vérifier dans le cache Redis
    const cachedCourse = await redisService.getCachedData(`course:${id}`);
    if (cachedCourse) {
      return res.status(200).json(JSON.parse(cachedCourse));
    }

    // Si non trouvé dans Redis, vérifier MongoDB
    const course = await mongoService.findOneById('courses', id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Mettre en cache le cours récupéré
    await redisService.cacheData(`course:${id}`, course, 3600);

    return res.status(200).json(course);
  } catch (error) {
    console.error('Error retrieving course:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Fonction pour mettre à jour un cours
async function updateCourse(req, res) {
  const { id } = req.params;
  const { name, duration } = req.body;

  try {
    const updatedCourse = await mongoService.updateOneById('courses', id, { name, duration });
    if (!updatedCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Mettre à jour le cache Redis
    await redisService.cacheData(`course:${id}`, updatedCourse, 3600);

    return res.status(200).json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Fonction pour supprimer un cours
async function deleteCourse(req, res) {
  const { id } = req.params;

  try {
    const result = await mongoService.deleteOneById('courses', id);
    if (!result) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Supprimer le cache Redis associé
    await redisService.deleteCache(`course:${id}`);

    return res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Fonction pour obtenir les statistiques des cours
async function getCourseStats(req, res) {
  try {
    const totalCourses = await mongoService.getTotalCount('courses');
    const averageRating = await mongoService.getAverageField('courses', 'rating');

    return res.status(200).json({
      totalCourses,
      averageRating,
    });
  } catch (error) {
    console.error('Error fetching course stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Export des fonctions du contrôleur
module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCourseStats
};
