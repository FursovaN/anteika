/* =============================================
   STATE
   ============================================= */
const state = {
  page: 'home',
  cart: JSON.parse(localStorage.getItem('anteika_cart') || '[]'),
  reviews: [...reviewsData],
  products: [...products],
  filters: { category: 'all', maxPrice: 1000, search: '' },
  sort: 'default',
  theme: localStorage.getItem('anteika_theme') || 'dark',
  slider: { idx: 0, timer: null },
  nextReviewId: reviewsData.length + 1
};

/* =============================================
   HELPERS
   ============================================= */
const $ = id => document.getElementById(id);
const app = () => $('app');

function saveCart() {
  localStorage.setItem('anteika_cart', JSON.stringify(state.cart));
}

function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function stars(n) {
  return '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
}

/* =============================================
   THEME
   ============================================= */
function applyTheme() {
  document.body.className = state.theme === 'dark' ? 'dark-theme' : 'light-theme';
  $('themeToggle').textContent = state.theme === 'dark' ? '🌙' : '☀️';
  localStorage.setItem('anteika_theme', state.theme);
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme();
}

/* =============================================
   ROUTER
   ============================================= */
function navigate(page) {
  if (state.slider.timer) clearInterval(state.slider.timer);
  state.page = page;
  renderPage();
  document.querySelectorAll('.nav-link').forEach(l =>
    l.classList.toggle('active', l.dataset.page === page)
  );
  window.scrollTo({ top: 0, behavior: 'smooth' });
  $('mobileMenu').classList.remove('open');
}

