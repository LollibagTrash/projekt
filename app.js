const fallbackShoes = [
  {
    id: 1,
    name: "Aero Pulse",
    brand: "StrideLab",
    category: "Tempo",
    gender: "Unisex",
    description: "Légies, gyors és stabil modell mindennapi futáshoz.",
    price: 32990,
    oldPrice: 36990,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 2,
    name: "Trail Drift",
    brand: "StrideLab",
    category: "Túra",
    gender: "Unisex",
    description: "Gripes talp és rugalmas szerkezet terephez igazodó futáshoz.",
    price: 39990,
    oldPrice: 44990,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 3,
    name: "Cloud Step",
    brand: "StrideLab",
    category: "Kényelmi",
    gender: "Unisex",
    description: "Puha és könnyű kialakítás a hajnali és esti futásokhoz.",
    price: 27990,
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 4,
    name: "Peak Flow",
    brand: "StrideLab",
    category: "Stabil",
    gender: "Unisex",
    description: "Egyensúlyozott, magas komfortfokú cipő hosszú edzésekhez.",
    price: 45990,
    oldPrice: 49990,
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 5,
    name: "Motion Plus",
    brand: "StrideLab",
    category: "Edzés",
    gender: "Unisex",
    description: "Könnyed és lendületes futócipő intenzív edzésekre.",
    price: 34990,
    oldPrice: null,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80"
  },
  {
    id: 6,
    name: "Urban Sprint",
    brand: "StrideLab",
    category: "Városi",
    gender: "Unisex",
    description: "Sportos stílus, a mindennapi mozgásra tervezett kialakítás.",
    price: 31990,
    oldPrice: 35990,
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80"
  }
];

const shoeList = document.querySelector("#shoe-list");
const loading = document.querySelector("#loading");
const errorMessage = document.querySelector("#error-message");
const productCount = document.querySelector("#product-count");
const searchInput = document.querySelector("#search-input");
const brandFilter = document.querySelector("#brand-filter");
const sortSelect = document.querySelector("#sort-select");
const saleFilter = document.querySelector("#sale-filter");
const emptyState = document.querySelector("#empty-state");
const cart = JSON.parse(localStorage.getItem("stridelab-cart") || "[]");
let allShoes = [];
let selectedShoe = null;

async function loadShoes() {
  const endpoints = ["/api/shoes", "db.json"];
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const shoes = Array.isArray(data) ? data : data.shoes || [];

      if (shoes.length > 0) {
        allShoes = shoes;
        populateBrandFilter(shoes);
        renderFilteredShoes();
        return;
      }
    } catch (error) {
      lastError = error;
    }
  }

  console.warn("Adatbetöltés sikertelen, fallback példányok jelennek meg.", lastError);
  errorMessage.textContent = "A szerver nem érhető el, ezért a demo termékek látszanak.";
  errorMessage.classList.remove("hidden");
  allShoes = fallbackShoes;
  populateBrandFilter(fallbackShoes);
  renderFilteredShoes();
}

function renderShoes(shoes) {
  shoeList.innerHTML = "";
  productCount.textContent = `${shoes.length} darab`;
  emptyState.classList.toggle("hidden", shoes.length > 0);

  shoes.forEach((shoe) => {
    const card = `
      <article class="product-card">
        <img src="${shoe.image}" alt="${shoe.name}" />
        <div class="product-body">
          <span class="product-tag">${shoe.category}</span>
          <h3>${shoe.name}</h3>
          <div class="product-meta">
            <span>${shoe.brand}</span>
            <span>•</span>
            <span>${shoe.gender}</span>
          </div>
          <p>${shoe.description}</p>

          <div class="product-footer">
            <div class="price-box">
              ${shoe.oldPrice ? `<span class="old-price">${formatPrice(shoe.oldPrice)}</span>` : ""}
              <span class="price">${formatPrice(shoe.price)}</span>
            </div>
            <div class="card-actions">
              <button type="button" class="details-btn" data-details-id="${shoe.id}">Részletek</button>
              <button type="button" class="buy-btn" data-id="${shoe.id}">Kosárba</button>
            </div>
          </div>
        </div>
      </article>
    `;

    shoeList.insertAdjacentHTML("beforeend", card);
  });

  document.querySelectorAll(".buy-btn").forEach((button) => {
    button.addEventListener("click", () => {
      addToCart(button.dataset.id);
    });
  });

  document.querySelectorAll("[data-details-id]").forEach((button) => {
    button.addEventListener("click", () => openDetails(button.dataset.detailsId));
  });

}

function populateBrandFilter(shoes) {
  const brands = [...new Set(shoes.map((shoe) => shoe.brand))].sort();
  brandFilter.innerHTML = '<option value="all">Minden márka</option>';
  brands.forEach((brand) => {
    brandFilter.insertAdjacentHTML("beforeend", `<option value="${brand}">${brand}</option>`);
  });
}

