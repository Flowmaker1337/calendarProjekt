const { Octokit } = require('@octokit/rest');

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'Flowmaker1337';
const REPO_NAME = 'calendarProjekt';

module.exports = async function handler(req, res) {
    console.log('🗑️ Delete Event - Start');
    
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
    
    try {
        const { dateString } = req.body;
        
        // Validacja danych
        if (!dateString) {
            return res.status(400).json({ error: 'Brak dateString do usunięcia' });
        }

        console.log('🗑️ Deleting event for date:', dateString);
        
        // GitHub API client
        const octokit = new Octokit({
            auth: GITHUB_TOKEN,
        });

        console.log('📥 Getting current script.js...');

        // Pobierz aktualny script.js
        const scriptResponse = await octokit.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: 'script.js',
        });

        const scriptContent = Buffer.from(scriptResponse.data.content, 'base64').toString('utf-8');
        console.log('✅ Script.js downloaded, size:', scriptContent.length);
        
        // Zaktualizuj script.js - usuń wydarzenie
        console.log('🔄 Removing event from script...');
        const updatedScript = removeEventFromScript(scriptContent, dateString);
        console.log('✅ Event removed from script');

        console.log('📤 Uploading updated script.js...');

        // Zapisz zaktualizowany script.js
        try {
            await octokit.repos.createOrUpdateFileContents({
                owner: REPO_OWNER,
                repo: REPO_NAME,
                path: 'script.js',
                message: `Delete event: ${dateString}`,
                content: Buffer.from(updatedScript).toString('base64'),
                sha: scriptResponse.data.sha,
            });
            console.log('✅ Script.js updated successfully');
        } catch (scriptError) {
            console.error('❌ Script update error:', scriptError.response?.data || scriptError.message);
            throw new Error('Błąd aktualizacji script.js: ' + scriptError.message);
        }

        console.log('🎉 Event deleted successfully!');

        res.json({
            success: true,
            message: 'Wydarzenie zostało usunięte z GitHub',
            deletedDate: dateString,
            timestamp: new Date().toISOString(),
            note: 'Vercel automatycznie redeploy\'uje za chwilę. Obrazek pozostał w repo dla historii.'
        });

    } catch (error) {
        console.error('❌ Błąd:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            error: 'Błąd usuwania z GitHub',
            details: error.message
        });
    }
}

// Funkcja do usuwania wydarzenia ze script.js
function removeEventFromScript(scriptContent, dateStringToDelete) {
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
        
        // Sprawdź czy wydarzenie istnieje
        if (!events[dateStringToDelete]) {
            console.log('⚠️ Event not found in script:', dateStringToDelete);
            console.log('Available events:', Object.keys(events));
            throw new Error(`Wydarzenie ${dateStringToDelete} nie zostało znalezione w kalendarzu`);
        }
        
        // Usuń wydarzenie
        delete events[dateStringToDelete];
        console.log('✅ Event deleted, new count:', Object.keys(events).length);
        
        // Wygeneruj nowy kod
        const newEventsCode = `const events = ${JSON.stringify(events, null, 4)};`;
        
        // Zastąp w pliku
        const newScriptContent = scriptContent.substring(0, eventsStart) + 
                                newEventsCode + 
                                scriptContent.substring(eventsEnd);
        
        console.log('✅ Script updated successfully, new size:', newScriptContent.length);
        return newScriptContent;
        
    } catch (error) {
        console.error('❌ Błąd usuwania ze script.js:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name
        });
        throw error;
    }
} 