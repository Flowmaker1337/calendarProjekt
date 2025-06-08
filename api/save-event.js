const { Octokit } = require('@octokit/rest');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Konfiguracja multer dla pamięci
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Tylko pliki graficzne są dozwolone!'), false);
        }
    }
});

// Middleware do obsługi multer
const runMiddleware = (req, res, fn) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'Flowmaker1337';
const REPO_NAME = 'calendarProjekt';

module.exports = async function handler(req, res) {
    // Włącz CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metoda niedozwolona' });
    }

    if (!GITHUB_TOKEN) {
        console.error('❌ GITHUB_TOKEN is not configured');
        return res.status(500).json({ error: 'Brak konfiguracji GitHub token' });
    }
    
    console.log('✅ GITHUB_TOKEN jest skonfigurowany');

    try {
        // Uruchom multer middleware
        await runMiddleware(req, res, upload.single('coverImage'));

        if (!req.file) {
            return res.status(400).json({ error: 'Brak pliku obrazka' });
        }

        const { year, month, day, title, description } = req.body;
        
        // Validacja danych
        if (!year || !month || !day || !title) {
            return res.status(400).json({ error: 'Brak wymaganych danych' });
        }

        const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        // GitHub API client
        const octokit = new Octokit({
            auth: GITHUB_TOKEN,
        });

        // Generuj nazwę pliku
        const timestamp = Date.now();
        const ext = path.extname(req.file.originalname);
        const fileName = `event-${timestamp}${ext}`;
        const imagePath = `images/events/${fileName}`;

        // 1. Zapisz obrazek do repo
        await octokit.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: imagePath,
            message: `Add event image: ${fileName}`,
            content: req.file.buffer.toString('base64'),
        });

        // 2. Pobierz aktualny script.js
        const scriptResponse = await octokit.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: 'script.js',
        });

        const scriptContent = Buffer.from(scriptResponse.data.content, 'base64').toString('utf-8');
        
        // 3. Zaktualizuj script.js z nowym wydarzeniem
        const updatedScript = updateScriptWithEvent(scriptContent, dateString, {
            title: title,
            description: description || '',
            coverImage: imagePath,
            image: 'https://images.unsplash.com/photo-1548261504-c092c175b2b8?w=400&h=300&fit=crop'
        });

        // 4. Zapisz zaktualizowany script.js
        await octokit.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: 'script.js',
            message: `Add event: ${title} (${dateString})`,
            content: Buffer.from(updatedScript).toString('base64'),
            sha: scriptResponse.data.sha,
        });

        res.json({
            success: true,
            message: 'Wydarzenie zostało zapisane do GitHub',
            dateString: dateString,
            imagePath: imagePath,
            note: 'Vercel automatycznie redeploy\'uje za chwilę'
        });

    } catch (error) {
        console.error('❌ Błąd GitHub API:', error);
        console.error('Error stack:', error.stack);
        console.error('Error response:', error.response?.data);
        res.status(500).json({ 
            error: 'Błąd zapisu do GitHub',
            details: error.message,
            githubError: error.response?.data?.message || 'Unknown GitHub error'
        });
    }
}

// Funkcja do aktualizacji script.js z nowym wydarzeniem
function updateScriptWithEvent(scriptContent, dateString, eventData) {
    try {
        console.log('🔍 Finding events object...');
        
        // Znajdź początek obiektu events
        const eventsStart = scriptContent.indexOf('const events = {');
        const eventsEnd = scriptContent.indexOf('};', eventsStart) + 2;
        
        if (eventsStart === -1) {
            throw new Error('Nie można znaleźć obiektu events w script.js');
        }
        
        console.log('✅ Events object found');
        
        // Wyciągnij obecny obiekt events
        const eventsString = scriptContent.substring(eventsStart, eventsEnd);
        let eventsCode = eventsString.replace('const events = ', '');
        
        console.log('🔍 Parsing events object with eval...');
        
        // Zabezpiecz eval - sprawdź czy kod wygląda bezpiecznie
        if (!eventsCode.trim().startsWith('{')) {
            throw new Error('Nieprawidłowy format obiektu events');
        }
        
        const events = eval('(' + eventsCode + ')');
        console.log('✅ Events parsed, current count:', Object.keys(events).length);
        
        // Dodaj nowe wydarzenie
        events[dateString] = eventData;
        console.log('✅ New event added, new count:', Object.keys(events).length);
        
        // Wygeneruj nowy kod
        const newEventsCode = `const events = ${JSON.stringify(events, null, 4)};`;
        
        // Zastąp w pliku
        const newScriptContent = scriptContent.substring(0, eventsStart) + 
                                newEventsCode + 
                                scriptContent.substring(eventsEnd);
        
        console.log('✅ Script updated successfully');
        return newScriptContent;
        
    } catch (error) {
        console.error('❌ Błąd aktualizacji script.js:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        throw error;
    }
}

module.exports.config = {
    api: {
        bodyParser: false,
    },
}; 