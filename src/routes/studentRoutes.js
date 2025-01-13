// Import du router express
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Routes pour les étudiants
// Création
router.post('/', studentController.createStudent); // Créer un étudiant

// Lecture
router.get('/', studentController.getAllStudents); // Récupérer tous les étudiants
router.get('/stats', studentController.getStudentStats); // Récupérer les statistiques des étudiants
router.get('/:id', studentController.getStudentById); // Récupérer un étudiant spécifique

// Mise à jour
router.put('/:id', studentController.updateStudent); // Mettre à jour un étudiant

// Suppression
router.delete('/:id', studentController.deleteStudent); // Supprimer un étudiant

module.exports = router;

// L'ordre des routes est important pour éviter toute confusion. Les routes plus spécifiques (comme /students/stats)
// doivent venir avant les routes génériques avec des paramètres dynamiques (comme /students/:id), afin que chaque route 
// soit correctement mappée et évite toute ambiguïté.