// Przykładowe istniejące wydarzenia (te same co w script.js)
let currentEvents = {
    '2024-06-15': {
        title: 'Święto Pierogów',
        image: 'https://images.unsplash.com/photo-1548261504-c092c175b2b8?w=400&h=300&fit=crop',
        description: 'Tradycyjne święto regionalnej kuchni. Degustacja różnorodnych pierogów z całego regionu.',
        coverImage: 'Angel-hugs.png'
    },
    '2024-07-04': {
        title: 'Festiwal Muzyczny',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
        description: 'Duży festiwal muzyczny z udziałem lokalnych i zagranicznych artystów. Koncerty na świeżym powietrzu.'
    },
    '2024-08-12': {
        title: 'Noc Perseidów',
        image: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop',
        description: 'Najlepszy dzień do obserwacji meteorów Perseidów. Piknik astronomiczny pod gwiazdami.'
    }
};

// Załaduj wydarzenia z localStorage (tymczasowe na Vercel)
function loadTempEventsFromStorage() {
    try {
        const tempEvents = JSON.parse(localStorage.getItem('tempEvents') || '{}');
        currentEvents = { ...currentEvents, ...tempEvents };
    } catch (error) {
        console.error('Błąd ładowania z localStorage:', error);
    }
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    loadTempEventsFromStorage(); // Załaduj tymczasowe wydarzenia
    loadExistingEvents();
    setupFileUpload();
    setupForm();
});

// Ładowanie listy istniejących wydarzeń
function loadExistingEvents() {
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '';
    
    Object.entries(currentEvents).forEach(([dateString, event]) => {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        
        const eventInfo = document.createElement('div');
        eventInfo.className = 'event-info';
        
        const eventDate = document.createElement('div');
        eventDate.className = 'event-date';
        eventDate.textContent = formatDateString(dateString);
        
        const eventTitle = document.createElement('div');
        eventTitle.className = 'event-title';
        eventTitle.textContent = event.title;
        
        eventInfo.appendChild(eventDate);
        eventInfo.appendChild(eventTitle);
        eventItem.appendChild(eventInfo);
        
        // Jeśli ma cover image, pokaż miniaturkę
        if (event.coverImage) {
            const eventImage = document.createElement('img');
            eventImage.className = 'event-image';
            eventImage.src = event.coverImage;
            eventImage.alt = event.title;
            eventItem.appendChild(eventImage);
        }
        
        // Przycisk usuwania
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.onclick = () => deleteEvent(dateString);
        eventItem.appendChild(deleteBtn);
        
        eventsList.appendChild(eventItem);
    });
}

// Formatowanie daty dla wyświetlenia
function formatDateString(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    };
    return date.toLocaleDateString('pl-PL', options);
}

// Obsługa preview obrazka
function setupFileUpload() {
    const fileInput = document.getElementById('coverImage');
    const preview = document.getElementById('imagePreview');
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview">
                    <p><strong>Plik:</strong> ${file.name}</p>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
        }
    });
}

// Obsługa formularza
function setupForm() {
    const form = document.getElementById('addEventForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const year = formData.get('year');
        const month = formData.get('month').padStart(2, '0');
        const day = formData.get('day').padStart(2, '0');
        const title = formData.get('title');
        const description = formData.get('description');
        const file = formData.get('coverImage');
        
        const dateString = `${year}-${month}-${day}`;
        
        // Validacja
        if (!file || file.size === 0) {
            showMessage('Musisz wybrać obrazek!', 'error');
            return;
        }
        
        // Pokazanie loading
        const submitBtn = document.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        
        try {
            // Convert file to base64 for V2 endpoint
            const base64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
            
            const requestData = {
                date: dateString,
                title: title,
                description: description,
                imageBase64: base64
            };
            
            console.log('📤 Saving event via V2 endpoint...');
            
            const response = await fetch('/api/save-event-v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = 'Błąd uploadingu';
                
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }
                
                throw new Error(errorMessage);
            }
            
            const result = await response.json();
            console.log('✅ Event saved successfully:', result);
            
            // Dodanie do lokalnej listy z danymi z serwera
            if (result.success && result.event) {
                currentEvents[result.dateString] = result.event;
            }
            
            // Odświeżenie listy
            loadExistingEvents();
            form.reset();
            document.getElementById('imagePreview').innerHTML = '';
            
            showMessage('Wydarzenie zostało dodane do GitHub i wkrótce pojawi się na kalendarzu!', 'success');
            
        } catch (error) {
            console.error('Błąd:', error);
            showMessage('Wystąpił błąd podczas dodawania wydarzenia.', 'error');
        } finally {
            // Ukrycie loading
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    });
}

