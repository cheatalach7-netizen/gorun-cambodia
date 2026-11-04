// GoRun Cambodia Application Logic

let currentLang = 'km';
let filterState = {
  search: '',
  category: 'all',
  distance: 'all',
  province: 'all'
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  applyLanguage(currentLang);
  renderFeaturedEvents();
  filterAndRenderEvents();
  setupKeyboardListeners();
}

// -------------------------------------------------------------
// Language Switching System
// -------------------------------------------------------------
function switchLanguage(lang) {
  if (lang !== 'km' && lang !== 'en') return;
  currentLang = lang;

  document.documentElement.lang = lang;
  if (lang === 'en') {
    document.body.classList.add('lang-en');
  } else {
    document.body.classList.remove('lang-en');
  }

  // Update switcher button active state
  document.getElementById('btn-lang-km').classList.toggle('active', lang === 'km');
  document.getElementById('btn-lang-en').classList.toggle('active', lang === 'en');

  // Update static text elements with data-i18n
  applyLanguage(lang);

  // Re-render dynamic cards
  renderFeaturedEvents();
  filterAndRenderEvents();
}

function applyLanguage(lang) {
  const dict = I18N[lang] || I18N.km;

  // Text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Placeholder attributes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.setAttribute('placeholder', dict[key]);
    }
  });
}