function renderPage() {
  const el = app();
  el.style.opacity = '0';
  el.style.transform = 'translateY(8px)';
  el.style.transition = 'none';

  setTimeout(() => {
    switch (state.page) {
      case 'home':    el.innerHTML = renderHome();    initHome();    break;
      case 'catalog': el.innerHTML = renderCatalog(); initCatalog(); break;
      case 'cart':    el.innerHTML = renderCart();    initCart();    break;
      case 'order':   el.innerHTML = renderOrder();   initOrder();   break;
      case 'about':   el.innerHTML = renderAbout();   initAbout();   break;
      case 'success': el.innerHTML = renderSuccess(); break;
    }
    requestAnimationFrame(() => {
      el.style.transition = 'opacity .3s ease, transform .3s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  }, 50);
}

/* =============================================
   CART HELPERS
   ============================================= */
function updateCartBadge() {
  const total = state.cart.reduce((s, i) => s + i.qty, 0);
  $('cartCount').textContent = total;
}

function addToCart(id) {
  const product = state.products.find(p => p.id === id);
  if (!product) return;
  const existing = state.cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartBadge();
  showToast(`✅ «${product.name}» добавлен в корзину`);
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart();
  updateCartBadge();
  if (state.page === 'cart') {
    renderPage();
  }
}

function changeQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart();
  updateCartBadge();
  if (state.page === 'cart') renderPage();
}

function cartTotal() {
  return state.cart.reduce((s, i) => s + i.price * i.qty, 0);
}

/* =============================================
   MODAL
   ============================================= */
function openModal(html) {
  $('modalBody').innerHTML = html;
  $('modalOverlay').classList.add('open');
}

function closeModal() {
  $('modalOverlay').classList.remove('open');
}

/* =============================================
   PRODUCT CARD
   ============================================= */
function productCard(p) {
  const inCart = state.cart.find(i => i.id === p.id);
  return `
    <div class="card" data-id="${p.id}">
      <div class="card__img">
        <img src="${p.img}" alt="${p.name}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
        <div class="card__img-placeholder" style="display:none">${p.emoji}</div>
        <div class="card__tags">
          ${p.tag ? `<span class="tag tag--${p.tag}">${tagLabel(p.tag)}</span>` : ''}
        </div>
      </div>
      <div class="card__body">
        <div class="card__name">${p.name}</div>
        <div class="card__desc">${p.desc}</div>
        <div class="card__footer">
          <span class="card__price">${p.price} ₽</span>
          <span class="card__rating">${stars(p.rating)} ${p.rating}</span>
        </div>
        <div style="display:flex;gap:8px;margin-top:6px;">
          <button class="btn btn--primary btn--sm btn-add-cart" data-id="${p.id}" style="flex:1">
            ${inCart ? '✔ В корзине' : '+ В корзину'}
          </button>
          <button class="btn btn--ghost btn--sm btn-detail" data-id="${p.id}">👁</button>
        </div>
      </div>
    </div>`;
}

function tagLabel(t) {
  const map = { new: 'Новинка', popular: 'Хит', premium: 'Премиум', sale: 'Sale' };
  return map[t] || t;
}

/* =============================================
   PAGE: HOME
   ============================================= */
function renderHome() {
  const popular = state.products.filter(p => p.tag === 'popular' || p.tag === 'new').slice(0, 3);
  return `
    <div class="promo-strip">🔥 Скидка 15% на все позиции с меткой SALE — только этот месяц!</div>

    <!-- Slider -->
    <div class="slider" id="slider">
      <div class="slider__track" id="sliderTrack">
        ${slides.map((s, i) => `
          <div class="slide ${s.cls}">
            <div class="slide__title">${s.title}</div>
            <div class="slide__sub">${s.sub}</div>
            <button class="btn btn--primary" data-page="${s.page}" style="margin-top:10px">
              ${s.btn}
            </button>
          </div>`).join('')}
      </div>
      <button class="slider__btn slider__btn--prev" id="sliderPrev">‹</button>
      <button class="slider__btn slider__btn--next" id="sliderNext">›</button>
      <div class="slider__dots" id="sliderDots">
        ${slides.map((_, i) => `
          <button class="slider__dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></button>
        `).join('')}
      </div>
    </div>

    <div class="container section">
      <div class="section__title">Популярные товары</div>
      <div class="grid-3">
        ${popular.map(p => productCard(p)).join('')}
      </div>
      <div style="text-align:center;margin-top:28px;">
        <button class="btn btn--secondary" data-page="catalog">Весь каталог →</button>
      </div>
    </div>

    <div style="background:var(--bg2);border-top:1.5px solid var(--border);border-bottom:1.5px solid var(--border);padding:32px 16px;">
      <div class="container">
        <div class="section__title">О магазине</div>
        <p style="color:var(--text-muted);line-height:1.8;max-width:640px;">
          <strong style="color:var(--text)">Anteika</strong> — авторский магазин чаёв и кофе, 
          вдохновлённый эстетикой аниме «Токийский Гуль». Мы работаем в Токио и Казани, 
          отбирая лучшие сорта со всего мира. Каждая позиция — история, каждый глоток — ритуал.
        </p>
        <div style="display:flex;gap:24px;margin-top:20px;flex-wrap:wrap;">
          ${[['⚡','Быстрая доставка','2–5 дней по России'],
             ['🌿','100% натуральное','Без добавок и ароматизаторов'],
             ['🎁','Авторская упаковка','Идеальный подарок']
            ].map(([ic,t,s]) => `
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:1.6rem">${ic}</span>
              <div>
                <div style="font-weight:700;font-size:.9rem">${t}</div>
                <div style="font-size:.8rem;color:var(--text-muted)">${s}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

function initHome() {
  // Slider logic
  let idx = 0;
  const track = $('sliderTrack');
  const dots = document.querySelectorAll('.slider__dot');

  function goTo(i) {
    idx = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    dots.forEach((d, j) => d.classList.toggle('active', j === idx));
  }

  $('sliderPrev')?.addEventListener('click', () => goTo(idx - 1));
  $('sliderNext')?.addEventListener('click', () => goTo(idx + 1));
  dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.slide)));

  state.slider.timer = setInterval(() => goTo(idx + 1), 4000);

  // Product cards
  initCardListeners();
}

/* =============================================
   PAGE: CATALOG
   ============================================= */
function getFilteredProducts() {
  let list = [...state.products];
  const { category, maxPrice, search } = state.filters;

  if (category !== 'all') list = list.filter(p => p.category === category);
  list = list.filter(p => p.price <= maxPrice);
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q)
    );
  }
  switch (state.sort) {
    case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
    case 'price-desc': list.sort((a, b) => b.price - a.price); break;
    case 'name-asc':   list.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'name-desc':  list.sort((a, b) => b.name.localeCompare(a.name)); break;
    case 'rating':     list.sort((a, b) => b.rating - a.rating); break;
  }
  return list;
}

