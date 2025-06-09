// Funkcja do łączenia wydarzeń z script.js i localStorage
function mergeEventsWithLocalStorage() {
    try {
        const tempEvents = JSON.parse(localStorage.getItem('tempEvents') || '{}');
        Object.assign(events, tempEvents);
        console.log('Załadowano tymczasowe wydarzenia z localStorage:', tempEvents);
    } catch (error) {
        console.error('Błąd ładowania z localStorage:', error);
    }
}

// Przykładowe wydarzenia - tutaj możesz dodać więcej
const events = {
    "2024-06-15": {
        "title": "Święto Pierogów",
        "image": "https://images.unsplash.com/photo-1548261504-c092c175b2b8?w=400&h=300&fit=crop",
        "description": "Tradycyjne święto regionalnej kuchni. Degustacja różnorodnych pierogów z całego regionu.",
        "coverImage": "Angel-hugs.png"
    },
    "2024-07-04": {
        "title": "Festiwal Muzyczny",
        "image": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
        "description": "Duży festiwal muzyczny z udziałem lokalnych i zagranicznych artystów. Koncerty na świeżym powietrzu."
    },
    "2024-08-12": {
        "title": "Noc Perseidów",
        "image": "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop",
        "description": "Najlepszy dzień do obserwacji meteorów Perseidów. Piknik astronomiczny pod gwiazdami."
    },
    "2024-09-23": {
        "title": "Równonoc Jesienna",
        "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        "description": "Oficjalne rozpoczęcie jesieni astronomicznej. Spacer po parku z przewodnikiem przyrodniczym."
    },
    "2024-10-31": {
        "title": "Halloween",
        "image": "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=300&fit=crop",
        "description": "Tradycyjne święto Halloween z kostiumami, cukierkami i straszną zabawą dla całej rodziny."
    },
    "2024-12-25": {
        "title": "Boże Narodzenie",
        "image": "https://images.unsplash.com/photo-1512389098783-66b81f86e199?w=400&h=300&fit=crop",
        "description": "Najważniejsze święto chrześcijan. Czas spędzany z rodziną przy świątecznym stole."
    },
    "2025-01-01": {
        "title": "Nowy Rok",
        "image": "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&h=300&fit=crop",
        "description": "Powitanie Nowego Roku 2025. Fajerwerki, postanowienia noworoczne i nowe początki."
    },
    "2025-02-14": {
        "title": "Walentynki",
        "image": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=300&fit=crop",
        "description": "Święto zakochanych. Romantyczne kolacje, prezenty i wyrazy miłości."
    },
    "2025-03-20": {
        "title": "Równonoc Wiosenna",
        "image": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop",
        "description": "Oficjalne rozpoczęcie wiosny astronomicznej. Warsztat ogrodniczy dla początkujących."
    },
    "2025-04-22": {
        "title": "Dzień Ziemi",
        "image": "https://images.unsplash.com/photo-1569163139178-de081c9e86c5?w=400&h=300&fit=crop",
        "description": "Światowy Dzień Ziemi. Akcje ekologiczne, sadzenie drzew i wykłady o ochronie środowiska."
    },
    "2025-05-15": {
        "title": "Festiwal Kwiatów",
        "image": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=300&fit=crop",
        "description": "Wiosenny festiwal kwiatów. Pokazy florystyczne, konkursy ogrodnicze i targi roślin."
    },
    "2024-06-05": {
        "title": "test",
        "description": "test",
        "coverImage": "images/events/event-1749406391425.png",
        "image": "https://images.unsplash.com/photo-1548261504-c092c175b2b8?w=400&h=300&fit=crop"
    },
    "2025-04-26": {
        "title": "London Meetup",
        "description": "Tutaj będzie opis. Dwa - trzy zdania opisujące to niesamowite wydarzenie :) ",
        "coverImage": "images/events/event-1749461217814.png",
        "image": "https://images.unsplash.com/photo-1548261504-c092c175b2b8?w=400&h=300&fit=crop"
    },
    "2025-03-03": {
        "title": "Amanda joined the discord",
        "description": "Opis",
        "coverImage": "images/events/event-1749461397388.png",
        "image": "https://images.unsplash.com/photo-1548261504-c092c175b2b8?w=400&h=300&fit=crop"
    },
    "2024-06-03": {
        "title": "Discord day one",
        "description": "Opis",
        "coverImage": "images/events/event-1749462942664.png",
        "image": "https://images.unsplash.com/photo-1548261504-c092c175b2b8?w=400&h=300&fit=crop"
    },
    "2024-06-26": {
        "title": "Random",
        "description": "",
        "coverImage": "images/events/event-1749473184866.png",
        "image": "https://images.unsplash.com/photo-1548261504-c092c175b2b8?w=400&h=300&fit=crop"
    },
    "2024-06-01": {
        "title": "test",
        "description": "test",
        "coverImage": "images/events/event-1749473949822.png",
        "image": "https://images.unsplash.com/photo-1548261504-c092c175b2b8?w=400&h=300&fit=crop"
    }
};

