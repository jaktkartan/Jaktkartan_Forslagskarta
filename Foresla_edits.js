function handleSuggestChanges() {
    // Dölj startrutan
    document.getElementById('mainSelection').style.display = 'none';

    // Definiera de GeoJSON-filer som ska laddas in
    const geojsonFiles = {
        'Mässor': ['https://raw.githubusercontent.com/jaktkartan/jaktkartan/main/bottom_panel/Upptack/geojsonfiler/Massor.geojson'],
        'Jaktkort': ['https://raw.githubusercontent.com/jaktkartan/jaktkartan/main/bottom_panel/Upptack/geojsonfiler/jaktkort.geojson'],
        'Jaktskyttebanor': ['https://raw.githubusercontent.com/jaktkartan/jaktkartan/main/bottom_panel/Upptack/geojsonfiler/jaktskyttebanor.geojson']
    };

    // Definiera ikoner och fallback-stilar för varje kategori
    const icons = {
        'Mässor': {
            iconUrl: 'https://raw.githubusercontent.com/jaktkartan/jaktkartan/main/bilder/upptack/ikoner/ikon_massor.png',
            iconSize: [40, 40],
            fallbackStyle: {
                fallbackIconUrl: 'https://raw.githubusercontent.com/jaktkartan/jaktkartan/main/bilder/upptack/ikoner/punkt_massor.png',
                fallbackIconSize: [15, 15]
            }
        },
        'Jaktkort': {
            iconUrl: 'https://raw.githubusercontent.com/jaktkartan/jaktkartan/main/bilder/upptack/ikoner/ikon_jaktkort.png',
            iconSize: [40, 40],
            fallbackStyle: {
                fallbackIconUrl: 'https://raw.githubusercontent.com/jaktkartan/jaktkartan/main/bilder/upptack/ikoner/punkt_jaktkort.png',
                fallbackIconSize: [15, 15]
            }
        },
        'Jaktskyttebanor': {
            iconUrl: 'https://raw.githubusercontent.com/jaktkartan/jaktkartan/main/bilder/upptack/ikoner/ikon_jaktskyttebanor.png',
            iconSize: [40, 40],
            fallbackStyle: {
                fallbackIconUrl: 'https://raw.githubusercontent.com/jaktkartan/jaktkartan/main/bilder/upptack/ikoner/punkt_jaktskyttebanor.png',
                fallbackIconSize: [15, 15]
            }
        }
    };

    // Ladda och lägg till varje GeoJSON-fil på kartan
    for (let category in geojsonFiles) {
        fetch(geojsonFiles[category])
            .then(response => response.json())
            .then(data => {
                L.geoJSON(data, {
                    pointToLayer: function(feature, latlng) {
                        let icon = L.icon({
                            iconUrl: icons[category].iconUrl,
                            iconSize: icons[category].iconSize,
                        });

                        // Skapa en markör med fallback-ikonen om den huvudsakliga ikonen inte kan laddas
                        let marker = L.marker(latlng, { icon: icon }).on('error', function() {
                            this.setIcon(L.icon({
                                iconUrl: icons[category].fallbackStyle.fallbackIconUrl,
                                iconSize: icons[category].fallbackStyle.fallbackIconSize
                            }));
                        });

                        // Lägg till en popup med attribut och ett formulär för att föreslå ändringar
                        marker.on('click', function() {
                            openEditForm(feature.properties);
                        });

                        return marker;
                    }
                }).addTo(map);  // 'map' antas vara den globala Leaflet-kartan definierad i din script.js
            })
            .catch(error => console.error('Fel vid laddning av GeoJSON-fil:', error));
    }
}

function openEditForm(properties) {
    // Rensa eventuell tidigare inmatning i formuläret
    const formContainer = document.getElementById('editFormContainer');
    formContainer.innerHTML = '';

    // Begränsa höjden till 70 % av skärmhöjden och gör den skrollbar vid behov
    formContainer.style.maxHeight = '70vh';
    formContainer.style.overflowY = 'auto';

    // Flytta formuläret längre ned på sidan
    formContainer.style.marginTop = '50px';

    // Lista över fält som ska exkluderas från redigering
    const excludedFields = ["Bild_jaktkort", "id", "Bild_jaktskyttebanor", "Bild_massor", "AKTUALITET"];

    // Skapa ett formulär med befintliga attribut som text och ett fält för föreslagna ändringar
    for (let key in properties) {
        if (excludedFields.includes(key)) {
            continue; // Hoppa över fält som inte ska visas
        }

        const fieldContainer = document.createElement('div');
        fieldContainer.style.marginBottom = '10px';

        const originalLabel = document.createElement('label');
        originalLabel.innerHTML = `<strong>Fält:</strong> ${key}`;

        const originalValueLabel = document.createElement('label');
        originalValueLabel.innerHTML = `<strong>Befintlig text:</strong>`;

        const originalValue = document.createElement('p');
        originalValue.textContent = properties[key];
        originalValue.style.marginBottom = '5px';

        const suggestionLabel = document.createElement('label');
        suggestionLabel.textContent = `Föreslå ändring för ${key}:`;

        const suggestionInput = document.createElement('textarea');
        suggestionInput.name = key;
        suggestionInput.placeholder = 'Föreslå ändring av befintlig text här...';
        suggestionInput.rows = 3;
        suggestionInput.style.width = '100%';

        // Lägg till originaldata och inmatningsfält till det nya fältets container
        fieldContainer.appendChild(originalLabel);
        fieldContainer.appendChild(document.createElement('br')); // Radbrytning
        fieldContainer.appendChild(originalValueLabel);
        fieldContainer.appendChild(originalValue);
        fieldContainer.appendChild(suggestionLabel);
        fieldContainer.appendChild(suggestionInput);

        // Lägg till det nya fältet till formulärcontainern
        formContainer.appendChild(fieldContainer);
    }

    // Lägg till en knapp för att skicka in ändringsförslag
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Föreslå ändringar';
    submitButton.onclick = function() {
        submitEditSuggestions(properties);
    };

    formContainer.appendChild(submitButton);

    // Visa formuläret
    formContainer.style.display = 'block';
}

    // Lägg till en knapp för att skicka in ändringsförslag
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Föreslå ändringar';
    submitButton.onclick = function() {
        submitEditSuggestions(properties);
    };

    formContainer.appendChild(submitButton);

    // Visa formuläret
    formContainer.style.display = 'block';
}

function submitEditSuggestions(originalProperties) {
    const formContainer = document.getElementById('editFormContainer');
    const inputs = formContainer.getElementsByTagName('textarea');
    let suggestions = {};

    // Samla in alla ändringsförslag från formuläret
    for (let input of inputs) {
        const key = input.name;
        const newValue = input.value;

        if (newValue.trim() !== "") {
            suggestions[key] = newValue;
        }
    }

    // Skicka ändringsförslagen till Google Apps Script
    const payload = {
        original: originalProperties,
        suggestions: suggestions
    };

    fetch('https://script.google.com/macros/s/AKfycbyxJ8FVb_D34OWxGyPDj3Jn9xgiNremnHEqBRBxlapdyhvMhShbn_ZwdL-kLMLaE7Jnpw/exec', {
        method: 'POST',
        mode: 'no-cors', // Observera att vi använder no-cors eftersom vi inte förväntar oss ett svar från Google Apps Script.
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then(() => {
        alert('Dina ändringsförslag har skickats.');
        formContainer.style.display = 'none'; // Dölj formuläret efter att det skickats
    }).catch(error => {
        console.error('Fel vid skickning av ändringsförslag:', error);
        alert('Ett fel uppstod vid skickning av ändringsförslag.');
    });
}
