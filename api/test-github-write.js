const { Octokit } = require('@octokit/rest');

module.exports = async function handler(req, res) {
    // Włącz CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Ten endpoint akceptuje tylko GET' });
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const REPO_OWNER = 'Flowmaker1337';
    const REPO_NAME = 'calendarProjekt';

    console.log('🔍 Test GitHub Write API called');

    if (!GITHUB_TOKEN) {
        console.error('❌ GITHUB_TOKEN is not configured');
        return res.status(500).json({ error: 'Brak konfiguracji GitHub token' });
    }
    
    console.log('✅ GITHUB_TOKEN jest skonfigurowany');

    try {
        console.log('🔍 Creating Octokit client...');
        const octokit = new Octokit({
            auth: GITHUB_TOKEN,
        });
        console.log('✅ Octokit client created');

        // Test 1: Stwórz prosty plik testowy
        const testFileName = `test-${Date.now()}.txt`;
        const testContent = `Test file created at ${new Date().toISOString()}
        
This is a test file to verify GitHub API write functionality.
Event data would be stored here in real implementation.

Test Event:
- Title: Test Event
- Date: 2024-12-29
- Description: This is a test event created via API
`;

        console.log('🔍 Creating test file:', testFileName);
        await octokit.rest.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: `test-files/${testFileName}`,
            message: `API Test: Create ${testFileName}`,
            content: Buffer.from(testContent).toString('base64'),
        });
        console.log('✅ Test file created successfully');

        // Test 2: Stwórz plik z obrazkiem base64 (symulacja)
        const imageFileName = `test-image-${Date.now()}.txt`;
        const fakeImageContent = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==`;
        
        console.log('🔍 Creating fake image file:', imageFileName);
        await octokit.rest.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: `test-files/${imageFileName}`,
            message: `API Test: Create fake image ${imageFileName}`,
            content: Buffer.from(fakeImageContent).toString('base64'),
        });
        console.log('✅ Fake image file created successfully');

        res.json({
            success: true,
            message: 'GitHub Write API test successful!',
            testFile: testFileName,
            imageFile: imageFileName,
            repoUrl: `https://github.com/${REPO_OWNER}/${REPO_NAME}/tree/main/test-files`,
            note: 'Check the test-files folder in your GitHub repo!'
        });

    } catch (error) {
        console.error('❌ GitHub Write Error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error response:', error.response?.data);
        
        res.status(500).json({
            success: false,
            error: 'GitHub Write API test failed',
            details: error.message,
            status: error.status,
            githubError: error.response?.data?.message || 'Unknown error'
        });
    }
}; 