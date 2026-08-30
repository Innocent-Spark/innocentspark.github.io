document.addEventListener("DOMContentLoaded", async () => {
  const boundaryResponse = await fetch("/assets/toronto/neighbourhoods.geojson");
  const boundaries = await boundaryResponse.json();

  const boundaryStyle = {
    color: "#244f3e",
    weight: 2,
    opacity: 0.95,
    fillColor: "#d8a65f",
    fillOpacity: 0.32,
  };

  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileOptions = {
    maxZoom: 18,
    attribution: "&copy; OpenStreetMap contributors",
  };

  const overview = L.map("toronto-overview-map", {
    zoomControl: false,
    scrollWheelZoom: false,
  });
  L.tileLayer(tileUrl, tileOptions).addTo(overview);
  const overviewBoundaries = L.geoJSON(boundaries, { style: boundaryStyle }).addTo(overview);
  overview.fitBounds(overviewBoundaries.getBounds(), { padding: [18, 18] });

  document.querySelectorAll(".area-card").forEach((card) => {
    const summary = card.querySelector("summary");
    const wanted = summary.dataset.boundaries.split(",");
    const mapElement = card.querySelector(".mini-map");
    const map = L.map(mapElement, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      tap: false,
    });
    L.tileLayer(tileUrl, tileOptions).addTo(map);
    const layer = L.geoJSON(boundaries, {
      filter: (feature) => wanted.includes(feature.properties.name),
      style: boundaryStyle,
    }).addTo(map);
    map.fitBounds(layer.getBounds(), { padding: [12, 12] });

    const seenLocations = new Set();
    card.querySelectorAll("[data-lat][data-lon]").forEach((media) => {
      const latitude = Number(media.dataset.lat);
      const longitude = Number(media.dataset.lon);
      const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
      if (seenLocations.has(key)) return;
      seenLocations.add(key);
      L.circleMarker([latitude, longitude], {
        radius: 3.5,
        color: "#fffaf0",
        weight: 1.5,
        fillColor: "#b66b36",
        fillOpacity: 1,
      }).addTo(map);
    });

    card.addEventListener("toggle", () => {
      window.setTimeout(() => map.invalidateSize(), 50);
      if (!card.open) return;
      card.querySelectorAll("video source[data-src]").forEach((source) => {
        source.src = source.dataset.src;
        delete source.dataset.src;
        source.parentElement.load();
      });
    });
  });

  const lightbox = document.getElementById("toronto-lightbox");
  const lightboxImage = lightbox.querySelector("img");
  const lightboxCoordinates = document.getElementById("toronto-lightbox-coordinates");
  const lightboxMap = L.map("toronto-lightbox-map", {
    zoomControl: false,
    attributionControl: true,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    tap: false,
  });
  L.tileLayer(tileUrl, tileOptions).addTo(lightboxMap);
  const lightboxMarker = L.circleMarker([43.6532, -79.3832], {
    radius: 9,
    color: "#fffaf0",
    weight: 3,
    fillColor: "#b55d2e",
    fillOpacity: 1,
  }).addTo(lightboxMap);

  document.querySelectorAll(".image-card").forEach((button) => {
    button.addEventListener("click", () => {
      const latitude = Number(button.dataset.lat);
      const longitude = Number(button.dataset.lon);
      lightboxImage.src = button.dataset.full;
      lightboxImage.alt = button.dataset.alt;
      lightboxCoordinates.textContent = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      lightbox.showModal();
      lightboxMap.setView([latitude, longitude], 17);
      lightboxMarker.setLatLng([latitude, longitude]);
      window.setTimeout(() => lightboxMap.invalidateSize(), 50);
    });
  });

  lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });
});