// Usuwanie wydarzenia
function deleteEvent(dateString) {
    if (confirm('Czy na pewno chcesz usunąć to wydarzenie?')) {
        delete currentEvents[dateString];
        loadExistingEvents();
        showMessage('Wydarzenie zostało usunięte.', 'success');
    }
}

// Pokazywanie wiadomości
function showMessage(text, type) {
    const messageId = type === 'success' ? 'successMessage' : 'errorMessage';
    const messageEl = document.getElementById(messageId);
    
    messageEl.textContent = text;
    messageEl.style.display = 'block';
    
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 4000);
}

// Eksport danych do script.js (do kopiowania)
function exportEventsToScript() {
    const eventsJS = `const events = ${JSON.stringify(currentEvents, null, 4)};`;
    console.log('Skopiuj to do script.js:');
    console.log(eventsJS);
    
    // Opcjonalnie: skopiuj do schowka
    navigator.clipboard.writeText(eventsJS).then(() => {
        showMessage('Kod wydarzeń skopiowany do schowka!', 'success');
    });
}

// Button do eksportu (możesz dodać do HTML)
function addExportButton() {
    const exportBtn = document.createElement('button');
    exportBtn.textContent = '📋 Eksportuj do script.js';
    exportBtn.className = 'submit-btn';
    exportBtn.style.marginTop = '20px';
    exportBtn.onclick = exportEventsToScript;
    
    document.querySelector('.existing-events').appendChild(exportBtn);
}