// -------------------------------------------------------------
// Formatting Helpers
// -------------------------------------------------------------
function formatDate(dateStr, lang) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  if (lang === 'km') {
    const khmerMonths = [
      'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
      'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
    ];
    const day = d.getDate();
    const month = khmerMonths[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } else {
    return d.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}

function getCategoryBadgeLabel(cat, lang) {
  const dict = I18N[lang] || I18N.km;
  switch (cat) {
    case 'charity':
      return { label: dict.filter_charity, icon: '❤️' };
    case 'awareness':
      return { label: dict.filter_awareness, icon: '🎗️' };
    case 'marathon':
      return { label: dict.filter_marathon, icon: '🏅' };
    case 'fun_run':
      return { label: dict.filter_fun_run, icon: '🎉' };
    default:
      return { label: cat, icon: '🏃' };
  }
}

function getFeeRangeString(fees) {
  const values = Object.values(fees);
  if (!values.length) return '$0';
  const usdList = values.map(v => v.usd);
  const min = Math.min(...usdList);
  const max = Math.max(...usdList);
  if (min === max) {
    return `$${min}`;
  }
  return `$${min} - $${max}`;
}

// -------------------------------------------------------------
// Card Generation Component
// -------------------------------------------------------------
function createEventCard(event) {
  const title = currentLang === 'km' ? event.title_km : event.title_en;
  const purpose = currentLang === 'km' ? event.purpose_km : event.purpose_en;
  const location = currentLang === 'km' ? event.location_km : event.location_en;
  const catInfo = getCategoryBadgeLabel(event.category, currentLang);
  const formattedDate = formatDate(event.date, currentLang);
  const feeRange = getFeeRangeString(event.fees);

  const distancePills = event.distances.map(d => `<span class="distance-tag">${d}</span>`).join('');

  const card = document.createElement('div');
  card.className = 'event-card';
  card.innerHTML = `
    <div class="event-card-img-wrapper">
      <img src="${event.image}" alt="${title}" class="event-card-img" loading="lazy">
      <div class="event-category-badge">
        <span>${catInfo.icon}</span>
        <span>${catInfo.label}</span>
      </div>
      <div class="event-date-badge">
        ${formattedDate}
      </div>
    </div>
    <div class="event-card-body">
      <h3 class="event-title">${title}</h3>
      <div class="event-purpose">
        <span style="flex-shrink:0;">🎯</span>
        <span>${purpose}</span>
      </div>
      
      <div class="event-meta-list">
        <div class="event-meta-item">
          <svg class="event-meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>${location}</span>
        </div>
        <div class="event-meta-item">
          <svg class="event-meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>${event.time}</span>
        </div>
      </div>

      <div class="distance-tags">
        ${distancePills}
      </div>

      <div class="event-card-footer">
        <div class="event-fee-preview">
          <span class="event-fee-label">${I18N[currentLang].fee}</span>
          <span class="event-fee-amount">${feeRange}</span>
        </div>
        <button class="btn btn-green" onclick="openEventModal('${event.id}')" style="padding: 0.55rem 1.1rem; font-size: 0.88rem;">
          ${I18N[currentLang].view_details} &rarr;
        </button>
      </div>
    </div>
  `;
  return card;
}

// -------------------------------------------------------------
// Render Featured Events
// -------------------------------------------------------------
function renderFeaturedEvents() {
  const container = document.getElementById('featured-events-grid');
  if (!container) return;
  container.innerHTML = '';

  const featured = EVENTS_DATA.filter(e => e.featured);
  featured.forEach(evt => {
    container.appendChild(createEventCard(evt));
  });
}

// -------------------------------------------------------------
// Filter & Render All Events
// -------------------------------------------------------------
function filterAndRenderEvents() {
  const container = document.getElementById('events-grid');
  const countSpan = document.getElementById('count-number');
  if (!container) return;
  container.innerHTML = '';

  const searchLower = filterState.search.trim().toLowerCase();

  const filtered = EVENTS_DATA.filter(evt => {
    // Search filter across title and purpose in both languages
    if (searchLower) {
      const matchTitleKm = evt.title_km.toLowerCase().includes(searchLower);
      const matchTitleEn = evt.title_en.toLowerCase().includes(searchLower);
      const matchPurposeKm = evt.purpose_km.toLowerCase().includes(searchLower);
      const matchPurposeEn = evt.purpose_en.toLowerCase().includes(searchLower);
      const matchLocKm = evt.location_km.toLowerCase().includes(searchLower);
      const matchLocEn = evt.location_en.toLowerCase().includes(searchLower);

      if (!matchTitleKm && !matchTitleEn && !matchPurposeKm && !matchPurposeEn && !matchLocKm && !matchLocEn) {
        return false;
      }
    }

    // Category filter
    if (filterState.category !== 'all' && evt.category !== filterState.category) {
      return false;
    }

    // Distance filter
    if (filterState.distance !== 'all') {
      const targetDist = filterState.distance.toLowerCase();
      const hasDistance = evt.distances.some(d => d.toLowerCase().includes(targetDist));
      if (!hasDistance) return false;
    }

    // Province filter
    if (filterState.province !== 'all') {
      if (evt.province !== filterState.province) return false;
    }

    return true;
  });

  if (countSpan) {
    countSpan.textContent = filtered.length;
  }

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <div class="empty-state-icon">🔍</div>
      <h3 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 0.5rem;">${I18N[currentLang].no_events_found}</h3>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem;">${currentLang === 'km' ? 'សូមសាកល្បងផ្លាស់ប្តូរពាក្យស្វែងរក ឬសម្អាតតម្រង' : 'Try adjusting your search criteria or resetting filters.'}</p>
      <button class="btn btn-outline" onclick="resetAllFilters()">${I18N[currentLang].clear_filters}</button>
    `;
    container.appendChild(empty);
    return;
  }

  filtered.forEach(evt => {
    container.appendChild(createEventCard(evt));
  });
}

// -------------------------------------------------------------
// Filter Handlers
// -------------------------------------------------------------
function handleSearchChange(val) {
  filterState.search = val;
  filterAndRenderEvents();
}

function handleCategoryChange(val) {
  filterState.category = val;
  filterAndRenderEvents();
}

function handleDistanceChange(val) {
  filterState.distance = val;
  filterAndRenderEvents();
}

function handleProvinceChange(val) {
  filterState.province = val;
  filterAndRenderEvents();
}

function updateHeroCategoryPills() {
  document.querySelectorAll('.hero-category-pill').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-category') === filterState.category);
  });
}

function quickFilterCategory(cat) {
  if (filterState.category === cat) {
    filterState.category = 'all';
  } else {
    filterState.category = cat;
  }
  updateHeroCategoryPills();

  // Scroll to all events
  const allEventsElem = document.getElementById('all-events');
  if (allEventsElem) {
    allEventsElem.scrollIntoView({ behavior: 'smooth' });
  }
  filterAndRenderEvents();
}

function handleHeroSearch(event) {
  event.preventDefault();
  const input = document.getElementById('hero-search-input');
  if (input) {
    filterState.search = input.value;
  }
  const allEventsElem = document.getElementById('all-events');
  if (allEventsElem) {
    allEventsElem.scrollIntoView({ behavior: 'smooth' });
  }
  filterAndRenderEvents();
}

function resetAllFilters() {
  filterState = {
    search: '',
    category: 'all',
    distance: 'all',
    province: 'all'
  };

  const heroInput = document.getElementById('hero-search-input');
  if (heroInput) heroInput.value = '';

  updateHeroCategoryPills();
  filterAndRenderEvents();
}

// -------------------------------------------------------------
// Event Details Modal
// -------------------------------------------------------------
function openEventModal(eventId) {
  const event = EVENTS_DATA.find(e => e.id === eventId);
  if (!event) return;

  const modal = document.getElementById('event-modal-backdrop');
  const catInfo = getCategoryBadgeLabel(event.category, currentLang);
  const title = currentLang === 'km' ? event.title_km : event.title_en;
  const purpose = currentLang === 'km' ? event.purpose_km : event.purpose_en;
  const location = currentLang === 'km' ? event.location_km : event.location_en;
  const organizer = currentLang === 'km' ? event.organizer_km : event.organizer_en;
  const description = currentLang === 'km' ? event.description_km : event.description_en;
  const formattedDate = formatDate(event.date, currentLang);
  const formattedDeadline = formatDate(event.deadline, currentLang);

  document.getElementById('modal-img').src = event.image;
  document.getElementById('modal-category').innerHTML = `${catInfo.icon} ${catInfo.label}`;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-purpose').innerHTML = `<strong>🎯 ${I18N[currentLang].purpose}:</strong> ${purpose}`;
  document.getElementById('modal-date').textContent = formattedDate;
  document.getElementById('modal-time').textContent = event.time;
  document.getElementById('modal-location').textContent = location;
  document.getElementById('modal-deadline').textContent = formattedDeadline;
  document.getElementById('modal-organizer').textContent = organizer;
  document.getElementById('modal-description').textContent = description;

  // Render fees table
  const tbody = document.getElementById('modal-fees-tbody');
  tbody.innerHTML = '';
  Object.keys(event.fees).forEach(dist => {
    const fee = event.fees[dist];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${dist}</strong></td>
      <td>$${fee.usd}</td>
      <td>${fee.khr.toLocaleString()} ៛</td>
    `;
    tbody.appendChild(tr);
  });

  // Setup join button
  const regBtn = document.getElementById('modal-register-btn');
  regBtn.href = event.registration_url;

  // Show modal
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeEventModal() {
  const modal = document.getElementById('event-modal-backdrop');
  if (modal) {
    modal.classList.remove('open');
  }
  document.body.style.overflow = '';
}

