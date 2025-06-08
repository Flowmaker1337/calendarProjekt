const { Octokit } = require('@octokit/rest');

module.exports = async function handler(req, res) {
    // Włącz CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 'Flowmaker1337';
    const REPO_NAME = 'calendarProjekt';

    console.log('🔍 Testing GitHub configuration...');
    console.log('Token exists:', !!GITHUB_TOKEN);
    console.log('Token length:', GITHUB_TOKEN ? GITHUB_TOKEN.length : 0);
    console.log('Repo owner:', REPO_OWNER);
    console.log('Repo name:', REPO_NAME);

    if (!GITHUB_TOKEN) {
        console.error('❌ GITHUB_TOKEN is not configured');
        return res.status(500).json({ 
            error: 'GITHUB_TOKEN not configured',
            hasToken: false
        });
    }

    try {
        // GitHub API client
        const octokit = new Octokit({
            auth: GITHUB_TOKEN,
        });

        console.log('✅ Octokit client created');

        // Test 1: Get user info
        const userResponse = await octokit.rest.users.getAuthenticated();
        console.log('✅ User authenticated:', userResponse.data.login);

        // Test 2: Get repo info
        const repoResponse = await octokit.rest.repos.get({
            owner: REPO_OWNER,
            repo: REPO_NAME,
        });
        console.log('✅ Repo accessible:', repoResponse.data.name);

        // Test 3: Check if script.js exists
        const scriptResponse = await octokit.rest.repos.getContent({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: 'script.js',
        });
        console.log('✅ script.js accessible');

        res.json({
            success: true,
            message: 'GitHub API test successful',
            user: userResponse.data.login,
            repo: repoResponse.data.name,
            hasScriptJs: true,
            tokenConfigured: true
        });

    } catch (error) {
        console.error('❌ GitHub API Error:', error.message);
        console.error('Error status:', error.status);
        console.error('Error response:', error.response?.data);
        
        res.status(500).json({
            success: false,
            error: 'GitHub API test failed',
            details: error.message,
            status: error.status,
            githubError: error.response?.data?.message || 'Unknown error'
        });
    }
}; 