function renderCatalog() {
  const list = getFilteredProducts();
  const maxP = Math.max(...state.products.map(p => p.price));

  return `
    <div class="container section">
      <div class="section__title">Каталог</div>

      <div class="catalog-toolbar">
        <div class="catalog-toolbar__search">
          <input class="form-control" id="searchInput"
                 placeholder="Поиск товара…" value="${state.filters.search}"/>
          <span class="search-icon">🔍</span>
        </div>
        <div class="filter-row">
          <select class="form-control" id="catFilter">
            <option value="all"    ${state.filters.category === 'all'    ? 'selected' : ''}>Все категории</option>
            <option value="tea"    ${state.filters.category === 'tea'    ? 'selected' : ''}>Чай 🍵</option>
            <option value="coffee" ${state.filters.category === 'coffee' ? 'selected' : ''}>Кофе ☕</option>
          </select>
          <select class="form-control" id="sortSelect">
            <option value="default"   ${state.sort === 'default'    ? 'selected' : ''}>По умолчанию</option>
            <option value="price-asc" ${state.sort === 'price-asc'  ? 'selected' : ''}>Цена ↑</option>
            <option value="price-desc"${state.sort === 'price-desc' ? 'selected' : ''}>Цена ↓</option>
            <option value="name-asc"  ${state.sort === 'name-asc'   ? 'selected' : ''}>А → Я</option>
            <option value="name-desc" ${state.sort === 'name-desc'  ? 'selected' : ''}>Я → А</option>
            <option value="rating"    ${state.sort === 'rating'     ? 'selected' : ''}>Рейтинг</option>
          </select>
          <div style="display:flex;flex-direction:column;gap:4px;flex:1;min-width:160px;">
            <label style="font-size:.78rem;color:var(--text-muted)">
              До цены: <strong id="priceLabel">${state.filters.maxPrice} ₽</strong>
            </label>
            <input type="range" id="priceRange"
                   min="200" max="${maxP}" step="10"
                   value="${state.filters.maxPrice}"
                   style="accent-color:var(--red);cursor:pointer;width:100%"/>
          </div>
        </div>
      </div>

      <div class="products-count">Найдено товаров: <strong>${list.length}</strong></div>

      ${list.length
        ? `<div class="grid-3">${list.map(p => productCard(p)).join('')}</div>`
        : `<div class="cart-empty">
             <div class="big-icon">🔍</div>
             <p>Ничего не найдено. Попробуйте изменить фильтры.</p>
           </div>`
      }
    </div>`;
}

function initCatalog() {
  $('searchInput')?.addEventListener('input', e => {
    state.filters.search = e.target.value;
    refreshCatalog();
  });
  $('catFilter')?.addEventListener('change', e => {
    state.filters.category = e.target.value;
    refreshCatalog();
  });
  $('sortSelect')?.addEventListener('change', e => {
    state.sort = e.target.value;
    refreshCatalog();
  });
  $('priceRange')?.addEventListener('input', e => {
    state.filters.maxPrice = +e.target.value;
    $('priceLabel').textContent = `${state.filters.maxPrice} ₽`;
    refreshCatalog();
  });
  initCardListeners();
}