function renderFilteredShoes() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedBrand = brandFilter.value;
  const filtered = allShoes.filter((shoe) => {
    const matchesQuery = `${shoe.name} ${shoe.brand} ${shoe.category}`.toLowerCase().includes(query);
    const matchesBrand = selectedBrand === "all" || shoe.brand === selectedBrand;
    const matchesSale = !saleFilter.checked || shoe.oldPrice;
    return matchesQuery && matchesBrand && matchesSale;
  });
  const sorted = [...filtered];
  if (sortSelect.value === "price-asc") sorted.sort((a, b) => a.price - b.price);
  if (sortSelect.value === "price-desc") sorted.sort((a, b) => b.price - a.price);
  if (sortSelect.value === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "hu"));
  renderShoes(sorted);
}

function addToCart(id) {
  const shoe = allShoes.find((item) => String(item.id) === String(id));
  if (!shoe) return;
  const item = cart.find((entry) => String(entry.id) === String(id));
  if (item) item.quantity += 1;
  else cart.push({ ...shoe, quantity: 1 });
  saveCart();
  renderCart();
  document.querySelector("#cart-panel").classList.add("open");
}

function saveCart() {
  localStorage.setItem("stridelab-cart", JSON.stringify(cart));
}

function renderCart() {
  const cartItems = document.querySelector("#cart-items");
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector("#cart-count").textContent = itemCount;
  document.querySelector("#cart-total").textContent = formatPrice(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
  cartItems.innerHTML = cart.length ? cart.map((item) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" />
      <div><strong>${item.name}</strong><span>${item.quantity} × ${formatPrice(item.price)}</span></div>
      <button type="button" class="remove-cart" data-cart-id="${item.id}" aria-label="${item.name} törlése">×</button>
    </div>`).join("") : '<p class="cart-empty">A kosár üres.</p>';
  document.querySelectorAll("[data-cart-id]").forEach((button) => button.addEventListener("click", () => {
    const index = cart.findIndex((item) => String(item.id) === button.dataset.cartId);
    cart.splice(index, 1);
    saveCart();
    renderCart();
  }));
}

function openDetails(id) {
  selectedShoe = allShoes.find((shoe) => String(shoe.id) === String(id));
  if (!selectedShoe) return;
  const detailsImage = document.querySelector("#details-image");
  const imageFallback = document.querySelector("#details-image-fallback");
  detailsImage.src = selectedShoe.image || fallbackShoes[0].image;
  detailsImage.alt = selectedShoe.name;
  detailsImage.classList.remove("hidden");
  imageFallback.classList.add("hidden");
  document.querySelector("#details-title").textContent = selectedShoe.name;
  document.querySelector("#details-category").textContent = selectedShoe.category;
  document.querySelector("#details-meta").textContent = `${selectedShoe.brand} • ${selectedShoe.gender}`;
  document.querySelector("#details-description").textContent = selectedShoe.description;
  document.querySelector("#details-price").textContent = formatPrice(selectedShoe.price);
  document.querySelector("#details-modal").classList.remove("hidden");
}

document.querySelector("#details-image").addEventListener("error", (event) => {
  if (event.currentTarget.src !== fallbackShoes[0].image) {
    event.currentTarget.src = fallbackShoes[0].image;
    return;
  }
  event.currentTarget.classList.add("hidden");
  document.querySelector("#details-image-fallback").classList.remove("hidden");
});

searchInput.addEventListener("input", renderFilteredShoes);
brandFilter.addEventListener("change", renderFilteredShoes);
sortSelect.addEventListener("change", renderFilteredShoes);
saleFilter.addEventListener("change", renderFilteredShoes);
document.querySelector("#cart-button").addEventListener("click", () => document.querySelector("#cart-panel").classList.add("open"));
document.querySelector("#close-cart").addEventListener("click", () => document.querySelector("#cart-panel").classList.remove("open"));
document.querySelector("[data-close-modal]").addEventListener("click", () => document.querySelector("#details-modal").classList.add("hidden"));
document.querySelector("#details-modal").addEventListener("click", (event) => {
  if (event.target.id === "details-modal") event.currentTarget.classList.add("hidden");
});
document.querySelector("#details-cart-button").addEventListener("click", () => {
  if (selectedShoe) addToCart(selectedShoe.id);
  document.querySelector("#details-modal").classList.add("hidden");
});
document.querySelector("#checkout-button").addEventListener("click", () => {
  const feedback = document.querySelector("#cart-feedback");
  const name = document.querySelector("#checkout-name");
  const email = document.querySelector("#checkout-email");
  if (!cart.length) {
    feedback.textContent = "A kosár még üres. Válasszon egy terméket a rendeléshez.";
  } else if (!name.value.trim() || !email.checkValidity()) {
    feedback.textContent = "A rendeléshez kérjük, adja meg a nevét és egy érvényes e-mail-címet.";
    name.focus();
  } else {
    feedback.textContent = `Köszönjük a rendelést, ${name.value.trim()}! Hamarosan jelentkezünk a ${email.value.trim()} címen.`;
  }
  feedback.classList.remove("hidden");
});
document.querySelector("#contact-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const feedback = document.querySelector("#contact-feedback");
  feedback.textContent = "Köszönjük, megkaptuk az ajánlatkérését. Hamarosan jelentkezünk.";
  feedback.classList.remove("hidden");
  event.currentTarget.reset();
});
renderCart();

function formatPrice(price) {
  return `${new Intl.NumberFormat("hu-HU").format(price)} Ft`;
}

loadShoes().finally(() => {
  loading.classList.add("hidden");
});
