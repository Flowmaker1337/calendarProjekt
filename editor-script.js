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
            // Wysłanie do GitHub via API
            await uploadEventToGitHub(formData, dateString, title, description, file);
            
            // Dodanie do lokalnej listy
            const fileName = `event-${Date.now()}-${file.name}`;
            currentEvents[dateString] = {
                title: title,
                description: description,
                coverImage: fileName,
                image: 'https://images.unsplash.com/photo-1548261504-c092c175b2b8?w=400&h=300&fit=crop'
            };
            
            // Odświeżenie listy
            loadExistingEvents();
            form.reset();
            document.getElementById('imagePreview').innerHTML = '';
            
            showMessage('Wydarzenie zostało dodane do kalendarza!', 'success');
            
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

// Wysłanie do GitHub (trwałe zapisywanie)
async function uploadEventToGitHub(formData, dateString, title, description, file) {
    try {
        const response = await fetch('/api/save-event', {
            method: 'POST',
            body: formData
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
        
        // Jeśli API zwróciło event z obrazem base64, zapisz to w localStorage
        if (result.success && result.event) {
            const tempEvents = JSON.parse(localStorage.getItem('tempEvents') || '{}');
            tempEvents[result.dateString] = result.event;
            localStorage.setItem('tempEvents', JSON.stringify(tempEvents));
            
            // Aktualizuj current events
            currentEvents[result.dateString] = result.event;
        }
        
        return result;
        
    } catch (error) {
        console.error('Błąd API:', error);
        throw error;
    }
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

// Dodaj przyciski po załadowaniu
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        addExportButton();
        addDebugButton();
    }, 1000);
}); 