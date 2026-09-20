document.addEventListener("DOMContentLoaded", () => {
  const listingLinks = [...document.querySelectorAll("#apartment-list a[data-lat][data-lon]")];
  const map = L.map("apartments-map", {
    zoomControl: true,
    scrollWheelZoom: false,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const bounds = L.latLngBounds();
  listingLinks.forEach((link, index) => {
    const latitude = Number(link.dataset.lat);
    const longitude = Number(link.dataset.lon);
    const address = link.querySelector("strong").textContent;
    const neighbourhood = link.querySelector("small").textContent;
    const number = String(index + 1).padStart(2, "0");
    const icon = L.divIcon({
      className: "apartment-marker-wrap",
      html: `<span class="apartment-marker">${number}</span>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -22],
    });
    const marker = L.marker([latitude, longitude], { icon }).addTo(map);
    marker.bindPopup(`<a class="map-popup" href="${link.href}" target="_blank" rel="noopener"><strong>${address}</strong><span>${neighbourhood}</span><em>Open listing ↗</em></a>`);
    marker.on("click", () => {
      document.querySelectorAll(".apartment-list li").forEach((item) => item.classList.remove("is-active"));
      link.closest("li").classList.add("is-active");
    });
    link.addEventListener("mouseenter", () => marker.openPopup());
    link.addEventListener("focus", () => marker.openPopup());
    bounds.extend([latitude, longitude]);
  });

  map.fitBounds(bounds, { padding: [42, 42], maxZoom: 13 });
});
