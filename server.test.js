// Importarea modulului 'supertest', care permite simularea cererilor HTTP către server
const request = require('supertest');

// Importarea serverului pe care dorim să-l testăm
const server = require('./server');

// Definirea unei suite de teste cu numele 'Server Tests'
describe('Server Tests', () => {
   
    // Test pentru ruta '/' care ar trebui să returneze codul de stare 200
    test('GET / should return status code 200', async () => {
        const response = await request(server).get('/');
        expect(response.status).toBe(200);
    });

    // Test pentru ruta '/client.html' care ar trebui să returneze codul de stare 200
    test('GET /client.html should return status code 200', async () => {
        const response = await request(server).get('/client.html');
        expect(response.status).toBe(200);
    });

    // Test pentru ruta '/adauga-nume' cu un nume valid, care ar trebui să returneze codul de stare 200
    test('POST /adauga-nume with valid name should return status code 200', async () => {
        const response = await request(server)
            .post('/adauga-nume')
            .send({ nume: 'John Doe' });
        expect(response.status).toBe(200);
    });

    // Test pentru ruta '/adauga-nume' cu un nume invalid, care ar trebui să returneze codul de stare 400
    test('POST /adauga-nume with invalid name should return status code 400', async () => {
        const response = await request(server)
            .post('/adauga-nume')
            .send({ nume: '' });
        expect(response.status).toBe(400);
    });

    // Test pentru ruta '/adauga-nume' cu o metodă HTTP invalidă (GET în loc de POST), care ar trebui să returneze codul de stare 404
    test('POST /adauga-nume with invalid method should return status code 404', async () => {
        const response = await request(server).get('/adauga-nume');
        expect(response.status).toBe(404);
    });
});
