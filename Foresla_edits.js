// Foresla_edits.js

// Definiera Web App URL på ett ställe
const webAppUrl = 'https://script.google.com/macros/s/AKfycbyxJ8FVb_D34OWxGyPDj3Jn9xgiNremnHEqBRBxlapdyhvMhShbn_ZwdL-kLMLaE7Jnpw/exec';  // Ersätt med din faktiska Web App URL

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
        const label = document.createElement('label');
        label.textContent = key;
        const input = document.createElement('input');
        input.type = 'text';
        input.name = key;
        input.value = properties[key]; // Fyll fältet med befintligt värde

        // Lägg till etikett och inmatningsfält till formuläret
        formContainer.appendChild(label);
        formContainer.appendChild(input);
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

    // Förbered POST-data för att skicka till din Google Apps Script
    let formData = new FormData();
    for (let key in suggestions) {
        formData.append(key, suggestions[key]);
    }
    formData.append('id', originalProperties['id']);  // Om det finns ett ID, skicka det också

    // Skicka ändringsförslagen till Google Apps Script Web App
    fetch(webAppUrl, {  // Använd centraliserad URL-variabel
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(result => {
        console.log('Resultat från servern:', result);
        alert('Dina ändringsförslag har skickats.');
        formContainer.style.display = 'none'; // Dölj formuläret efter att det skickats
    })
    .catch(error => {
        console.error('Fel vid skickning av ändringsförslag:', error);
        alert('Ett fel uppstod vid skickning av dina ändringsförslag.');
    });
}
