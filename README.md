# 📅 Interactive Calendar with Editor

Interaktywny kalendarz wydarzeń z edytorem do dodawania obrazków jako okładek dni.

## 🚀 Instalacja i Uruchomienie

### 1. Zainstaluj Node.js
Pobierz i zainstaluj Node.js z https://nodejs.org

### 2. Zainstaluj zależności
```bash
npm install
```

### 3. Uruchom serwer
```bash
npm start
```

Lub dla developmentu (auto-restart):
```bash
npm run dev
```

### 4. Otwórz w przeglądarce
- **Kalendarz**: http://localhost:3000
- **Edytor**: http://localhost:3000/editor

## 📋 Funkcjonalności

### Kalendarz (`index.html`)
- ✅ 13 miesięcy (czerwiec 2024 - czerwiec 2025)
- ✅ Alternujący układ (miesiąc po lewej/prawej)
- ✅ Czarny motyw z białymi obramowaniami
- ✅ Scroll reveal animacje
- ✅ Interaktywne dni z wydarzeniami
- ✅ Pop-up z detalami wydarzeń
- ✅ Cover obrazki wystawające poza kratki

### Edytor (`editor.html`)
- ✅ Formularz dodawania wydarzeń
- ✅ Upload obrazków (JPG, PNG, GIF)
- ✅ Preview obrazka przed wysłaniem
- ✅ Lista istniejących wydarzeń
- ✅ Usuwanie wydarzeń
- ✅ Automatyczne umieszenie w kalendarzu

## 🛠️ Jak dodać nowe wydarzenie

1. Otwórz http://localhost:3000/editor
2. Wybierz rok, miesiąc i dzień
3. Wpisz tytuł i opis wydarzenia
4. Wybierz obrazek (będzie okładką dnia)
5. Kliknij "Dodaj do Kalendarza"
6. Obrazek zostanie automatycznie dodany do folderu projektu
7. `script.js` zostanie zaktualizowany
8. Odśwież kalendarz, żeby zobaczyć zmiany

## 📁 Struktura Plików

```
├── index.html          # Główny kalendarz
├── editor.html         # Edytor wydarzeń
├── styles.css          # Style kalendarza
├── editor-styles.css   # Style edytora
├── script.js           # Logika kalendarza
├── editor-script.js    # Logika edytora
├── server.js           # Backend serwer
├── package.json        # Zależności Node.js
├── uploads/            # Folder na przesłane obrazki
└── README.md           # Ta instrukcja
```

## 🎨 Dostosowywanie

### Dodawanie nowych wydarzeń programowo
Edytuj obiekt `events` w `script.js`:
```javascript
const events = {
    '2024-12-25': {
        title: 'Boże Narodzenie',
        description: 'Opis wydarzenia',
        coverImage: 'christmas.jpg', // Opcjonalnie
        image: 'https://example.com/popup-image.jpg'
    }
};
```

### Zmiana kolorów
Edytuj zmienne CSS w `styles.css` i `editor-styles.css`

### Zmiana animacji
Dostosuj transitions w `.cover-image` i innych klasach

## 🔧 API Endpoints

- `POST /api/upload-event` - Dodaj nowe wydarzenie z obrazkiem
- `DELETE /api/delete-event/:dateString` - Usuń wydarzenie
- `GET /uploads/:filename` - Pobierz przesłany obrazek

## ⚠️ Wymagania

- Node.js 14+
- 10MB limit rozmiaru pliku
- Obsługiwane formaty: JPG, PNG, GIF

## 🐛 Rozwiązywanie Problemów

### Błąd "Cannot find module"
```bash
npm install
```

### Błąd uploadu plików
Sprawdź czy folder `uploads/` istnieje i ma uprawnienia do zapisu

### Kalendarz nie pokazuje nowych wydarzeń
Odśwież stronę kalendarza po dodaniu wydarzenia w edytorze

---

Enjoy your interactive calendar! 🎉 