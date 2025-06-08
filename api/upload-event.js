const multer = require('multer');

// Konfiguracja multer dla pamięci (bez zapisu na dysk)
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

export default async function handler(req, res) {
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
        
        // Convert buffer to base64 string for storage
        const imageBase64 = req.file.buffer.toString('base64');
        const imageMimeType = req.file.mimetype;
        
        // Nowe wydarzenie
        const newEvent = {
            title: title,
            description: description || '',
            coverImage: `data:${imageMimeType};base64,${imageBase64}`,
            image: 'https://images.unsplash.com/photo-1548261504-c092c175b2b8?w=400&h=300&fit=crop'
        };

        // Na Vercel nie możemy modyfikować plików, więc zwracamy dane
        // Frontend będzie musiał przechowywać stan lokalnie
        res.json({
            success: true,
            message: 'Wydarzenie zostało przetworzone',
            dateString: dateString,
            event: newEvent,
            note: 'Na Vercel wydarzenia są tymczasowe - nie są zapisywane na stałe'
        });

    } catch (error) {
        console.error('Błąd uploadu:', error);
        res.status(500).json({ error: 'Błąd serwera podczas uploadu' });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
}; 