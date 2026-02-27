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

// Зареждане на сигнали от Firebase
function loadSignalsFromCloud() {
    db.collection("signals").onSnapshot((snapshot) => {
        snapshot.docs.forEach(doc => {
            const s = doc.data();
            L.circleMarker([s.lat, s.lng], {
                radius: 10, fillColor: getCategoryColor(s.type), color: "#fff", weight: 2, fillOpacity: 0.8
            }).addTo(map).bindPopup(`<b>${translateType(s.type)}</b><br>${s.desc}<br><small>От: ${s.user}</small>`);
        });
    });
}

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
                auth.signInWithEmailAndPassword(email, pass).then(res => enterApp(res.user.displayName));
            } else { alert(err.message); }
        });
}

function googleSignInReal() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(res => enterApp(res.user.displayName).catch(err => alert(err.message)));
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

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
       
        const name = user.displayName || user.email.split('@')[0];
        enterApp(name); 
        console.log("Автоматичен вход за:", user.email);
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

// --- СИГНАЛИ ---
map.on('click', (e) => {
    tempLatLng = e.latlng;
    document.getElementById('signal-form').style.display = 'block';
    document.getElementById('header').classList.add('header-hidden');
});

function saveSignal() {
    const type = document.getElementById('type').value;
    const desc = document.getElementById('desc').value;

    if (desc && tempLatLng) {
        db.collection('signals').add({
            type, desc, lat: tempLatLng.lat, lng: tempLatLng.lng,
            user: auth.currentUser ? auth.currentUser.displayName : 'Анонимен',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => closeForm());
    }
}

function closeForm() {
    document.getElementById('signal-form').style.display = 'none';
    document.getElementById('desc').value = '';
}

// --- ПОМОЩНИ ---
function getCategoryColor(t) {
    return t === 'pollution' ? 'green' : t === 'road' ? 'red' : t === 'nature' ? 'blue' : 'gray';
}

function translateType(t) {
    const map = { pollution: 'Замърсяване', road: 'Пътна инфраструктура', nature: 'Биоразнобразие' };
    return map[t] || t;
}

function searchAdress() {
    let q = document.getElementById('address-input').value;
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}, Sofia`)
        .then(res => res.json()).then(data => {
            if (data.length > 0) map.setView([data[0].lat, data[0].lon], 15);
        });
}

window.onload = () => {
    let user = localStorage.getItem('currentUser');
    if (user){
        document.getElementById('login-overlay').style.display = 'none';
        updateGreeting(user);
    } 
    
};

function closeSignalMenu() {
    document.getElementById('add-signal-menu').style.display = 'none';
}

function saveSignal() {
let type = document.getElementById('problem-type').value;
let desc = document.getElementById('textarea').value;

if (desc.trim() === '') {
alert('Моля, опишете проблема!');
return;
}

console.log("Запазване на сигнал:", type, desc);

alert('Сигналът е запазен! Благодарим за вашето участие.');
closeSignalMenu();
}
