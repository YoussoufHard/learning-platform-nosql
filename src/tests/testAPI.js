const request = require('supertest');
const app = require('../app'); // Assure-toi que le chemin vers ton fichier app.js est correct

// Test pour créer un cours (POST)
async function testCreateCourse() {
  try {
    const response = await request(app)
      .post('/courses')
      .send({
        name: 'Node.js Basics',
        description: 'Introduction to Node.js',
        duration: '3 hours',
      });

    console.log('Create Course Response:', response.body);

    if (response.status === 200 && response.body.name === 'Node.js Basics') {
      console.log('Create course test passed');
      return response.body._id; // Retourner l'ID du cours créé pour l'utiliser dans d'autres tests
    } else {
      console.log('Create course test failed');
      return null;
    }
  } catch (error) {
    console.error('Error creating course:', error);
  }
}

// Test pour récupérer tous les cours (GET)
async function testGetCourses() {
  try {
    const response = await request(app)
      .get('/courses');

    console.log('Get Courses Response:', response.body);

    if (response.status === 200 && Array.isArray(response.body)) {
      console.log('Get courses test passed');
    } else {
      console.log('Get courses test failed');
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
}

// Test pour récupérer un cours spécifique (GET by ID)
async function testGetCourseById(courseId) {
  try {
    const response = await request(app)
      .get(`/courses/${courseId}`);

    console.log('Get Course by ID Response:', response.body);

    if (response.status === 200 && response.body._id === courseId) {
      console.log('Get course by ID test passed');
    } else {
      console.log('Get course by ID test failed');
    }
  } catch (error) {
    console.error('Error fetching course by ID:', error);
  }
}

// Test pour mettre à jour un cours (PUT)
async function testUpdateCourse(courseId) {
  try {
    const response = await request(app)
      .put(`/courses/${courseId}`)
      .send({
        name: 'Node.js Advanced',
        description: 'Advanced topics in Node.js',
        duration: '5 hours',
      });

    console.log('Update Course Response:', response.body);

    if (response.status === 200 && response.body.name === 'Node.js Advanced') {
      console.log('Update course test passed');
    } else {
      console.log('Update course test failed');
    }
  } catch (error) {
    console.error('Error updating course:', error);
  }
}

// Test pour supprimer un cours (DELETE)
async function testDeleteCourse(courseId) {
  try {
    const response = await request(app)
      .delete(`/courses/${courseId}`);

    console.log('Delete Course Response:', response.body);

    if (response.status === 200) {
      console.log('Delete course test passed');
    } else {
      console.log('Delete course test failed');
    }
  } catch (error) {
    console.error('Error deleting course:', error);
  }
}

// Fonction principale pour exécuter les tests
async function runTests() {
  // Créer un cours et récupérer son ID
  const createdCourseId = await testCreateCourse();

  if (createdCourseId) {
    // Récupérer tous les cours
    await testGetCourses();

    // Récupérer un cours par ID (après l'avoir créé)
    await testGetCourseById(createdCourseId);

    // Mettre à jour un cours (après l'avoir créé)
    await testUpdateCourse(createdCourseId);

    // Supprimer un cours
    await testDeleteCourse(createdCourseId);
  } else {
    console.log('Course creation failed, skipping other tests.');
  }
}

// Lancer les tests
runTests();
