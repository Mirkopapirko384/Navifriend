// --- КОНФИГУРАЦИЯ ---
const firebaseConfig = {
    apiKey: "AIzaSyBv3b5EAmCQ8WX6RIPcZo7SWNm3vd0LCIY",
    authDomain: "navi-friend.firebaseapp.com",
    projectId: "navi-friend",
    storageBucket: "navi-friend.firebasestorage.app",
    messagingSenderId: "1078865505130",
    appId: "1:1078865505130:web:ec21cbb672b102e8b91313",
    measurementId: "G-EQ4ZE73Q1B"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- КАРТА ---
let map = L.map('map').setView([42.6977, 23.3219], 12);
let tempLatLng;

L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© CARTO'
}).addTo(map);

// Зареждане на сигнали от Firebase веднага след старт
function loadSignalsFromCloud() {
    db.collection("signals").onSnapshot((snapshot) => {
        snapshot.docs.forEach(doc => {
            const s = doc.data();
            // Проверка за валидни координати
            if (s.lat && s.lng) {
                L.circleMarker([s.lat, s.lng], {
                    radius: 10, 
                    fillColor: getCategoryColor(s.type), 
                    color: "#fff", 
                    weight: 2, 
                    fillOpacity: 0.8
                }).addTo(map).bindPopup(`<b>${translateType(s.type)}</b><br>${s.desc}<br><small>От: ${s.user || 'Анонимен'}</small>`);
            }
        });
    });
}
loadSignalsFromCloud(); // Стартираме зареждането

// --- АВТЕНТИКАЦИЯ ---
function manualRegister() {
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();

    if (name.length < 3 || !email.includes('@') || pass.length < 6) {
        alert("Моля, попълнете правилно полетата (Парола: мин. 6 символа)!");
        return;
    }

    auth.createUserWithEmailAndPassword(email, pass)
        .then((userCredential) => {
            return userCredential.user.updateProfile({ displayName: name });
        })
        .then(() => enterApp(name))
        .catch(err => {
            if (err.code === 'auth/email-already-in-use') {
                auth.signInWithEmailAndPassword(email, pass).then(res => enterApp(res.user.displayName || name));
            } else { alert(err.message); }
        });
}

function googleSignInReal() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(res => enterApp(res.user.displayName))
        .catch(err => alert("Грешка при Google вход: " + err.message));
}

function enterApp(name) {
    localStorage.setItem('currentUser', name);
    document.getElementById('login-overlay').style.display = 'none';
    updateGreeting(name);
}

function updateGreeting(name) {
    let title = document.querySelector('#header h1');
    if (title) {
        title.innerHTML = `👋 Здравей, ${name}!`;
    }
}

// Автоматична проверка на логнат потребител
auth.onAuthStateChanged((user) => {
    if (user) {
        const name = user.displayName || user.email.split('@')[0];
        enterApp(name); 
    } else {
        document.getElementById('login-overlay').style.display = 'flex';
    }
});

function logout() {
    auth.signOut().then(() => {
        localStorage.removeItem('currentUser');
        location.reload();
    });
}

// --- СИГНАЛИ (ОПРАВЕНО) ---
map.on('click', (e) => {
    tempLatLng = e.latlng;
    // Показваме формата - използваме ID-то от твоя последен скрийншот
    document.getElementById('signal-form').style.display = 'block';
});

function saveSignal() {
    const typeElement = document.getElementById('type');
    const descElement = document.getElementById('desc');

    if (!descElement.value.trim()) {
        alert("Моля, напишете описание!");
        return;
    }

    if (tempLatLng) {
        db.collection('signals').add({
            type: typeElement.value,
            desc: descElement.value,
            lat: tempLatLng.lat,
            lng: tempLatLng.lng,
            user: auth.currentUser ? auth.currentUser.displayName : 'Анонимен',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log("Сигналът е изпратен!");
            closeForm(); // Използваме твоята функция за затваряне
        }).catch(err => {
            console.error("Грешка:", err);
            alert("Грешка при запис.");
        });
    }
}

function closeForm() {
    const form = document.getElementById('signal-form');
    if (form) {
        form.style.display = 'none';
        document.getElementById('desc').value = ''; // Изчистваме текста
    }
}

// --- ПОМОЩНИ ---
function getCategoryColor(t) {
    const colors = { pollution: 'green', road: 'red', nature: 'blue' };
    return colors[t] || 'gray';
}

function translateType(t) {
    const types = { pollution: 'Замърсяване', road: 'Пътна инфраструктура', nature: 'Биоразнобразие' };
    return types[t] || t;
}

function searchAdress() {
    let q = document.getElementById('address-input').value;
    if (!q) return;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}, Sofia`)
        .then(res => res.json())
        .then(data => {
            if (data.length > 0) map.setView([data[0].lat, data[0].lon], 15);
            else alert("Адресът не е намерен!");
        });
}