function refreshCatalog() {
  const list = getFilteredProducts();
  const maxP = Math.max(...state.products.map(p => p.price));
  const grid = app().querySelector('.grid-3');
  const countEl = app().querySelector('.products-count strong');

  if (countEl) countEl.textContent = list.length;

  const container = app().querySelector('.container');
  let gridEl = app().querySelector('.grid-3');
  let emptyEl = app().querySelector('.cart-empty');

  if (list.length) {
    if (emptyEl) emptyEl.remove();
    if (!gridEl) {
      const div = document.createElement('div');
      div.className = 'grid-3';
      container.appendChild(div);
      gridEl = div;
    }
    gridEl.innerHTML = list.map(p => productCard(p)).join('');
    initCardListeners();
  } else {
    if (gridEl) gridEl.remove();
    if (!emptyEl) {
      const div = document.createElement('div');
      div.className = 'cart-empty';
      div.innerHTML = '<div class="big-icon">🔍</div><p>Ничего не найдено. Попробуйте изменить фильтры.</p>';
      container.appendChild(div);
    }
  }
}

/* =============================================
   CARD LISTENERS (add to cart + modal)
   ============================================= */
function initCardListeners() {
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      addToCart(+btn.dataset.id);
      btn.textContent = '✔ В корзине';
      btn.style.background = 'var(--purple)';
    });
  });
  document.querySelectorAll('.btn-detail').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openProductModal(+btn.dataset.id);
    });
  });
}

function openProductModal(id) {
  const p = state.products.find(p => p.id === id);
  if (!p) return;
  openModal(`
    <div style="text-align:center;margin-bottom:16px;">
      <div style="font-size:4rem">${p.emoji}</div>
      <h2 style="font-size:1.4rem;font-weight:900;margin-top:8px">${p.name}</h2>
      ${p.tag ? `<span class="tag tag--${p.tag}" style="margin-top:6px;display:inline-block">${tagLabel(p.tag)}</span>` : ''}
    </div>
    <p style="color:var(--text-muted);line-height:1.7;margin-bottom:16px;">${p.desc}</p>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;
                background:var(--bg2);border-radius:8px;padding:14px;">
      <div style="display:flex;justify-content:space-between;font-size:.88rem;">
        <span style="color:var(--text-muted)">Категория</span>
        <span>${p.category === 'tea' ? '🍵 Чай' : '☕ Кофе'}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:.88rem;">
        <span style="color:var(--text-muted)">Вес</span><span>${p.weight}</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:.88rem;">
        <span style="color:var(--text-muted)">Рейтинг</span>
        <span style="color:#f0c040">${stars(p.rating)} ${p.rating}</span>
      </div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <span style="font-size:1.5rem;font-weight:900;color:var(--red-light)">${p.price} ₽</span>
      <button class="btn btn--primary" onclick="addToCart(${p.id});closeModal();">
        + В корзину
      </button>
    </div>`);
}

/* =============================================
   PAGE: CART
   ============================================= */
