const { Octokit } = require('@octokit/rest');

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

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 'Flowmaker1337';
    const REPO_NAME = 'calendarProjekt';

    console.log('🔍 Save Simple API called');

    if (!GITHUB_TOKEN) {
        console.error('❌ GITHUB_TOKEN is not configured');
        return res.status(500).json({ error: 'Brak konfiguracji GitHub token' });
    }
    
    console.log('✅ GITHUB_TOKEN jest skonfigurowany');

    try {
        // Dla testu - dodaj event bez obrazka
        const testEvent = {
            title: 'Test Event',
            description: 'Test description from API',
            coverImage: 'Angel-hugs.png', // użyj istniejącego obrazka
            image: 'https://images.unsplash.com/photo-1548261504-c092c175b2b8?w=400&h=300&fit=crop'
        };

        const dateString = '2024-12-31'; // Test date
        
        console.log('🔍 Creating Octokit client...');
        const octokit = new Octokit({
            auth: GITHUB_TOKEN,
        });
        console.log('✅ Octokit client created');

        console.log('🔍 Getting script.js...');
        const scriptResponse = await octokit.rest.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: 'script.js',
        });
        console.log('✅ script.js retrieved');

        const scriptContent = Buffer.from(scriptResponse.data.content, 'base64').toString('utf-8');
        
        console.log('🔍 Updating script.js...');
        const updatedScript = updateScriptWithEvent(scriptContent, dateString, testEvent);
        console.log('✅ script.js updated in memory');

        console.log('🔍 Saving script.js to GitHub...');
        await octokit.rest.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: 'script.js',
            message: `Test event: ${testEvent.title} (${dateString})`,
            content: Buffer.from(updatedScript).toString('base64'),
            sha: scriptResponse.data.sha,
        });
        console.log('✅ script.js saved to GitHub');

        res.json({
            success: true,
            message: 'Test event saved to GitHub',
            dateString: dateString,
            event: testEvent
        });

    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error response:', error.response?.data);
        res.status(500).json({ 
            error: 'API Error',
            details: error.message,
            stack: error.stack,
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
        
        console.log('✅ Events object found at position:', eventsStart);
        
        // Wyciągnij obecny obiekt events
        const eventsString = scriptContent.substring(eventsStart, eventsEnd);
        const eventsCode = eventsString.replace('const events = ', '');
        
        console.log('🔍 Parsing events object...');
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
        
        console.log('✅ Script updated in memory');
        return newScriptContent;
        
    } catch (error) {
        console.error('❌ Błąd aktualizacji script.js:', error);
        throw error;
    }
} 