// Nazwy miesięcy po angielsku
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Nazwy dni tygodnia po angielsku
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Funkcja do generowania kalendarza dla konkretnego miesiąca
function generateCalendar(year, month, isLeftLayout = true) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Poniedziałek = 0

    const calendarDiv = document.createElement('div');
    calendarDiv.className = `month-calendar ${isLeftLayout ? 'left-layout' : 'right-layout'}`;

    // Nagłówek miesiąca
    const header = document.createElement('div');
    header.className = 'month-header';
    header.textContent = `${monthNames[month]} ${year}`;

    // Kontener dla kalendarza
    const calendarContainer = document.createElement('div');
    calendarContainer.className = 'calendar-container';

    // Siatka kalendarza
    const grid = document.createElement('div');
    grid.className = 'calendar-grid';
    
    // Obliczanie ile tygodni potrzebujemy
    const totalDayCells = startingDayOfWeek + daysInMonth;
    const weeksNeeded = Math.ceil(totalDayCells / 7);
    
    // Dynamiczne ustawienie grid-template-rows
    grid.style.gridTemplateRows = `60px repeat(${weeksNeeded}, 1fr)`;

    // Nagłówki dni tygodnia
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        grid.appendChild(dayHeader);
    });

    // Puste komórki na początku miesiąca
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell other-month';
        
        // Dodajemy dni z poprzedniego miesiąca
        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();
        const prevDayNumber = prevMonthLastDay - startingDayOfWeek + i + 1;
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = prevDayNumber;
        emptyCell.appendChild(dayNumber);
        
        grid.appendChild(emptyCell);
    }

    // Dni aktualnego miesiąca
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day-cell';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayCell.appendChild(dayNumber);

        // Sprawdzanie czy ten dzień ma wydarzenie
        const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (events[dateString]) {
            dayCell.classList.add('has-event');
            
            // Jeśli ma obrazek okładki, dodaj go jako element img
            if (events[dateString].coverImage) {
                dayCell.classList.add('has-cover-image');
                
                const coverImg = document.createElement('img');
                coverImg.src = events[dateString].coverImage;
                coverImg.className = 'cover-image';
                coverImg.alt = events[dateString].title;
                dayCell.appendChild(coverImg);
                
                console.log(`Dodano obrazek dla dnia ${dateString}: ${events[dateString].coverImage}`);
            }
            
            const indicator = document.createElement('div');
            indicator.className = 'event-indicator';
            dayCell.appendChild(indicator);
            
            // Dodawanie event listenera
            dayCell.addEventListener('click', () => {
                showEventModal(events[dateString], dateString);
            });
        }

        grid.appendChild(dayCell);
    }

    // Dodajemy dni z następnego miesiąca tylko jeśli potrzebne do uzupełnienia tygodnia
    const totalCellsNeeded = weeksNeeded * 7;
    const nextMonthDays = totalCellsNeeded - totalDayCells;
    
    for (let i = 1; i <= nextMonthDays; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell other-month';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = i;
        emptyCell.appendChild(dayNumber);
        
        grid.appendChild(emptyCell);
    }

    calendarContainer.appendChild(grid);
    calendarDiv.appendChild(header);
    calendarDiv.appendChild(calendarContainer);
    return calendarDiv;
}

// Funkcja do wyświetlania modala z wydarzeniem
function showEventModal(event, dateString) {
    const modal = document.getElementById('event-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDate = document.getElementById('modal-date');
    const modalDescription = document.getElementById('modal-description');

    modalImage.src = event.image;
    modalTitle.textContent = event.title;
    
    // Formatowanie daty
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    modalDate.textContent = date.toLocaleDateString('en-US', options);
    modalDescription.textContent = event.description;

    modal.style.display = 'block';
}

// Funkcja do zamykania modala
function closeModal() {
    const modal = document.getElementById('event-modal');
    modal.style.display = 'none';
}

// Generowanie wszystkich kalendarzy od czerwca 2024 do czerwca 2025
function generateAllCalendars() {
    const container = document.getElementById('calendar-container');
    let isLeftLayout = true;
    let monthIndex = 0;
    
    // Czerwiec 2024 - Grudzień 2024
    for (let month = 5; month <= 11; month++) {
        const calendar = generateCalendar(2024, month, isLeftLayout);
        calendar.style.transitionDelay = `${monthIndex * 0.1}s`;
        container.appendChild(calendar);
        isLeftLayout = !isLeftLayout; // Alternowanie układu
        monthIndex++;
    }
    
    // Styczeń 2025 - Czerwiec 2025
    for (let month = 0; month <= 5; month++) {
        const calendar = generateCalendar(2025, month, isLeftLayout);
        calendar.style.transitionDelay = `${monthIndex * 0.1}s`;
        container.appendChild(calendar);
        isLeftLayout = !isLeftLayout; // Alternowanie układu
        monthIndex++;
    }
}

// Funkcja do obsługi animacji scroll reveal
function initScrollReveal() {
    const monthCalendars = document.querySelectorAll('.month-calendar');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    monthCalendars.forEach(calendar => {
        observer.observe(calendar);
    });
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    // Załaduj tymczasowe wydarzenia z localStorage
    mergeEventsWithLocalStorage();
    
    generateAllCalendars();
    
    // Inicjalizacja scroll reveal po wygenerowaniu kalendarzy
    setTimeout(() => {
        initScrollReveal();
    }, 100);
    
    // Obsługa zamykania modala
    const closeBtn = document.querySelector('.close');
    const modal = document.getElementById('event-modal');
    
    closeBtn.addEventListener('click', closeModal);
    
    // Zamykanie modala po kliknięciu poza nim
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Zamykanie modala klawiszem Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
}); 