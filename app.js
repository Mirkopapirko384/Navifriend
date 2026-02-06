const map = L.map('map').setView([42.6977, 23.3219], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);
let reports = [];
let markers = [];
let selectedLatLng = null;
map.on('click', function (e) {
    selectedLatLng = e.latlng;
    alert(`Избрана локация: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
});
document.getElementById('reportForm').addEventListener('submit', function (e) {
    e.preventDefault();

    if (!selectedLatLng) {
        alert("Моля, кликни на картата!");
        return;
    }

    const type = document.getElementById('type').value;
    const danger = document.getElementById('danger').value;
    const description = document.getElementById('description').value;

    const report = {
        type,
        danger,
        description,
        lat: selectedLatLng.lat,
        lng: selectedLatLng.lng
    };

    reports.push(report);
    addMarker(report);
    this.reset();
});
function addMarker(report) {
    const marker = L.marker([report.lat, report.lng])
        .addTo(map)
        .bindPopup(`
            <b>Тип:</b> ${report.type}<br>
            <b>Опасност:</b> ${report.danger}<br>
            <b>Описание:</b> ${report.description}
        `);

    marker.reportType = report.type;
    markers.push(marker);
}
document.getElementById('filter').addEventListener('change', function () {
    const value = this.value;

    markers.forEach(marker => {
        if (value === "all" || marker.reportType === value) {
            map.addLayer(marker);
        } else {
            map.removeLayer(marker);
        }
    });
});
