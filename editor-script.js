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

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
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
            // Symulacja wysłania do serwera
            await uploadEventToServer(formData, dateString, title, description, file);
            
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

// Wysłanie do serwera
async function uploadEventToServer(formData, dateString, title, description, file) {
    const response = await fetch('/api/upload-event', {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd uploadingu');
    }
    
    return await response.json();
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

// Dodaj przycisk eksportu po załadowaniu
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(addExportButton, 1000);
}); 