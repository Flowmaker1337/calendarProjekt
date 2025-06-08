const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serwuj pliki statyczne

// Konfiguracja multer dla uploadów
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Upewnij się, że folder istnieje
        const uploadDir = './uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generuj unikalną nazwę pliku
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `event-${timestamp}-${name}${ext}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Sprawdź czy to obrazek
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Tylko pliki graficzne są dozwolone!'), false);
        }
    }
});

// Endpoint do uploadu wydarzenia
app.post('/api/upload-event', upload.single('coverImage'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Brak pliku obrazka' });
        }

        const { year, month, day, title, description } = req.body;
        
        // Validacja danych
        if (!year || !month || !day || !title) {
            return res.status(400).json({ error: 'Brak wymaganych danych' });
        }

        const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const fileName = req.file.filename;
        
        // Nowe wydarzenie
        const newEvent = {
            title: title,
            description: description || '',
            coverImage: fileName,
            image: 'https://images.unsplash.com/photo-1548261504-c092c175b2b8?w=400&h=300&fit=crop'
        };

        // Aktualizuj plik script.js
        updateScriptJS(dateString, newEvent);

        res.json({
            success: true,
            message: 'Wydarzenie zostało dodane',
            dateString: dateString,
            fileName: fileName,
            event: newEvent
        });

    } catch (error) {
        console.error('Błąd uploadu:', error);
        res.status(500).json({ error: 'Błąd serwera podczas uploadu' });
    }
});

// Funkcja do aktualizacji script.js
function updateScriptJS(dateString, newEvent) {
    try {
        const scriptPath = './script.js';
        let scriptContent = fs.readFileSync(scriptPath, 'utf8');
        
        // Znajdź początek obiektu events
        const eventsStart = scriptContent.indexOf('const events = {');
        const eventsEnd = scriptContent.indexOf('};', eventsStart) + 2;
        
        if (eventsStart === -1) {
            throw new Error('Nie można znaleźć obiektu events w script.js');
        }
        
        // Wyciągnij obecny obiekt events
        const eventsString = scriptContent.substring(eventsStart, eventsEnd);
        const eventsCode = eventsString.replace('const events = ', '');
        const events = eval('(' + eventsCode + ')');
        
        // Dodaj nowe wydarzenie
        events[dateString] = newEvent;
        
        // Wygeneruj nowy kod
        const newEventsCode = `const events = ${JSON.stringify(events, null, 4)};`;
        
        // Zastąp w pliku
        const newScriptContent = scriptContent.substring(0, eventsStart) + 
                                newEventsCode + 
                                scriptContent.substring(eventsEnd);
        
        // Zapisz plik
        fs.writeFileSync(scriptPath, newScriptContent, 'utf8');
        console.log(`✅ Zaktualizowano script.js z wydarzeniem ${dateString}`);
        
    } catch (error) {
        console.error('❌ Błąd aktualizacji script.js:', error);
        throw error;
    }
}

// Endpoint do usuwania wydarzenia
app.delete('/api/delete-event/:dateString', (req, res) => {
    try {
        const { dateString } = req.params;
        
        // Usuń z script.js
        removeFromScriptJS(dateString);
        
        res.json({
            success: true,
            message: 'Wydarzenie zostało usunięte'
        });
        
    } catch (error) {
        console.error('Błąd usuwania:', error);
        res.status(500).json({ error: 'Błąd podczas usuwania wydarzenia' });
    }
});

// Funkcja do usuwania z script.js
function removeFromScriptJS(dateString) {
    try {
        const scriptPath = './script.js';
        let scriptContent = fs.readFileSync(scriptPath, 'utf8');
        
        const eventsStart = scriptContent.indexOf('const events = {');
        const eventsEnd = scriptContent.indexOf('};', eventsStart) + 2;
        
        const eventsString = scriptContent.substring(eventsStart, eventsEnd);
        const eventsCode = eventsString.replace('const events = ', '');
        const events = eval('(' + eventsCode + ')');
        
        // Usuń wydarzenie
        delete events[dateString];
        
        const newEventsCode = `const events = ${JSON.stringify(events, null, 4)};`;
        const newScriptContent = scriptContent.substring(0, eventsStart) + 
                                newEventsCode + 
                                scriptContent.substring(eventsEnd);
        
        fs.writeFileSync(scriptPath, newScriptContent, 'utf8');
        console.log(`✅ Usunięto wydarzenie ${dateString} z script.js`);
        
    } catch (error) {
        console.error('❌ Błąd usuwania z script.js:', error);
        throw error;
    }
}

// Serwuj uploaded pliki
app.use('/uploads', express.static('uploads'));

// Podstawowe routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/editor', (req, res) => {
    res.sendFile(path.join(__dirname, 'editor.html'));
});

// Error handling
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Plik jest za duży (max 10MB)' });
        }
    }
    res.status(500).json({ error: error.message });
});

// Start serwera
app.listen(PORT, () => {
    console.log(`🚀 Serwer działa na http://localhost:${PORT}`);
    console.log(`📅 Kalendarz: http://localhost:${PORT}`);
    console.log(`✏️  Edytor: http://localhost:${PORT}/editor`);
});

module.exports = app; 