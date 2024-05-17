// Importarea modulelor necesare
const http = require('http');
const fs = require('fs');
const path = require('path');
const { Parser: Json2CsvParser } = require('json2csv');
const ExcelJS = require('exceljs');
const { DateTime } = require('luxon');

// Funcția pentru citirea, sortarea și salvarea numelor
async function sortAndSaveNames(inputFilename, name) {
    try {
        // Citirea numelor din fișierul de intrare
        let data = '';
        if (fs.existsSync(path.join(__dirname, inputFilename))) {
            data = fs.readFileSync(path.join(__dirname, inputFilename), 'utf8');
        }
        const names = data.split('\n').map(name => name.trim()).filter(name => name.length > 0);

        // Adăugarea noului nume dacă este trimis în cererea POST și nu există deja în listă
        if (name && !names.includes(name)) {
            names.push(name);
        }

        // Sortarea numelor în ordine alfabetică
        names.sort((a, b) => a.localeCompare(b));

        // Obținerea datei și orei curente pentru generarea numelor de fișiere
        const currentDateTime = DateTime.now().toFormat('yyyyMMdd_HHmmss');

        // Generarea numelor de fișiere pe baza datei și orei curente
        const jsonFilename = `nume_sortate_${currentDateTime}.json`;
        const csvFilename = `nume_sortate_${currentDateTime}.csv`;
        const excelFilename = `nume_sortate_${currentDateTime}.xlsx`;

        // Salvarea numelor sortate în fișierul JSON
        fs.writeFileSync(jsonFilename, JSON.stringify(names, null, 2));
        console.log(`Lista sortată a fost salvată în ${jsonFilename}`);

        // Conversia numelor în format CSV
        const csvParser = new Json2CsvParser();
        const csvData = csvParser.parse(names.map(name => ({ name, dateTime: currentDateTime }))); // Adăugăm și data și ora la fiecare înregistrare
        fs.writeFileSync(csvFilename, csvData);
        console.log(`Lista sortată a fost salvată în ${csvFilename}`);

        // Crearea unei noi foi de lucru Excel, a unui antet și a numelor
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Nume Sortate');
        worksheet.addRow(['Nume', 'Data și Ora']); // Adăugăm și antetul pentru data și ora
        names.forEach(name => worksheet.addRow([name, currentDateTime]));

        // Salvarea filei de lucru în fișierul Excel
        await workbook.xlsx.writeFile(excelFilename);
        console.log(`Lista sortată a fost salvată în ${excelFilename}`);

        // Salvarea numelor în fișierul de intrare
        fs.writeFileSync(path.join(__dirname, inputFilename), names.join('\n'));
        console.log(`Lista numelor a fost actualizată în ${inputFilename}`);
    } catch (error) {
        console.error('Eroare:', error);
    }
}

// Crearea serverului HTTP cu ajutorul metodei createServer
const server = http.createServer((req, res) => {
    // Verificarea URL-ului și tratarea rutei în funcție de cerere
    if (req.url === '/' || req.url === '/client.html') {
        // Dacă URL-ul este '/' sau '/client.html', citim și returnăm fișierul client.html
        fs.readFile(path.join(__dirname, 'client.html'), (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Eroare internă a serverului.');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else if (req.url === '/adauga-nume' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // Convertim chunk-ul primit în șir de caractere
        });
        req.on('end', () => {
            const parsedBody = JSON.parse(body); // Parsăm corpul cererii POST ca obiect JSON
            const name = parsedBody.nume; // Extragem numele din obiectul JSON
            sortAndSaveNames('nume_input.txt',name); // Apelăm funcția de sortare și salvare a numelor
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Numele a fost adăugat cu succes!');
        });
    } else {
        // Pentru orice alt URL, returnăm un cod de stare 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Pagina nu a fost găsită.');
    }
});

// Pornim serverul pentru a asculta pe portul 3006
server.listen(3000, () => {
    console.log('Serverul rulează pe http://localhost:3000/');
});

module.exports = server;