function handleModalBackdropClick(e) {
  if (e.target.id === 'event-modal-backdrop') {
    closeEventModal();
  }
}

// -------------------------------------------------------------
// Organizer Submit Modal
// -------------------------------------------------------------
function openOrganizerModal() {
  const modal = document.getElementById('organizer-modal-backdrop');
  if (modal) modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeOrganizerModal() {
  const modal = document.getElementById('organizer-modal-backdrop');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

function handleOrganizerBackdropClick(e) {
  if (e.target.id === 'organizer-modal-backdrop') {
    closeOrganizerModal();
  }
}

function handleOrganizerSubmit(e) {
  e.preventDefault();
  alert(currentLang === 'km' 
    ? 'សូមអរគុណ! យើងបានទទួលព័ត៌មានព្រឹត្តិការណ៍របស់អ្នកហើយ។ ក្រុមការងារយើងនឹងពិនិត្យ និងផ្សព្វផ្សាយក្នុងពេលឆាប់ៗ។' 
    : 'Thank you! We have received your event information. Our team will review and publish it soon.');
  closeOrganizerModal();
}

// -------------------------------------------------------------
// Keyboard Listeners
// -------------------------------------------------------------
function setupKeyboardListeners() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeEventModal();
      closeOrganizerModal();
    }
  });
}
