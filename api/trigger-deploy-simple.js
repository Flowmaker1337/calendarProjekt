// Prosty endpoint który sprawdza najnowszy deployment i daje instrukcje
module.exports = async function handler(req, res) {
    console.log('🚀 Simple Deploy Check - Start');
    
    // Włącz CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Wygeneruj prawdopodobny najnowszy URL na podstawie aktualnego czasu
        const baseUrl = req.headers.host || 'calendar-projekt-h7p5ymdxb-flowmaker1337s-projects.vercel.app';
        const currentUrl = `https://${baseUrl}`;
        
        return res.json({
            success: true,
            message: 'Aktualne informacje o deploymencie',
            currentUrl: currentUrl,
            calendarUrl: currentUrl,
            editorUrl: currentUrl + '/editor',
            timestamp: new Date().toISOString(),
            instructions: {
                manual: 'Aby zrobić nowy deployment ręcznie: vercel --prod',
                auto: 'Auto-deployment uruchomi się automatycznie przy nowych commitach',
                check: 'Sprawdź najnowszy URL: vercel ls | head -1'
            },
            note: 'To jest aktualny URL. Jeśli dodałeś nowe wydarzenia, mogą pojawić się za chwilę lub wymagają ręcznego deploy.'
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
        
        return res.status(500).json({
            error: 'Błąd sprawdzania deploymentu',
            message: error.message
        });
    }
}; 