// Import du router express
const express = require('express');
const router = express.Router();

// Import du contrôleur
const enrollmentController = require('../controllers/enrollmentController');

// Routes pour les inscriptions
router.post('/', enrollmentController.createEnrollment); // Créer une inscription
router.get('/', enrollmentController.getAllEnrollments); // Récupérer toutes les inscriptions
router.get('/:id', enrollmentController.getEnrollmentById); // Récupérer une inscription spécifique
router.put('/:id', enrollmentController.updateEnrollment); // Mettre à jour une inscription
router.delete('/:id', enrollmentController.deleteEnrollment); // Supprimer une inscription
router.get('/stats', enrollmentController.getEnrollmentStats); // Obtenir des statistiques sur les inscriptions

// Export du module de routes
module.exports = router;