// Deploy button dla osób nietechnicznych
async function triggerDeploy() {
    const deployBtn = document.getElementById('deployBtn');
    const btnText = deployBtn.querySelector('.btn-text');
    const btnLoading = deployBtn.querySelector('.btn-loading');
    
    // Pokaż loading
    deployBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    
    try {
        console.log('🚀 Starting deployment...');
        showMessage('🚀 Rozpoczynam deployment... To może potrwać 1-2 minuty.', 'success');
        
        const response = await fetch('/api/trigger-deploy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        console.log('🚀 Deploy result:', result);
        
        if (response.ok && result.success) {
            // Sukces!
            showMessage(`✅ Deployment zakończony! Nowy kalendarz: ${result.calendarUrl}`, 'success');
            
            // Pokaż nowe URL-e
            showDeploymentResult(result);
            
        } else {
            // Błąd
            console.error('Deploy error:', result);
            showMessage(`❌ Błąd deployment: ${result.error || result.message}`, 'error');
        }
        
    } catch (error) {
        console.error('Deploy request error:', error);
        showMessage(`❌ Błąd połączenia z deployment API: ${error.message}`, 'error');
    } finally {
        // Ukryj loading
        deployBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

// Pokaż rezultat deployment z nowymi URL-ami
function showDeploymentResult(result) {
    // Usuń poprzedni rezultat jeśli istnieje
    const existingResult = document.getElementById('deploymentResult');
    if (existingResult) {
        existingResult.remove();
    }
    
    // Stwórz nowy div z rezultatem
    const resultDiv = document.createElement('div');
    resultDiv.id = 'deploymentResult';
    resultDiv.className = 'deployment-result';
    resultDiv.innerHTML = `
        <h3>🎉 Deployment zakończony pomyślnie!</h3>
        <div class="url-container">
            <p><strong>📅 Nowy kalendarz:</strong></p>
            <a href="${result.calendarUrl}" target="_blank" class="url-link">${result.calendarUrl}</a>
            
            <p><strong>✏️ Nowy edytor:</strong></p>
            <a href="${result.editorUrl}" target="_blank" class="url-link">${result.editorUrl}</a>
            
            <p><small>📅 ${result.timestamp}</small></p>
        </div>
        <button onclick="copyUrls('${result.calendarUrl}', '${result.editorUrl}')" class="copy-urls-btn">
            📋 Skopiuj URL-e
        </button>
    `;
    
    // Dodaj CSS style
    resultDiv.style.cssText = `
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
        text-align: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    
    // Dodaj do strony
    document.querySelector('.existing-events').appendChild(resultDiv);
    
    // Scroll do rezultatu
    resultDiv.scrollIntoView({ behavior: 'smooth' });
}

// Skopiuj URL-e do schowka
function copyUrls(calendarUrl, editorUrl) {
    const text = `📅 Kalendarz: ${calendarUrl}\n✏️ Edytor: ${editorUrl}`;
    navigator.clipboard.writeText(text).then(() => {
        showMessage('📋 URL-e skopiowane do schowka!', 'success');
    }).catch(() => {
        showMessage('❌ Nie udało się skopiować', 'error');
    });
}

// Dodaj deploy button
function addDeployButton() {
    const deployBtn = document.createElement('button');
    deployBtn.id = 'deployBtn';
    deployBtn.className = 'submit-btn';
    deployBtn.style.marginTop = '20px';
    deployBtn.style.backgroundColor = '#FF6B35';
    deployBtn.style.color = 'white';
    deployBtn.onclick = triggerDeploy;
    
    deployBtn.innerHTML = `
        <span class="btn-text">🚀 Zaktualizuj Kalendarz Online</span>
        <span class="btn-loading" style="display: none;">
            <span class="spinner"></span> Deployment w toku...
        </span>
    `;
    
    document.querySelector('.existing-events').appendChild(deployBtn);
    
    // Dodaj opis
    const description = document.createElement('p');
    description.style.cssText = `
        font-size: 14px;
        color: #666;
        margin-top: 10px;
        text-align: center;
        font-style: italic;
    `;
    description.textContent = 'Użyj tego przycisku po dodaniu wydarzeń, żeby zaktualizować publiczny kalendarz';
    document.querySelector('.existing-events').appendChild(description);
}

// Debug upload functionality
async function debugUpload() {
    try {
        const formData = new FormData(document.getElementById('addEventForm'));
        const year = formData.get('year');
        const month = formData.get('month').padStart(2, '0');
        const day = formData.get('day').padStart(2, '0');
        const title = formData.get('title');
        const description = formData.get('description');
        const file = formData.get('coverImage');
        
        const dateString = `${year}-${month}-${day}`;
        
        if (!file || file.size === 0) {
            console.log('🐛 No file selected');
            return;
        }
        
        // Convert file to base64
        const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
        
        const requestData = {
            date: dateString,
            title: title,
            description: description,
            imageBase64: base64
        };
        
        console.log('🐛 Sending debug request:', requestData);
        
        const response = await fetch('/api/debug-upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        console.log('🐛 Debug response:', result);
        
        if (response.ok) {
            showMessage('Debug test completed - check console', 'success');
        } else {
            showMessage(`Debug error: ${result.error}`, 'error');
        }
        
    } catch (error) {
        console.error('🐛 Debug error:', error);
        showMessage(`Debug failed: ${error.message}`, 'error');
    }
}

// Dodaj przycisk debug
function addDebugButton() {
    const debugBtn = document.createElement('button');
    debugBtn.textContent = '🐛 Debug Upload';
    debugBtn.className = 'submit-btn';
    debugBtn.type = 'button';
    debugBtn.style.marginTop = '10px';
    debugBtn.style.backgroundColor = '#ff6b6b';
    debugBtn.onclick = debugUpload;
    
    document.querySelector('.existing-events').appendChild(debugBtn);
}

// Test nowego endpointa V2
async function testV2Upload() {
    try {
        const formData = new FormData(document.getElementById('addEventForm'));
        const year = formData.get('year');
        const month = formData.get('month').padStart(2, '0');
        const day = formData.get('day').padStart(2, '0');
        const title = formData.get('title');
        const description = formData.get('description');
        const file = formData.get('coverImage');
        
        const dateString = `${year}-${month}-${day}`;
        
        if (!file || file.size === 0) {
            console.log('🧪 No file selected');
            return;
        }
        
        // Convert file to base64
        const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        });
        
        const requestData = {
            date: dateString,
            title: title,
            description: description,
            imageBase64: base64
        };
        
        console.log('🧪 Testing V2 endpoint:', requestData);
        
        const response = await fetch('/api/save-event-v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        console.log('🧪 V2 Response:', result);
        
        if (response.ok) {
            showMessage('✅ V2 Test SUCCESS! Event saved!', 'success');
        } else {
            showMessage(`❌ V2 Test failed: ${result.error}`, 'error');
        }
        
    } catch (error) {
        console.error('🧪 V2 Test error:', error);
        showMessage(`❌ V2 Test failed: ${error.message}`, 'error');
    }
}

// Dodaj przycisk V2 test
function addV2TestButton() {
    const v2Btn = document.createElement('button');
    v2Btn.textContent = '🧪 Test V2 Save';
    v2Btn.className = 'submit-btn';
    v2Btn.type = 'button';
    v2Btn.style.marginTop = '10px';
    v2Btn.style.backgroundColor = '#4CAF50';
    v2Btn.onclick = testV2Upload;
    
    document.querySelector('.existing-events').appendChild(v2Btn);
}

// Dodaj przyciski po załadowaniu
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        addExportButton();
        addDeployButton();
    }, 1000);
}); 