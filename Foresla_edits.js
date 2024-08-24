// Foresla_edits.js

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

    // Skapa ett formulär med befintliga attribut som textfält
    for (let key in properties) {
        const fieldContainer = document.createElement('div');
        fieldContainer.style.marginBottom = '10px';

        const label = document.createElement('label');
        label.textContent = key;

        const input = document.createElement('input');
        input.type = 'text';
        input.name = key;
        input.value = properties[key]; // Fyll fältet med befintligt värde
        input.placeholder = 'Föreslagen ändring'; // Lägg till "Föreslagen ändring" som placeholder

        // Lägg till etikett och inmatningsfält till det nya fältets container
        fieldContainer.appendChild(label);
        fieldContainer.appendChild(input);

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

function submitEditSuggestions(originalProperties) {
    const formContainer = document.getElementById('editFormContainer');
    const inputs = formContainer.getElementsByTagName('input');
    let suggestions = {};

    // Samla in alla ändringsförslag från formuläret
    for (let input of inputs) {
        const key = input.name;
        const newValue = input.value;

        if (newValue !== originalProperties[key]) {
            suggestions[key] = newValue;
        }
    }

    console.log('Föreslagna ändringar:', suggestions);

    // Här kan du lägga till kod för att skicka ändringsförslagen till en server eller spara dem lokalt.
    alert('Dina ändringsförslag har registrerats.');
    formContainer.style.display = 'none'; // Dölj formuläret efter att det skickats
}

