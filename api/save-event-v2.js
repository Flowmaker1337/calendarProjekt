const { Octokit } = require('@octokit/rest');

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'Flowmaker1337';
const REPO_NAME = 'calendarProjekt';

module.exports = async function handler(req, res) {
    console.log('🚀 Save Event V2 - Start');
    
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
        const { date, title, description, imageBase64 } = req.body;
        
        // Validacja danych
        if (!date || !title || !imageBase64) {
            return res.status(400).json({ error: 'Brak wymaganych danych (date, title, imageBase64)' });
        }

        console.log('✅ Data validated:', { date, title: title.substring(0, 20) + '...', hasImage: !!imageBase64 });
        
        // GitHub API client
        const octokit = new Octokit({
            auth: GITHUB_TOKEN,
        });

        // Generuj nazwę pliku dla obrazka
        const timestamp = Date.now();
        const fileName = `event-${timestamp}.png`;
        const imagePath = `images/events/${fileName}`;

        // Wyciągnij base64 content z data URL
        const base64Content = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

        console.log('📤 Uploading image to GitHub...');

        // 1. Zapisz obrazek do repo
        try {
            await octokit.repos.createOrUpdateFileContents({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: imagePath,
                message: `Add event image: ${fileName}`,
                content: base64Content,
            });
            console.log('✅ Image uploaded successfully');
        } catch (imageError) {
            console.error('❌ Image upload error:', imageError.response?.data || imageError.message);
            throw new Error('Błąd uploadu obrazka: ' + imageError.message);
        }

        console.log('📥 Getting current script.js...');

        // 2. Pobierz aktualny script.js
        const scriptResponse = await octokit.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: 'script.js',
        });

        const scriptContent = Buffer.from(scriptResponse.data.content, 'base64').toString('utf-8');
        console.log('✅ Script.js downloaded, size:', scriptContent.length);
        
        // 3. Zaktualizuj script.js z nowym wydarzeniem
        console.log('🔄 Updating script with new event...');
        const eventData = {
            title: title,
            description: description || '',
            coverImage: imagePath,
            image: 'https://images.unsplash.com/photo-1548261504-c092c175b2b8?w=400&h=300&fit=crop'
        };

        const updatedScript = updateScriptWithEvent(scriptContent, date, eventData);
        console.log('✅ Script updated successfully');

        console.log('📤 Uploading updated script.js...');

        // 4. Zapisz zaktualizowany script.js
        try {
            await octokit.repos.createOrUpdateFileContents({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: 'script.js',
                message: `Add event: ${title} (${date})`,
                content: Buffer.from(updatedScript).toString('base64'),
                sha: scriptResponse.data.sha,
            });
            console.log('✅ Script.js updated successfully');
        } catch (scriptError) {
            console.error('❌ Script update error:', scriptError.response?.data || scriptError.message);
            throw new Error('Błąd aktualizacji script.js: ' + scriptError.message);
        }

        console.log('🎉 Event saved successfully!');

        res.json({
            success: true,
            message: 'Wydarzenie zostało zapisane do GitHub',
            dateString: date,
            imagePath: imagePath,
            event: eventData,
            note: 'Vercel automatycznie redeploy\'uje za chwilę'
        });

    } catch (error) {
        console.error('❌ Błąd:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Błąd zapisu do GitHub',
            details: error.message
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
        
        console.log('✅ Events object found at position:', eventsStart);
        
        // Wyciągnij obecny obiekt events
        const eventsString = scriptContent.substring(eventsStart, eventsEnd);
        let eventsCode = eventsString.replace('const events = ', '');
        
        console.log('🔍 Events code preview:', eventsCode.substring(0, 100) + '...');
        console.log('🔍 Parsing events object with eval...');
        
        // Zabezpiecz eval - sprawdź czy kod wygląda bezpiecznie
        if (!eventsCode.trim().startsWith('{')) {
            throw new Error('Nieprawidłowy format obiektu events - nie zaczyna się od {');
        }
        
        // Dodatkowa walidacja - sprawdź czy kończy się na }
        if (!eventsCode.trim().endsWith('};')) {
            console.log('🔧 Adding missing semicolon...');
            eventsCode = eventsCode.trim();
            if (!eventsCode.endsWith('}')) {
                eventsCode += '}';
            }
            if (!eventsCode.endsWith(';')) {
                eventsCode = eventsCode.replace(/}$/, '};');
            }
        }
        
        const events = eval('(' + eventsCode.replace(/;$/, '') + ')');
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
        
        console.log('✅ Script updated successfully, new size:', newScriptContent.length);
        return newScriptContent;
        
    } catch (error) {
        console.error('❌ Błąd aktualizacji script.js:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name
        });
        throw error;
    }
} 