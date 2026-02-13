const socket = io(); // initialize socket

// Default location if geolocation is denied (Kathmandu example)
const defaultLat = 27.7172;
const defaultLng = 85.3240;

// Initialize map
const map = L.map("map").setView([defaultLat, defaultLng], 13);

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Padmodaya Public Secondary School"
}).addTo(map);

// Marker storage
const markers = {};

// Function to update marker
function updateMarker(id, lat, lng) {
    if (markers[id]) {
        markers[id].setLatLng([lat, lng]);
    } else {
        markers[id] = L.marker([lat, lng]).addTo(map);
    }
}

// Watch for location updates from this user
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;

            // Emit location to server
            socket.emit("send-location", { latitude, longitude });

            // Update own marker
            updateMarker("me", latitude, longitude);

            // Optionally recenter map on first location
            if (!map._userLocated) {
                map.setView([latitude, longitude], 13);
                map._userLocated = true;
            }
        },
        (error) => {
            if (error.code === error.PERMISSION_DENIED) {
                console.warn("User denied geolocation. Showing default location.");
            } else if (error.code === error.POSITION_UNAVAILABLE) {
                console.error("Location unavailable");
            } else if (error.code === error.TIMEOUT) {
                console.error("Location request timed out");
            } else {
                console.error("Unknown geolocation error:", error);
            }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

// Listen for other users’ locations
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;
    updateMarker(id, latitude, longitude);
});
