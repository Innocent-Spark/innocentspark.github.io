document.addEventListener("DOMContentLoaded", () => {
  const homeItems = [...document.querySelectorAll("#berlin-home-list li")];
  const map = L.map("berlin-homes-map", { scrollWheelZoom: false });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  const markerRecords = [];
  const bounds = L.latLngBounds();
  homeItems.forEach((item, index) => {
    const link = item.querySelector("a[data-lat][data-lon]");
    const latitude = Number(link.dataset.lat);
    const longitude = Number(link.dataset.lon);
    const fit = item.dataset.fit;
    const name = item.querySelector(".home-topline strong").textContent;
    const area = item.querySelector(".home-area").textContent;
    const price = item.querySelector(".home-facts b").textContent;
    const number = String(index + 1).padStart(2, "0");
    const icon = L.divIcon({
      className: "berlin-marker-wrap",
      html: `<span class="berlin-marker ${fit}">${number}</span>`,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
      popupAnchor: [0, -22],
    });
    const marker = L.marker([latitude, longitude], { icon }).addTo(map);
    marker.bindPopup(`<a class="berlin-popup" href="${link.href}" target="_blank" rel="noopener"><strong>${name}</strong><span>${area}</span><b>${price}</b><em>Open listing ↗</em></a>`);
    marker.on("click", () => {
      homeItems.forEach((home) => home.classList.remove("is-active"));
      item.classList.add("is-active");
    });
    link.addEventListener("mouseenter", () => marker.openPopup());
    link.addEventListener("focus", () => marker.openPopup());
    markerRecords.push({ marker, item });
    bounds.extend([latitude, longitude]);
  });
  map.fitBounds(bounds, { padding: [38, 38] });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-filter]").forEach((candidate) => candidate.classList.remove("is-selected"));
      button.classList.add("is-selected");
      const filter = button.dataset.filter;
      const visibleBounds = L.latLngBounds();
      markerRecords.forEach(({ marker, item }) => {
        const show = filter === "all" || item.dataset.fit === filter;
        item.hidden = !show;
        if (show) {
          marker.addTo(map);
          visibleBounds.extend(marker.getLatLng());
        } else {
          marker.removeFrom(map);
        }
      });
      if (visibleBounds.isValid()) map.fitBounds(visibleBounds, { padding: [38, 38] });
    });
  });
});
