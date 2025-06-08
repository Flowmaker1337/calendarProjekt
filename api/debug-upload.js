const { Octokit } = require('@octokit/rest');

module.exports = async (req, res) => {
    console.log('🐛 DEBUG UPLOAD - Start');
    
    try {
        // CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        console.log('🐛 Headers:', req.headers);
        console.log('🐛 Method:', req.method);
        
        // Sprawdź czy jest body i czy jest JSON
        console.log('🐛 Body:', req.body);
        console.log('🐛 Body type:', typeof req.body);
        
        if (!req.body) {
            return res.status(400).json({ error: 'No request body' });
        }

        const { date, title, description, imageBase64 } = req.body;
        
        console.log('🐛 Parsed data:', {
            date: date ? 'EXISTS' : 'MISSING',
            title: title ? 'EXISTS' : 'MISSING', 
            description: description ? 'EXISTS' : 'MISSING',
            imageBase64: imageBase64 ? `EXISTS (${imageBase64.length} chars)` : 'MISSING'
        });

        // Sprawdź GitHub token
        const token = process.env.GITHUB_TOKEN;
        console.log('🐛 GitHub token:', token ? `EXISTS (${token.length} chars)` : 'MISSING');
        
        if (!token) {
            return res.status(500).json({ error: 'GitHub token not configured' });
        }

        // Test GitHub connection
        console.log('🐛 Testing GitHub connection...');
        const octokit = new Octokit({ auth: token });
        
        try {
            const { data: user } = await octokit.rest.users.getAuthenticated();
            console.log('🐛 GitHub user:', user.login);
        } catch (authError) {
            console.error('🐛 GitHub auth error:', authError.message);
            return res.status(500).json({ error: 'GitHub authentication failed', details: authError.message });
        }

        // Test repo access
        console.log('🐛 Testing repo access...');
        try {
            const { data: repo } = await octokit.rest.repos.get({
                owner: 'Flowmaker1337',
                repo: 'calendarProjekt'
            });
            console.log('🐛 Repo access OK:', repo.name);
        } catch (repoError) {
            console.error('🐛 Repo access error:', repoError.message);
            return res.status(500).json({ error: 'Repository access failed', details: repoError.message });
        }

        // Test getting script.js
        console.log('🐛 Getting script.js...');
        try {
            const { data: scriptFile } = await octokit.rest.repos.getContent({
                owner: 'Flowmaker1337',
                repo: 'calendarProjekt',
                path: 'script.js'
            });
            console.log('🐛 Script.js found, size:', scriptFile.size);
            
            const scriptContent = Buffer.from(scriptFile.content, 'base64').toString('utf-8');
            console.log('🐛 Script content length:', scriptContent.length);
            console.log('🐛 Script preview:', scriptContent.substring(0, 200) + '...');
            
        } catch (scriptError) {
            console.error('🐛 Script.js error:', scriptError.message);
            return res.status(500).json({ error: 'Failed to get script.js', details: scriptError.message });
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Debug test completed successfully',
            checks: {
                body: !!req.body,
                data: { date: !!date, title: !!title, description: !!description, image: !!imageBase64 },
                github: { token: !!token, auth: true, repo: true, script: true }
            }
        });

    } catch (error) {
        console.error('🐛 Debug error:', error);
        return res.status(500).json({ 
            error: 'Debug failed', 
            message: error.message,
            stack: error.stack 
        });
    }
}; 