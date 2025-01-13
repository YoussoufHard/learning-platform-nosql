// Import du router express
const express = require('express');
const router = express.Router();

// Import du contrôleur
const enrollmentController = require('../controllers/enrollmentController');

// Routes pour les inscriptions
// Création
router.post('/', enrollmentController.createEnrollment); // Créer une inscription

// Lecture
router.get('/', enrollmentController.getAllEnrollments); // Récupérer toutes les inscriptions
router.get('/stats', enrollmentController.getEnrollmentStats); // Obtenir des statistiques sur les inscriptions
router.get('/:id', enrollmentController.getEnrollmentById); // Récupérer une inscription spécifique

// Mise à jour
router.put('/:id', enrollmentController.updateEnrollment); // Mettre à jour une inscription

// Suppression
router.delete('/:id', enrollmentController.deleteEnrollment); // Supprimer une inscription

// Export du module de routes
module.exports = router;

// L'ordre des routes est important pour éviter toute confusion. Les routes plus spécifiques (comme /students/stats)
// doivent venir avant les routes génériques avec des paramètres dynamiques (comme /students/:id), afin que chaque route 
// soit correctement mappée et évite toute ambiguïté.