function renderCart() {
  if (!state.cart.length) {
    return `
      <div class="container section">
        <div class="section__title">Корзина</div>
        <div class="cart-empty">
          <div class="big-icon">🛒</div>
          <p>Корзина пуста</p>
          <button class="btn btn--primary" data-page="catalog" style="margin-top:14px">
            Перейти в каталог
          </button>
        </div>
      </div>`;
  }

  const total = cartTotal();
  const delivery = total >= 2000 ? 0 : 250;

  return `
    <div class="container section">
      <div class="section__title">Корзина <span class="badge">${state.cart.reduce((s,i)=>s+i.qty,0)}</span></div>
      ${state.cart.map(item => `
        <div class="cart-item">
          <div class="cart-item__img">${item.emoji}</div>
          <div class="cart-item__info">
            <div class="cart-item__name">${item.name}</div>
            <div class="cart-item__price">${item.price} ₽ × ${item.qty} = ${item.price * item.qty} ₽</div>
          </div>
          <div class="cart-item__qty">
            <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
          </div>
          <button class="btn btn--danger btn--sm btn--icon" data-remove="${item.id}" title="Удалить">✕</button>
        </div>`).join('')}

      <div class="cart-summary">
        <div class="cart-summary__row">
          <span>Товары (${state.cart.reduce((s,i)=>s+i.qty,0)} шт.)</span>
          <span>${total} ₽</span>
        </div>
        <div class="cart-summary__row">
          <span>Доставка</span>
          <span style="color:${delivery === 0 ? '#3a3' : 'inherit'}">
            ${delivery === 0 ? 'Бесплатно 🎉' : delivery + ' ₽'}
          </span>
        </div>
        ${delivery > 0 ? `<div style="font-size:.78rem;color:var(--text-muted)">Бесплатная доставка от 2000 ₽ (не хватает ${2000 - total} ₽)</div>` : ''}
        <div class="cart-summary__total">
          <span>Итого</span>
          <span>${total + delivery} ₽</span>
        </div>
        <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">
          <button class="btn btn--primary" data-page="order" style="flex:1">Оформить заказ</button>
          <button class="btn btn--ghost btn--sm" id="clearCartBtn">🗑 Очистить</button>
        </div>
      </div>
    </div>`;
}

function initCart() {
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = +btn.dataset.id;
      btn.dataset.action === 'inc' ? changeQty(id, 1) : changeQty(id, -1);
    });
  });
  document.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(+btn.dataset.remove));
  });
  $('clearCartBtn')?.addEventListener('click', () => {
    openModal(`
      <h2 style="margin-bottom:14px">Очистить корзину?</h2>
      <p style="color:var(--text-muted);margin-bottom:20px">Все товары будут удалены.</p>
      <div style="display:flex;gap:10px;">
        <button class="btn btn--danger" onclick="state.cart=[];saveCart();updateCartBadge();closeModal();navigate('catalog')">
          Да, очистить
        </button>
        <button class="btn btn--ghost" onclick="closeModal()">Отмена</button>
      </div>`);
  });
}

/* =============================================
   PAGE: ORDER
   ============================================= */
function renderOrder() {
  if (!state.cart.length) {
    return `
      <div class="container section">
        <div class="cart-empty">
          <div class="big-icon">📦</div>
          <p>Нечего оформлять — корзина пуста</p>
          <button class="btn btn--primary" data-page="catalog" style="margin-top:14px">В каталог</button>
        </div>
      </div>`;
  }

  return `
    <div class="container section">
      <div class="section__title">Оформление заказа</div>
      <form class="order-form" id="orderForm" novalidate>

        <h3>📍 Контактные данные</h3>
        <div class="form-group">
          <label>Имя *</label>
          <input class="form-control" name="name" placeholder="Канеки Кен" required />
        </div>
        <div class="form-group">
          <label>Телефон *</label>
          <input class="form-control" name="phone" type="tel" placeholder="+7 (999) 000-00-00" required />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input class="form-control" name="email" type="email" placeholder="ghoul@anteika.ru" />
        </div>

        <h3>🚚 Доставка</h3>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" name="delivery" value="courier" checked /> Курьер (250 ₽ / бесплатно от 2000 ₽)
          </label>
          <label class="radio-label">
            <input type="radio" name="delivery" value="pickup" /> Самовывоз — ул. Баумана 15, Казань
          </label>
          <label class="radio-label">
            <input type="radio" name="delivery" value="post" /> Почта России (300 ₽)
          </label>
        </div>
        <div class="form-group" style="margin-top:12px" id="addressGroup">
          <label>Адрес доставки *</label>
          <input class="form-control" name="address" placeholder="Город, улица, дом, квартира" />
        </div>

        <h3>💳 Оплата</h3>
        <div class="radio-group">
          <label class="radio-label">
            <input type="radio" name="payment" value="card" checked /> Картой онлайн
          </label>
          <label class="radio-label">
            <input type="radio" name="payment" value="cash" /> Наличными при получении
          </label>
          <label class="radio-label">
            <input type="radio" name="payment" value="sbp" /> СБП
          </label>
        </div>

        <h3>💬 Комментарий</h3>
        <div class="form-group">
          <textarea class="form-control" name="comment" rows="3"
                    placeholder="Пожелания к заказу…" style="resize:vertical"></textarea>
        </div>

        <!-- Итог -->
        <div style="background:var(--bg2);border-radius:8px;padding:14px;margin-bottom:16px;">
          <div style="font-weight:700;margin-bottom:8px">Ваш заказ (${state.cart.reduce((s,i)=>s+i.qty,0)} поз.)</div>
          ${state.cart.map(i => `
            <div style="display:flex;justify-content:space-between;font-size:.85rem;color:var(--text-muted);margin-bottom:4px;">
              <span>${i.emoji} ${i.name} × ${i.qty}</span>
              <span>${i.price * i.qty} ₽</span>
            </div>`).join('')}
          <div style="display:flex;justify-content:space-between;font-weight:800;
                      padding-top:8px;border-top:1px solid var(--border);color:var(--red-light)">
            <span>Итого</span><span>${cartTotal()} ₽+</span>
          </div>
        </div>

        <button type="submit" class="btn btn--primary btn--full">Подтвердить заказ ✓</button>
      </form>
    </div>`;
}

