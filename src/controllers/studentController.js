const { ObjectId } = require('mongodb');
const mongoService = require('../services/mongoService');
const redisService = require('../services/redisService');

// Fonction pour calculer l'âge à partir de la date de naissance
function calculateAge(birthdate) {
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

// Fonction pour créer un étudiant
async function createStudent(req, res) {
  const { name, email, birthdate } = req.body;

  // Vérification des champs requis
  if (!name || !email || !birthdate) {
    return res.status(400).json({ error: 'Tous les champs sont requis : name, email, et birthdate' });
  }

  try {
    // Créer l'étudiant dans MongoDB
    const student = await mongoService.insertOne('students', { name, email, birthdate });

    // Stocker les informations de l'étudiant dans Redis pour la mise en cache
    await redisService.cacheData(`student:${student._id}`, student, 3600);

    return res.status(201).json(student);
  } catch (error) {
    console.error('Erreur lors de la création de l\'étudiant :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

// Fonction pour lire tous les étudiants
async function getAllStudents(req, res) {
  try {
    const students = await mongoService.getAll('students');
    const studentsWithAge = students.map(student => ({
      ...student,
      age: calculateAge(student.birthdate),
    }));

    return res.status(200).json(studentsWithAge);
  } catch (error) {
    console.error('Erreur lors de la récupération des étudiants :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

// Fonction pour lire un étudiant par ID
async function getStudentById(req, res) {
  const { id } = req.params;

  try {
    // Vérifier dans le cache Redis
    const cachedStudent = await redisService.getCachedData(`student:${id}`);
    if (cachedStudent) {
      const student = JSON.parse(cachedStudent);
      student.age = calculateAge(student.birthdate);
      return res.status(200).json(student);
    }

    // Si non trouvé dans Redis, vérifier MongoDB
    const student = await mongoService.findOneById('students', id);
    if (!student) {
      return res.status(404).json({ error: 'Étudiant non trouvé' });
    }

    student.age = calculateAge(student.birthdate);

    // Mettre en cache l'étudiant récupéré
    await redisService.cacheData(`student:${id}`, student, 3600);

    return res.status(200).json(student);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'étudiant :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

// Fonction pour mettre à jour un étudiant
async function updateStudent(req, res) {
  const { id } = req.params;
  const { name, email, birthdate } = req.body;

  // Vérification des champs requis
  if (!name || !email || !birthdate) {
    return res.status(400).json({ error: 'Tous les champs sont requis : name, email, et birthdate' });
  }

  try {
    const updatedStudent = await mongoService.updateOneById('students', id, { name, email, birthdate });
    if (!updatedStudent) {
      return res.status(404).json({ error: 'Étudiant non trouvé' });
    }

    // Mettre à jour le cache Redis
    await redisService.cacheData(`student:${id}`, updatedStudent, 3600);

    return res.status(200).json(updatedStudent);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'étudiant :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

// Fonction pour supprimer un étudiant
async function deleteStudent(req, res) {
  const { id } = req.params;

  try {
    const result = await mongoService.deleteOneById('students', id);
    if (!result) {
      return res.status(404).json({ error: 'Étudiant non trouvé' });
    }

    // Supprimer le cache Redis associé
    await redisService.deleteCache(`student:${id}`);

    return res.status(200).json({ message: 'Étudiant supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'étudiant :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

// Fonction pour obtenir les statistiques des étudiants
async function getStudentStats(req, res) {
  try {
    const totalStudents = await mongoService.getTotalCount('students');

    return res.status(200).json({
      totalStudents,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des étudiants :', error);
    return res.status(500).json({ error: 'Erreur interne du serveur' });
  }
}

// Export des fonctions du contrôleur
module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentStats,
};
