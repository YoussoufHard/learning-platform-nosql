const { ObjectId } = require('mongodb');
const db = require('../config/db');
const mongoService = require('../services/mongoService');
const redisService = require('../services/redisService');

// Fonction pour créer un cours
async function createCourse(req, res) {
  const { name, description, teacherId } = req.body;

  if (!name || !description || !teacherId) {
    return res.status(400).json({ error: 'All fields are required: name, description, and teacherId' });
  }

  try {
    // Vérifier si l'enseignant existe dans la base de données
    const teacher = await mongoService.getTeacherById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Créer le cours dans MongoDB
    const course = await mongoService.createCourse({ name, description, teacherId });

    // Optionnel: Stocker les informations du cours dans Redis pour la mise en cache
    await redisService.cacheCourse(course._id, course);

    return res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// les autres fonctions du contrôleur (getAllCourses, getCourseById, updateCourse, deleteCourse) peuvent être ajoutées ici

// Lire tous les cours
async function getAllCourses(req, res) {
  try {
    const courses = await mongoService.getAllCourses();
    return res.status(200).json(courses);
  } catch (error) {
    console.error('Error retrieving courses:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Lire un cours par ID
async function getCourseById(req, res) {
  const { id } = req.params;
  try {
    const course = await mongoService.getCourseById(id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    return res.status(200).json(course);
  } catch (error) {
    console.error('Error retrieving course:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Mettre à jour un cours
async function updateCourse(req, res) {
  const { id } = req.params;
  const { name, description, teacherId } = req.body;
  try {
    const updatedCourse = await mongoService.updateCourse(id, { name, description, teacherId });
    if (!updatedCourse) {
      return res.status(404).json({ error: 'Course not found' });
    }
    return res.status(200).json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Supprimer un cours
async function deleteCourse(req, res) {
  const { id } = req.params;
  try {
    const result = await mongoService.deleteCourse(id);
    if (!result) {
      return res.status(404).json({ error: 'Course not found' });
    }
    return res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Fonction pour obtenir les statistiques des cours
async function getCourseStats(req, res) {
  try {
    // Exemple de statistiques: nombre total de cours
    const totalCourses = await mongoService.getTotalCourses();
    const averageRating = await mongoService.getAverageCourseRating();

    // Retourner les statistiques sous forme de réponse JSON
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