function initOrder() {
  const form = $('orderForm');
  if (!form) return;

  // Скрыть адрес при самовывозе
  document.querySelectorAll('[name="delivery"]').forEach(r => {
    r.addEventListener('change', () => {
      const ag = $('addressGroup');
      if (ag) ag.style.display = r.value === 'pickup' ? 'none' : 'flex';
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    if (!data.name?.trim()) { showToast('❌ Введите имя'); return; }
    if (!data.phone?.trim()) { showToast('❌ Введите телефон'); return; }

    openModal(`
      <div style="text-align:center">
        <div style="font-size:3rem;margin-bottom:10px">⏳</div>
        <p style="color:var(--text-muted)">Обрабатываем заказ…</p>
      </div>`);

    setTimeout(() => {
      closeModal();
      state.cart = [];
      saveCart();
      updateCartBadge();
      navigate('success');
    }, 1500);
  });
}

/* =============================================
   PAGE: SUCCESS
   ============================================= */
function renderSuccess() {
  return `
    <div class="container">
      <div class="success-page">
        <div class="big-icon">✅</div>
        <h1>Заказ оформлен!</h1>
        <p>Мы свяжемся с вами в ближайшее время.<br>Спасибо, что выбрали <strong>Anteika</strong>!</p>
        <button class="btn btn--primary" data-page="home">На главную</button>
      </div>
    </div>`;
}

/* =============================================
   PAGE: ABOUT
   ============================================= */
function renderAbout() {
  return `
    <div class="about-hero">
      <h1>О нас</h1>
      <p>Anteika — место, где тьма и аромат встречаются.
         Авторские чаи и кофе для тех, кто ценит детали.</p>
    </div>

    <div class="container section">
      <div class="section__title">Контакты</div>
      <div class="contacts-grid">
        ${[
          ['📍','Адрес','ул. Баумана 15, Казань / Shinjuku, Tokyo'],
          ['📞','Телефон','+7 (843) 000-00-00'],
          ['✉️','Email','hello@anteika.ru'],
          ['🕐','Режим работы','Пн–Вс: 10:00 – 21:00'],
          ['📦','Доставка','По всей России и СНГ'],
          ['💬','Telegram','@anteika_shop']
        ].map(([ic,t,v]) => `
          <div class="contact-card">
            <div class="contact-card__icon">${ic}</div>
            <div>
              <div class="contact-card__title">${t}</div>
              <div class="contact-card__val">${v}</div>
            </div>
          </div>`).join('')}
      </div>

      <div class="section__title">Отзывы</div>
      <div class="reviews-list" id="reviewsList">
        ${renderReviews()}
      </div>

      <!-- Форма отзыва (CRUD: добавление) -->
      <div style="background:var(--card);border:1.5px solid var(--border);border-radius:8px;padding:20px;">
        <div style="font-weight:700;margin-bottom:14px">✍️ Оставить отзыв</div>
        <form id="reviewForm">
          <div class="form-group">
            <label>Ваше имя *</label>
            <input class="form-control" id="rAuthor" placeholder="Канеки Кен" required />
          </div>
          <div class="form-group">
            <label>Оценка</label>
            <select class="form-control" id="rStars">
              <option value="5">★★★★★ Отлично</option>
              <option value="4">★★★★☆ Хорошо</option>
              <option value="3">★★★☆☆ Нормально</option>
              <option value="2">★★☆☆☆ Плохо</option>
              <option value="1">★☆☆☆☆ Ужасно</option>
            </select>
          </div>
          <div class="form-group">
            <label>Текст отзыва *</label>
            <textarea class="form-control" id="rText" rows="3" placeholder="Ваш отзыв…"></textarea>
          </div>
          <button type="submit" class="btn btn--primary">Отправить отзыв</button>
        </form>
      </div>
    </div>`;
}

function renderReviews() {
  return state.reviews.map(r => `
    <div class="review-item" data-rid="${r.id}">
      <div class="review-item__header">
        <div>
          <div class="review-item__author">${r.author}</div>
          <div class="review-item__stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
        </div>
        <button class="btn btn--danger btn--sm" onclick="deleteReview(${r.id})">✕</button>
      </div>
      <div class="review-item__text">${r.text}</div>
    </div>`).join('');
}

function deleteReview(id) {
  state.reviews = state.reviews.filter(r => r.id !== id);
  const el = document.querySelector(`[data-rid="${id}"]`);
  if (el) {
    el.style.transition = 'opacity .3s, transform .3s';
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    setTimeout(() => {
      $('reviewsList').innerHTML = renderReviews();
    }, 300);
  }
  showToast('🗑 Отзыв удалён');
}

function initAbout() {
  $('reviewForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const author = $('rAuthor').value.trim();
    const text = $('rText').value.trim();
    const stars = +$('rStars').value;

    if (!author) { showToast('❌ Введите имя'); return; }
    if (!text)   { showToast('❌ Напишите текст отзыва'); return; }

    state.reviews.unshift({ id: state.nextReviewId++, author, stars, text });
    $('reviewsList').innerHTML = renderReviews();

    e.target.reset();
    showToast('✅ Отзыв добавлен!');
  });
}

/* =============================================
   GLOBAL EVENTS
   ============================================= */
// Навигация (делегирование)
document.body.addEventListener('click', e => {
  const link = e.target.closest('[data-page]');
  if (link && !link.closest('#modal')) {
    e.preventDefault();
    navigate(link.dataset.page);
  }
});

// Бургер
$('burgerBtn').addEventListener('click', () => {
  $('mobileMenu').classList.toggle('open');
});

// Закрыть мобильное меню по клику вне
document.addEventListener('click', e => {
  if (!e.target.closest('#mobileMenu') && !e.target.closest('#burgerBtn')) {
    $('mobileMenu').classList.remove('open');
  }
});

// Тема
$('themeToggle').addEventListener('click', toggleTheme);

// Модалка
$('modalClose').addEventListener('click', closeModal);
$('modalOverlay').addEventListener('click', e => {
  if (e.target === $('modalOverlay')) closeModal();
});

// Клавиша Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* =============================================
   INIT
   ============================================= */
applyTheme();
updateCartBadge();
navigate('home');
