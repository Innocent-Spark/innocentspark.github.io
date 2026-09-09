document.addEventListener("DOMContentLoaded", () => {
  const tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileOptions = { maxZoom: 18, attribution: "&copy; OpenStreetMap contributors" };
  const markerStyle = {
    radius: 5, color: "#f6f2e9", weight: 2, fillColor: "#d96a3b", fillOpacity: 0.95,
  };

  const overview = L.map("sf-overview-map", { zoomControl: false, scrollWheelZoom: false });
  L.tileLayer(tileUrl, tileOptions).addTo(overview);
  const overviewPoints = [];

  document.querySelectorAll(".area-card").forEach((card) => {
    const summary = card.querySelector("summary");
    const center = [Number(summary.dataset.centerLat), Number(summary.dataset.centerLon)];
    const areaName = card.querySelector(".area-name").textContent.trim();
    const map = L.map(card.querySelector(".mini-map"), {
      zoomControl: false, scrollWheelZoom: false, dragging: false,
      doubleClickZoom: false, boxZoom: false, keyboard: false,
    }).setView(center, Number(summary.dataset.zoom));
    L.tileLayer(tileUrl, tileOptions).addTo(map);
    L.circleMarker(center, { ...markerStyle, radius: 7, fillColor: "#d8a65f" })
      .bindTooltip(areaName)
      .addTo(overview);
    overviewPoints.push(center);

    const seen = new Set();
    card.querySelectorAll(".video-card").forEach((item) => {
      const point = [Number(item.dataset.lat), Number(item.dataset.lon)];
      if (!Number.isFinite(point[0]) || !Number.isFinite(point[1])) return;
      const key = point.join(",");
      if (seen.has(key)) return;
      seen.add(key);
      L.circleMarker(point, markerStyle).addTo(map);
    });
    L.circle(center, { radius: 900, color: "#244f3e", weight: 2, fillColor: "#d8a65f", fillOpacity: 0.2 }).addTo(map);

    card.addEventListener("toggle", () => {
      window.setTimeout(() => map.invalidateSize(), 50);
      if (!card.open) return;
      card.querySelectorAll("source[data-src]").forEach((source) => {
        source.src = source.dataset.src;
        delete source.dataset.src;
        source.parentElement.load();
      });
    });
  });

  if (overviewPoints.length) overview.fitBounds(overviewPoints, { padding: [42, 42] });
  else overview.setView([37.8, -122.36], 10);

  const lightbox = document.getElementById("sf-lightbox");
  const lightboxImage = lightbox.querySelector("img");
  const lightboxArea = document.getElementById("sf-lightbox-area");
  document.querySelectorAll(".image-card").forEach((button) => {
    button.addEventListener("click", () => {
      lightboxImage.src = button.dataset.full;
      lightboxImage.alt = button.dataset.alt;
      lightboxArea.textContent = button.dataset.areaName;
      lightbox.showModal();
    });
  });
  lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) lightbox.close(); });
});
