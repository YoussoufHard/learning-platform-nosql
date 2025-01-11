
// Import du router express
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// Routes pour les cours
router.post('/', courseController.createCourse); // Création d'un cours
//router.get('/:id', courseController.getCourse); // Récupérer un cours spécifique
router.get('/stats', courseController.getCourseStats); // Statistiques des cours
router.put('/:id', courseController.updateCourse); // Mettre à jour un cours
router.delete('/:id', courseController.deleteCourse); // Supprimer un cours

module.exports = router;