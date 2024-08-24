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
var selectedIconSrc = '';
var addedObjects = [];
var currentMenu = '';
var markers = []; // Ny array för att hålla koll på alla markörer
var isCourseMode = false; // Flagg för att markera om kursläge är aktiverat

function showNewObjectMenu() {
    hideAllMenus();
    document.getElementById('newObjectMenu').style.display = 'block';
    currentMenu = 'newObject';
    isCourseMode = false; // Återställ kursläget
}

function showAdvertiseMenu() {
    hideAllMenus();
    document.getElementById('advertiseMenu').style.display = 'block';
    currentMenu = 'advertise';
    isCourseMode = true; // Aktivera kursläget
}

function selectType(type, iconSrc) {
    clearFormData();
    closeAllObjectDetails();
    selectedIconSrc = iconSrc;
    document.getElementById('categoryInput').value = type;
    document.getElementById('formTitle').innerText = 'Lägg till ' + type;
    
    var formIcon = document.getElementById('formIcon');
    if (formIcon) {
        formIcon.src = iconSrc;
    }

    hideAllMenus();
    document.getElementById('nameInput').placeholder = 'Namn på ' + type.toLowerCase();
    document.getElementById('urlInput').placeholder = type + ' hemsida/facebook';
    centerMarker.src = iconSrc;
    centerMarkerContainer.style.display = 'block';
    confirmButton.style.display = 'block';  // Visa knappen när användaren har valt en objektstyp
    document.getElementById('cancelBtn').style.display = 'block';
}

function confirmPosition() {
    var center = map.getCenter();
    currentLat = center.lat.toString();
    currentLng = center.lng.toString();

    if (currentLat && currentLng) {
        document.getElementById('latitudeInput').value = currentLat;
        document.getElementById('longitudeInput').value = currentLng;

        var icon = L.icon({
            iconUrl: centerMarker.src,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
        });

        lastMarker = L.marker([currentLat, currentLng], { icon: icon }).addTo(map);
        markers.push(lastMarker); // Lägg till markören i markers arrayen
        centerMarkerContainer.style.display = 'none';
        confirmButton.style.display = 'none';
        
        // Visa inmatningsfälten igen efter att ett nytt objekt har placerats
        openInputForm();
    } else {
        console.error("Kunde inte få tag på latitud och longitud.");
    }
}

function openInputForm() {
    document.getElementById('inputContainer').style.display = 'block';
    document.getElementById('inputForm').style.display = 'block';
    document.getElementById('addObjectBtn').style.display = 'block';
    document.getElementById('cancelBtn').style.display = 'block';
    document.getElementById('addMoreBtn').style.display = 'none';
}

function addObject() {
    var name = document.getElementById('nameInput').value;
    var url = document.getElementById('urlInput').value;
    var info = document.getElementById('infoInput').value;

    if (name.trim() === "") {
        alert("Vänligen ange ett namn för objektet.");
        return;
    }

    addedObjects.push({
        name: name,
        url: url,
        info: info,
        lat: currentLat,
        lng: currentLng,
        category: document.getElementById('categoryInput').value,
        icon: selectedIconSrc
    });

    var addedObjectsList = document.getElementById('addedObjectsList');
    var newObject = document.createElement('div');
    newObject.classList.add('object-tab');
    
    newObject.innerHTML = `
        <div class="object-header">
            <span>${name}</span>
            <img src="${selectedIconSrc}" alt="${name}">
        </div>
        <div class="object-details">
            <p><strong>Namn:</strong> <input type="text" value="${name}" oninput="updateObjectData(${addedObjects.length - 1}, 'name', this.value)"></p>
            <p><strong>URL:</strong> <input type="text" value="${url}" oninput="updateObjectData(${addedObjects.length - 1}, 'url', this.value)"></p>
            <p><strong>Info:</strong> <textarea oninput="updateObjectData(${addedObjects.length - 1}, 'info', this.value)">${info}</textarea></p>
            <button onclick="removeObject(${addedObjects.length - 1}, this)">Ta bort</button>
        </div>
    `;

    // Gör hela fliken klickbar för att expandera
    newObject.onclick = function(event) {
        if (!['INPUT', 'TEXTAREA', 'BUTTON'].includes(event.target.tagName)) {
            toggleObjectDetails(newObject.querySelector('.object-details'));
        }
    };

    addedObjectsList.appendChild(newObject);

    // Ändra titeln till "Lägg till menyn"
    var formTitle = document.getElementById('formTitle');
    if (formTitle) {
        formTitle.innerText = 'Lägg till menyn';
    }

    // Kollapsa inmatningsfälten
    collapseInputContainer();

    // Visa "Lägg till fler objekt"-knappen
    document.getElementById('addMoreBtn').style.display = 'block';
    document.getElementById('submitBtn').style.display = 'block';
    document.getElementById('addObjectBtn').style.display = 'none';
    document.getElementById('cancelBtn').style.display = 'none';

    updateSubmitButton();
}

