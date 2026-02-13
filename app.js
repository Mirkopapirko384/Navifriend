let map = L.map('map').setView([42.6977, 23.3219], 12);
let tempLatLng; 

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO'
}).addTo(map);

let savedSignals = JSON.parse(localStorage.getItem('signals')) || [];


function searchAdress() {
    let query = document.getElementById('address-input').value;
    if(!query) return;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}, Sofia`)
    .then(response => response.json())
    .then(data => {
        if(data.length > 0) {
            let location = data[0];
            map.setView([location.lat, location.lon], 15);
        }
        else {
            alert("Адресът не беше намерен. Моля, опитайте отново.");
        }
    });
}

function loadMarkers() {
    savedSignals.forEach(function(signal) {
        let markerColor = getCategoryColor(signal.type);
        L.circleMarker([signal.lat, signal.lng], {
            radius: 10,
            fillColor: markerColor,
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map)
          .bindPopup(`<b>Тип: ${translateType(signal.type)}</b><br>${signal.desc}`);
    });
}

loadMarkers();

function onMapClick(e) {
    let header = document.getElementById('header');
    if(header){
        header.classList.add('header-hidden');
    }

    tempLatLng = e.latlng;
    let form = document.getElementById('signal-form');
    if(form){
        form.style.display = 'block';
    }
}

map.on('click', onMapClick);

function saveSignal() {
    let type = document.getElementById('type').value;
    let desc = document.getElementById('desc').value;

    if (desc && tempLatLng) {
        let markedColor = getCategoryColor(type);

        L.circleMarker(tempLatLng, {
            radius: 10,
            fillColor: markedColor,
            color: "#fff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map)
          .bindPopup(`<b>Тип: ${translateType(type)}</b><br>${desc}`)
          .openPopup();

        let newSignal = {
            lat: tempLatLng.lat,
            lng: tempLatLng.lng,
            type: type,
            desc: desc
        };
        savedSignals.push(newSignal);
        localStorage.setItem('signals', JSON.stringify(savedSignals));

        closeForm();
    }
    else {
        alert("Моля, въведете описание на сигналите.");
    }
}

function closeForm() {
    document.getElementById('signal-form').style.display = 'none';
    document.getElementById('desc').value = '';
}

function getCategoryColor(type) {
    if(type === 'pollution') return 'green';
    if(type === 'road') return 'red';
    if(type === 'nature') return 'blue';
    return 'gray';
}

function translateType(type) {
    if(type === 'pollution') return 'Замърсяване';
    if(type === 'road') return 'Пътна инфраструктура';
    if(type === 'nature') return 'Биоразнобразие';
    return type;
}


window.onload = function() {
    let savedUser = localStorage.getItem('currentUser');
    if(savedUser) {
        let overlay = document.getElementById('login-overlay');
        if(overlay) overlay.style.display = 'none';
        upadateHeaderWithUser(savedUser);
    }
};

function login() {
    
    let nameInput = document.getElementById('username-input') || document.getElementById('usermname-input');
    let name = nameInput.value;

    if(name.length > 2) {
        localStorage.setItem('currentUser', name);
        document.getElementById('login-overlay').style.display = 'none'; // Поправено sttyle
        upadateHeaderWithUser(name);
    }
    else {
        alert("Моля, въведете валидно име.");
    }
}

function upadateHeaderWithUser(name) {
    let welcomeMsg = document.querySelector('#header h1');
    if(welcomeMsg) {
        welcomeMsg.innerText = `👋 Здравей, ${name}!`;
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

function googleSignInFake() {
    const googleUser = {
        name: "Тестов Потребител",
        email: "user@gmail.com",
        imageUrl: "https://via.placeholder.com/50"
    }

    console.log('ID: Симулиране ID');
    console.log('Name: ' + googleUser.name);
    console.log('ImageUrl: ' + googleUser.imageUrl);
    console.log('Email:' + googleUser.email);

    localStorage.setItem('currentUser', googleUser.name);
    document.getElementById('login-overlay').style.display = 'none';
    upadateHeaderWithUser(googleUser.name);
}

function signOut() {
    console.log('Употребителят е излязъл от системата.');
    localStorage.removeItem('currentUser');
    location.reload();
}

function registerUser() {
    let name = document.getElementById('reg-name').value;
    if (name.length > 2) {
        completeLogin(name, "https://via.placeholder.com/40");
    } else {
        alert("Моля, въведете валидно име.");
    }
}

function handleGoogleLogin() {
    let simulatedName = "Потребител от Google"; 
    let simulatedAvatar = "https://www.gstatic.com/images/branding/product/2x/avatar_square_blue_120dp.png";
    
    console.log('ID: 123456'); 
    console.log('Name: ' + simulatedName);
    
    completeLogin(simulatedName, simulatedAvatar);
}

function completeLogin(name, avatar) {
    localStorage.setItem('currentUser', name);
    localStorage.setItem('userAvatar', avatar);
    
    document.getElementById('login-overlay').style.display = 'none';
    upadateHeaderWithUser(name);
}

window.addEventListener('load', function() {
    let user = localStorage.getItem('currentUser');
    if (!user) {
        document.getElementById('login-overlay').style.display = 'flex';
    } else {
        document.getElementById('login-overlay').style.display = 'none';
        upadateHeaderWithUser(user);
    }
});

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userAvatar');

    console.log('Потребителят е излязъл от системата.');
    location.reload();
}

window.onload = function() {
    const user = this.localStorage.getItem('currentUser');
    if (user) {
        document.getElementById('login-overlay').style.display = 'flex';
    }
    else {
        document.getElementById('login-overlay').style.display = 'none';
        upadateGreeating(user);
    }
};

function manualRequest() {
    const name = document.getElementById('reg-username').value;
if (name.length > 2) {
    saveUserAndEnter(name);
}
else {
    alert("Моля, въведете поне 3 символа.");
}
}

function saveUserAndEnter(name) {
    localStorage.setItem('currentUser', name);
    document.getElementById('login-overlay').style.display = 'none';
    upadateGreeting(name);
}

function upadateGreeting(name) {
    const tile = document.querySelector('#header h1');
    if (tile) {
        title.innerText = `👋 Здравей, ${name}!`;
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    console.log('Потребителят е излязъл от системата.');
    location.reload();
}

function manualRegister() {
    console.log("Бутонът за  регистрация е натиснат.");
    
    let nameInput = document.getElementById('reg-username');
    if (!nameInput) {
        console.error("Eлементът с ID 'reg-username' не е намерен.");
        return;
    }

    let name = nameInput.value.trim();

    if (name.length >= 3) {
        saveUserAndEnter(name);
    }
    else {
        alert("Моля, въведете поне 3 символа.");
    }
}

function saveUserAndEnter(name) {
    localStorage.setItem('currentUser', name);

    let overlay = document.getElementById('login-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }

    upadateGreeting(name);
    console.log("Потребителят е записан: " + name);
}

function upadateGreeting(name) {
    let title = document.querySelector('#header h1');
    if (title) {
        title.innerHTML = `👋 Здравей, ${name}!`;
    }
}

window.addEventListener('load', function() {
    let user = localStorage.getItem('currentUser');
    let overlay = document.getElementById('login-overlay');
    
    if (!user) {
        if (overlay) overlay.style.display = 'flex';
    } else {
        if (overlay) overlay.style.display = 'none';
        updateGreeting(user);
    }
});

function manualRegister() {
    let name = document.getElementById('reg-username').value.trim();
    let email = document.getElementById('reg-email').value.trim();
    let pass = document.getElementById('reg-password').value.trim();

    if (name.length < 3 || email.length < 5 || pass.length < 4) {
       alert("Моля, попълнете всички полета правилно.(Парола: мин. 4 символа)!");
         return;
    }
     
    if (!email.includes('@')) {
        alert("Моля, въведете валиден имейл адрес!");
        return;
    }

    saveUserAndEnter(name);
}

function googleSignInFake() {
    let googleName = "Google Потребител";
    let googleEmail = "user@gmail.com";

    console.log('ID: Google_ID_123');
    console.log('Name: ' + googleName);
    console.log('Email: ' + googleEmail);

    saveUserAndEnter(googleName, googleEmail);
}

function saveUserAndEnter(name, email) {
localStorage.setItem('currentUser', name);
localStorage.setItem('userEmail', email);

document.getElementById('login-overlay').style.display = 'none';
upadateGreeting(name);
}

function upadateGreeting(name) {
    let title = document.querySelector('#header h1');
    if (title) {
        title.innerHTML
    }
}
