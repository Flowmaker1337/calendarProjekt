const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

module.exports = async function handler(req, res) {
    console.log('🚀 Trigger Deploy - Start');
    
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
        console.log('📦 Starting Vercel deployment...');
        
        // Wywołaj vercel --prod i przechwyć output
        const { stdout, stderr } = await execAsync('vercel --prod --yes', {
            timeout: 120000, // 2 minuty timeout
            cwd: process.cwd() // Uruchom w katalogu projektu
        });
        
        console.log('📤 Vercel stdout:', stdout);
        if (stderr) {
            console.log('⚠️ Vercel stderr:', stderr);
        }
        
        // Wyciągnij URL z output Vercel
        const urlMatch = stdout.match(/✅\s+Production:\s+(https:\/\/[^\s]+)/);
        
        if (urlMatch) {
            const newUrl = urlMatch[1];
            console.log('✅ New deployment URL:', newUrl);
            
            return res.json({
                success: true,
                message: 'Deployment zakończony pomyślnie!',
                newUrl: newUrl,
                calendarUrl: newUrl,
                editorUrl: newUrl + '/editor',
                timestamp: new Date().toISOString(),
                note: 'Nowy kalendarz jest gotowy do użycia!'
            });
        } else {
            console.log('⚠️ Could not extract URL from output');
            return res.json({
                success: true,
                message: 'Deployment uruchomiony, ale nie udało się wyciągnąć URL',
                output: stdout,
                note: 'Sprawdź vercel ls dla najnowszego URL'
            });
        }
        
    } catch (error) {
        console.error('❌ Deployment error:', error);
        
        // Jeśli błąd timeout
        if (error.code === 'TIMEOUT') {
            return res.status(500).json({
                error: 'Deployment timeout',
                message: 'Deployment trwa zbyt długo. Sprawdź status ręcznie.',
                details: 'Uruchom: vercel ls'
            });
        }
        
        return res.status(500).json({
            error: 'Błąd deployment',
            message: error.message,
            details: error.stderr || 'Nieznany błąd Vercel'
        });
    }
}; 