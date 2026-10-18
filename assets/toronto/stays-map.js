document.addEventListener('DOMContentLoaded', () => {
  const element = document.getElementById('toronto-stays-map');
  const fallback = document.getElementById('map-fallback');
  if (!element || !window.L) { if (fallback) fallback.hidden = false; return; }
  const map = L.map(element, { scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  const reference = [43.6435568, -79.3939667];
  const pinIcon = (label, referencePin = false) => L.divIcon({
    className: `stay-marker${referencePin ? ' reference-marker' : ''}`,
    html: `<span>${label}</span>`, iconSize: [34, 34], iconAnchor: [17, 17]
  });
  L.marker(reference, {icon: pinIcon('S', true), title: '49 Spadina Avenue — reference'}).addTo(map)
    .bindPopup('49 Spadina Avenue · reference destination');
  const entries = [...document.querySelectorAll('.neighbourhood-card')].map(card => {
    const position = [Number(card.dataset.lat), Number(card.dataset.lon)];
    const marker = L.marker(position, {icon: pinIcon(card.dataset.pin), title: `${card.dataset.pin}. ${card.dataset.name} — approximate area`});
    const popup = document.createElement('div');
    const label = document.createElement('strong'); label.textContent = `${card.dataset.pin}. ${card.dataset.name}`;
    const note = document.createElement('p'); note.textContent = 'Approximate public listing area; exact entrance unknown.';
    const link = document.createElement('a'); link.href = `#${card.id}`; link.textContent = 'Compare this stay ↓';
    popup.append(label, note, link); marker.bindPopup(popup, {maxWidth: 220});
    const halo = L.circle(position, {radius: 250, weight: 1, color: '#c1663c', fillOpacity: 0.1, interactive: false});
    return {card, position, marker, halo};
  });
  const filters = [...document.querySelectorAll('[data-map-filter]')];
  function show(group) {
    map.closePopup();
    map.invalidateSize();
    const points = [reference];
    entries.forEach(entry => {
      const visible = group === 'all' || entry.card.dataset.group === group;
      [entry.marker, entry.halo].forEach(layer => visible ? layer.addTo(map) : map.removeLayer(layer));
      if (visible) points.push(entry.position);
    });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mapFilter === group)));
    map.fitBounds(points, {padding: [45, 45], maxZoom: 14});
  }
  filters.forEach(button => button.addEventListener('click', () => show(button.dataset.mapFilter)));
  document.querySelectorAll('[data-show-pin]').forEach(button => button.addEventListener('click', () => {
    const entry = entries.find(item => item.card.dataset.pin === button.dataset.showPin);
    show('all'); document.getElementById('stay-map').scrollIntoView({behavior: 'auto', block: 'start'});
    map.setView(entry.position, 14); entry.marker.openPopup(); element.focus({preventScroll: true});
  }));
  element.tabIndex = 0; show('all');
});
