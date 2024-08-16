var map = L.map('map', {
    scrollWheelZoom: true,
    zoomControl: true
}).setView([62.0, 15.0], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var currentLat, currentLng;
var centerMarker = document.getElementById('centerMarker');
var centerMarkerContainer = document.getElementById('centerMarkerContainer');
var confirmButton = document.getElementById('confirmButton');
var lastMarker = null;
var currentObject = null; // Håller det aktuella objektet som inte är sparat än
var addedObjects = [];

function selectType(type, iconSrc) {
    document.getElementById('categoryInput').value = type;
    document.getElementById('formTitle').innerText = 'Lägg till ' + type;
    document.getElementById('startMessage').style.display = 'none';

    clearFormData(); // Rensa formuläret när ett nytt objekt väljs
    closeAllObjectDetails(); // Stäng alla flikar när ett nytt objekt väljs

    document.getElementById('nameInput').placeholder = 'Namn på ' + type.toLowerCase();
    document.getElementById('urlInput').placeholder = type + ' hemsida/facebook';

    centerMarker.src = iconSrc;
    centerMarkerContainer.style.display = 'block';
    confirmButton.style.display = 'block';  // Se till att knappen visas
}

function confirmPosition() {
    console.log("Placera-knappen klickades"); // För felsökning

    var center = map.getCenter();
    currentLat = center.lat.toString(); // Konvertera till sträng utan att avrunda
    currentLng = center.lng.toString(); // Konvertera till sträng utan att avrunda

    var latitudeInput = document.getElementById('latitudeInput');
    var longitudeInput = document.getElementById('longitudeInput');

    if (latitudeInput && longitudeInput) {
        latitudeInput.value = currentLat;
        longitudeInput.value = currentLng;

        var icon = L.icon({
            iconUrl: centerMarker.src,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
        });

        if (lastMarker) {
            map.removeLayer(lastMarker);
        }

        lastMarker = L.marker([currentLat, currentLng], { icon: icon }).addTo(map);

        centerMarkerContainer.style.display = 'none';
        confirmButton.style.display = 'none';  // Knappen ska försvinna efter bekräftelse

        openInputForm();
    } else {
        console.error("latitudeInput eller longitudeInput kunde inte hittas.");
    }
}

function openInputForm() {
    document.getElementById('inputForm').style.display = 'block';

    // Fyll i latitud och longitud fälten men inte andra fält än
    if (currentLat && currentLng) {
        document.getElementById('latitudeInput').value = currentLat;
        document.getElementById('longitudeInput').value = currentLng;
    }

    // Se till att Avbryt-knappen visas när formuläret är öppet
    document.getElementById('cancelBtn').style.display = 'block';
}

function addObject() {
    // Skapa currentObject först nu när formuläret är ifyllt
    var name = document.getElementById('nameInput').value;
    var url = document.getElementById('urlInput').value || "Ingen URL angiven";
    var info = document.getElementById('infoInput').value;

    if (name && currentLat && currentLng) {
        currentObject = {
            category: document.getElementById('categoryInput').value,
            name: name,
            url: url,
            info: info,
            lat: currentLat,
            lng: currentLng,
            marker: lastMarker // Spara marker referensen för att kunna ta bort den senare
        };

        console.log("Current Object Created:", currentObject); // Logga currentObject

        addedObjects.push(currentObject); // Lägg till det aktuella objektet till arrayen
        addObjectToUI(addedObjects.length - 1); // Lägg till objektet i UI:t
        currentObject = null; // Nollställ det aktuella objektet

        // Uppdatera knappen "Skicka objekt"
        updateSubmitButton();

        // Dölj "Lägg till"-knappen och visa "Lägg till fler objekt"-knappen
        document.getElementById('addObjectBtn').style.display = 'none';
        document.getElementById('addMoreBtn').style.display = 'block';

        // Kollapsa inmatningsformuläret efter att objektet har lagts till
        document.getElementById('inputForm').style.maxHeight = '0';
        document.getElementById('inputForm').style.overflow = 'hidden';
    } else {
        alert("Vänligen fyll i namnet på objektet.");
        return;
    }
}

function addAnotherObject() {
    // Återställ så att användaren kan lägga till en ny punkt
    document.getElementById('startMessage').style.display = 'block';

    // Ta bort den senaste markören men behåll tidigare markerade objekt
    lastMarker = null;

    centerMarkerContainer.style.display = 'block';
    confirmButton.style.display = 'block';  // Gör knappen synlig igen

    // Återställ formuläret för att lägga till ett nytt objekt
    clearFormData();

    // Visa "Lägg till"-knappen igen och dölj "Lägg till fler objekt"-knappen
    document.getElementById('addObjectBtn').style.display = 'block';
    document.getElementById('addMoreBtn').style.display = 'none';

    // Öppna inmatningsformuläret igen
    document.getElementById('inputForm').style.maxHeight = '98%';
    document.getElementById('inputForm').style.overflow = 'auto';
    document.getElementById('inputForm').style.display = 'block';
}

function addObjectToUI(index) {
    var objectData = addedObjects[index];
    var addedObjectsList = document.getElementById('addedObjectsList');
    
    if (addedObjectsList) {
        var listItem = document.createElement('div');
        listItem.className = 'object-tab';
        listItem.innerHTML = `
            <div class="object-header" onclick="toggleObjectDetails(this)">
                <strong>${objectData.category}</strong>: ${objectData.name}
            </div>
            <div class="object-details" style="display: none;">
                <p><strong>Namn:</strong> <input type="text" value="${objectData.name}" style="color: rgb(50, 94, 88);" onchange="updateObjectData(${index}, 'name', this.value)"></p>
                <p><strong>URL:</strong> <input type="text" value="${objectData.url}" style="color: rgb(50, 94, 88);" onchange="updateObjectData(${index}, 'url', this.value)"></p>
                <p><strong>Info:</strong> <textarea style="color: rgb(50, 94, 88);" onchange="updateObjectData(${index}, 'info', this.value)">${objectData.info}</textarea></p>
                <button type="button" onclick="deleteObject(${index}, this)">Ta bort objekt</button>
            </div>
        `;

        addedObjectsList.appendChild(listItem);
        addedObjectsList.style.display = 'block'; // Se till att redigeringsfältet visas
    } else {
        console.error("addedObjectsList element not found");
    }
}

function toggleObjectDetails(headerElement) {
    var details = headerElement.nextElementSibling;
    if (details.style.display === "none") {
        details.style.display = "block";
    } else {
        details.style.display = "none";
    }
}

function closeAllObjectDetails() {
    var detailsElements = document.querySelectorAll('.object-details');
    detailsElements.forEach(function(details) {
        details.style.display = 'none';
    });
}

function updateObjectData(index, field, value) {
    addedObjects[index][field] = value;
}

function deleteObject(index, buttonElement) {
    var objectTab = buttonElement.closest('.object-tab');
    objectTab.parentNode.removeChild(objectTab);

    var object = addedObjects[index];
    if (object.marker) {
        map.removeLayer(object.marker); // Ta bort marker från kartan
    }

    addedObjects.splice(index, 1); // Ta bort objektet från arrayen

    // Uppdatera knappen "Skicka objekt"
    updateSubmitButton();
}

function updateSubmitButton() {
    var submitButton = document.getElementById('submitBtn');
    if (submitButton) {
        submitButton.disabled = addedObjects.length === 0;
    } else {
        console.error("Submit button not found");
    }
}

document.getElementById('suggestionForm').onsubmit = function(event) {
    event.preventDefault();  // Förhindra standard formulärinlämning

    if (addedObjects.length === 0) {
        alert("För att skicka, lägg till ett objekt.");
        return;
    }

    if (confirm("Är du säker på att du vill skicka objekten?")) {
        var suggestionForm = document.getElementById('suggestionForm');

        addedObjects.forEach(function(object) {
            var formData = new FormData();
            formData.append('typ', object.category || 'Ingen typ angiven');
            formData.append('namn', object.name);
            formData.append('url', object.url);
            formData.append('info', object.info);
            formData.append('latitud', object.lat);
            formData.append('longitud', object.lng);

            fetch(suggestionForm.action, {
                method: "POST",
                body: formData,
            }).then(response => {
                return response.text();
            }).then(text => {
                console.log(text);  // Kontrollera svaret från servern
            }).catch(error => {
                console.error('Ett nätverksfel uppstod:', error);
            });
        });

        // Visa tackmeddelandet
        showThankYouMessage();
    }
};

function showThankYouMessage() {
    closeInputForm();  // Stäng inmatningsrutan
    document.getElementById('thankYouMessage').style.display = 'block'; // Visa tackmeddelandet
}

function closeInputForm() {
    document.getElementById('inputForm').style.display = 'none';
}

function cancelAndRemove() {
    if (lastMarker) {
        map.removeLayer(lastMarker);
        lastMarker = null;
    }

    currentObject = null; // Nollställ det aktuella objektet om det avbryts
    clearFormData(); // Rensa formuläret när "Avbryt" klickas

    closeInputForm();
    document.getElementById('startMessage').style.display = 'block';

    // Dölj "Avbryt"-knappen när formuläret stängs
    document.getElementById('cancelBtn').style.display = 'none';
}

function addNewSuggestion() {
    closeThankYouMessage();
    location.reload();  // Laddar om sidan
}

function closeThankYouMessage() {
    document.getElementById('thankYouMessage').style.display = 'none';
}

function goToJaktkartan() {
    window.location.href = 'https://www.jaktkartan.se';
}

function clearFormData() {
    document.getElementById('nameInput').value = '';
    document.getElementById('urlInput').value = '';
    document.getElementById('infoInput').value = '';
    document.getElementById('latitudeInput').value = '';
    document.getElementById('longitudeInput').value = '';
}

window.onload = function() {
    document.getElementById('startMessage').style.display = 'block';
    updateSubmitButton(); // Inaktivera knappen "Skicka objekt" vid start
};
