// Używamy Vercel Deploy Hook zamiast CLI
module.exports = async function handler(req, res) {
    console.log('🚀 Trigger Deploy via Hook - Start');
    
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
        console.log('📦 Triggering Vercel deployment via webhook...');
        
        // Vercel Deploy Hook URL - musimy go utworzyć
        const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK;
        
        if (!deployHookUrl) {
            return res.status(500).json({
                error: 'Deploy Hook nie skonfigurowany',
                message: 'Brak VERCEL_DEPLOY_HOOK w zmiennych środowiskowych',
                instructions: 'Idź do Vercel Dashboard → Settings → Git → Deploy Hooks'
            });
        }
        
        // Wywołaj deploy hook
        const deployResponse = await fetch(deployHookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                trigger: 'manual-deploy-button',
                timestamp: new Date().toISOString()
            })
        });
        
        if (!deployResponse.ok) {
            throw new Error(`Deploy hook failed: ${deployResponse.status} ${deployResponse.statusText}`);
        }
        
        const deployData = await deployResponse.json();
        console.log('✅ Deploy triggered successfully:', deployData);
        
        // Wygeneruj prawdopodobny nowy URL na podstawie patternu
        const timestamp = Date.now().toString(36);
        const projectName = 'calendar-projekt';
        const username = 'flowmaker1337s-projects';
        const estimatedUrl = `https://${projectName}-${timestamp}-${username}.vercel.app`;
        
        return res.json({
            success: true,
            message: 'Deployment został uruchomiony pomyślnie!',
            deploymentId: deployData.id || 'unknown',
            estimatedUrl: estimatedUrl,
            calendarUrl: estimatedUrl,
            editorUrl: estimatedUrl + '/editor',
            timestamp: new Date().toISOString(),
            note: 'Deployment trwa 1-2 minuty. Sprawdź czy nowy URL działa za chwilę.',
            checkCommand: 'Lub sprawdź najnowszy URL przez: vercel ls'
        });
        
    } catch (error) {
        console.error('❌ Deploy hook error:', error);
        
        return res.status(500).json({
            error: 'Błąd deploy hook',
            message: error.message,
            instructions: 'Sprawdź konfigurację VERCEL_DEPLOY_HOOK lub użyj ręcznego deploy: vercel --prod'
        });
    }
}; 