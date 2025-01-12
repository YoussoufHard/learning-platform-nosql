// Import du router express
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Routes pour les étudiants
router.post('/', studentController.createStudent); // Création d'un étudiant
router.get('/:id', studentController.getStudentById); // Récupérer un étudiant spécifique
router.get('/', studentController.getAllStudents); // Récupérer tous les étudiants
router.get('/stats', studentController.getStudentStats); // Statistiques des étudiants
router.put('/:id', studentController.updateStudent); // Mettre à jour un étudiant
router.delete('/:id', studentController.deleteStudent); // Supprimer un étudiant

module.exports = router;