function removeObject(index, button) {
    // Ta bort markören från kartan
    if (markers[index]) {
        map.removeLayer(markers[index]);
        markers.splice(index, 1); // Ta bort markören från markers arrayen
    }

    // Ta bort objektet från addedObjects arrayen
    addedObjects.splice(index, 1);

    // Ta bort objektet från DOM
    var objectTab = button.closest('.object-tab');
    objectTab.remove();

    updateSubmitButton(); // Uppdatera knappen efter att ett objekt tagits bort
}

function updateSubmitButton() {
    var submitButton = document.getElementById('submitBtn');
    var addedObjectsList = document.getElementById('addedObjectsList');

    if (addedObjectsList.children.length > 0) {
        submitButton.disabled = false;  // Aktivera knappen
        submitButton.style.display = 'block';  // Visa knappen
    } else {
        submitButton.disabled = true;  // Inaktivera knappen
        submitButton.style.display = 'none';  // Dölj knappen om inga objekt finns
    }
}

document.getElementById('submitBtn').onclick = function() {
    if (!this.disabled && confirm("Är du säker på att du vill skicka objekten?")) {
        addedObjects.forEach(function(object) {
            var formData = new FormData();
            formData.append('typ', object.category);
            formData.append('namn', object.name);
            formData.append('url', object.url);
            formData.append('info', object.info);
            formData.append('latitud', object.lat);
            formData.append('longitud', object.lng);

            fetch(newObjectWebAppUrl, {
                method: "POST",
                body: formData,
            }).then(response => {
                if (response.ok) {
                    console.log("Objekt skickades: ", object.name);
                } else {
                    console.error("Fel vid skickning av objekt: ", object.name);
                }
            }).catch(error => {
                console.error("Nätverksfel vid skickning av objekt: ", object.name, error);
            });
        });

        showThankYouMessage();
    }
};

function showThankYouMessage() {
    hideAllMenus();
    document.getElementById('thankYouMessage').style.display = 'block';
}

function addNewSuggestion() {
    location.reload();
}

function goToJaktkartan() {
    window.location.href = 'https://www.jaktkartan.se';
}

function cancelAndRemove() {
    if (lastMarker) {
        map.removeLayer(lastMarker); // Ta bort den senaste markören
        markers.pop(); // Ta bort markören från markers arrayen
        lastMarker = null;
    }

    clearFormData(); // Rensa inmatningsfälten

    // Kontrollera om elementet med id 'formTitle' och 'formIcon' existerar innan du ändrar dem
    var formTitle = document.getElementById('formTitle');
    var formIcon = document.getElementById('formIcon');

    if (formTitle) {
        formTitle.innerText = 'Lägg till menyn'; // Uppdatera rubriken till "Lägg till menyn"
    }
    if (formIcon) {
        formIcon.src = ''; // Ta bort ikonen om det finns en
    }

    // Kollapsa inmatningsfälten
    collapseInputContainer();

    // Dölj både "Lägg till" och "Avbryt"-knapparna
    document.getElementById('addObjectBtn').style.display = 'none';
    document.getElementById('cancelBtn').style.display = 'none';

    // Visa "Lägg till fler objekt"-knappen
    document.getElementById('addMoreBtn').style.display = 'block';
}

function toggleObjectDetails(detailsElement) {
    // Ändra bara det valda objektets synlighet
    if (detailsElement) {
        detailsElement.style.display = detailsElement.style.display === "none" || detailsElement.style.display === "" ? "block" : "none";
        
        // Skrolla så att headern (rubriken och bilden) syns när objektet öppnas
        if (detailsElement.style.display === "block") {
            var headerElement = detailsElement.previousElementSibling;
            headerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

function closeAllObjectDetails() {
    var detailsElements = document.querySelectorAll('.object-details');
    detailsElements.forEach(function(details) {
        details.style.display = 'none';
    });
}

function clearFormData() {
    document.getElementById('nameInput').value = '';
    document.getElementById('urlInput').value = '';
    document.getElementById('infoInput').value = '';
    document.getElementById('latitudeInput').value = '';
    document.getElementById('longitudeInput').value = '';
}

function hideAllMenus() {
    document.getElementById('mainSelection').style.display = 'none';
    document.getElementById('newObjectMenu').style.display = 'none';
    document.getElementById('advertiseMenu').style.display = 'none';
    document.getElementById('inputForm').style.display = 'none';
    document.getElementById('thankYouMessage').style.display = 'none';
}

function showInputFields() {
    // Om kursläge är aktiverat, hoppa direkt till kursalternativet
    if (isCourseMode) {
        selectType('Kurs', 'bilder/kurser_ikon.png');
    } else {
        hideAllMenus();
        document.getElementById('newObjectMenu').style.display = 'block';
    }
}

window.onload = function() {
    hideAllMenus();
    document.getElementById('mainSelection').style.display = 'block';
    updateSubmitButton();
};
