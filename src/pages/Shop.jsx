import { useMemo, useState } from "react";

const PRODUCTS_PER_PAGE = 4;
const placeholderImage = "/shop/product-placeholder.svg";

function imageCandidates(name, existingImage = "") {
  const encodedName = encodeURIComponent(name);
  return [
    existingImage,
    `/shop/${encodedName}.jpg`,
    `/shop/${encodedName}.webp`,
    `/shop/${encodedName}.png`,
    placeholderImage,
  ].filter(Boolean);
}

const products = [
  {
    id: "camera",
    name: "Smart Terrarium Camera",
    category: "Hardware",
    price: 59,
    rating: 4.8,
    image: "/shop/smart-terrarium-camera.jpg",
    detail: "Night vision preview, motion detection, and demo AI behavior tagging.",
  },
  {
    id: "sensor",
    name: "Temperature Sensor Pack",
    category: "Hardware",
    price: 29,
    rating: 4.6,
    image: "/shop/temperature-sensor-pack.webp",
    detail: "A simulated partner device for heat-zone and cool-side monitoring.",
  },
  {
    id: "uvb",
    name: "UVB Monitor",
    category: "Hardware",
    price: 45,
    rating: 4.5,
    image: "/shop/uvb-monitor.jpg",
    detail: "Prototype listing for light exposure trend checks.",
  },
  {
    id: "snacks",
    name: "Reptile Snack Bundle",
    category: "Food",
    price: 18,
    rating: 4.7,
    image: "/shop/reptile-snack-bundle.jpg",
    detail: "Partner marketplace demo for keeper-approved feeding supplies.",
  },
  {
    id: "hide",
    name: "Natural Hide Kit",
    category: "Habitat",
    price: 24,
    rating: 4.4,
    image: "/shop/natural-hide-kit.webp",
    detail: "Decor and hiding accessories for stress reduction.",
  },
  {
    id: "mist",
    name: "Misting Nozzle Set",
    category: "Habitat",
    price: 21,
    rating: 4.3,
    image: "/shop/misting-nozzle-set.webp",
    detail: "Humidity support for tropical and shedding-sensitive setups.",
  },
  {
    id: "macro-camera",
    name: "Macro Reptile Camera",
    category: "Hardware",
    price: 152,
    rating: 4.9,
    image: "",
    detail: "Close-focus night camera concept for small reptiles and nocturnal monitoring.",
  },
  {
    id: "digital-hygrometer",
    name: "Digital Thermo-Hygrometer",
    category: "Hardware",
    price: 27,
    rating: 4.6,
    image: "",
    detail: "Compact temperature and humidity reader with high-precision display.",
  },
  {
    id: "rock-hide-cave",
    name: "Rock Hide Cave",
    category: "Habitat",
    price: 32,
    rating: 4.5,
    image: "",
    detail: "Natural-look shelter for geckos, snakes, spiders, and small reptiles.",
  },
  {
    id: "glass-terrarium-tank",
    name: "Glass Terrarium Tank",
    category: "Habitat",
    price: 529,
    rating: 4.8,
    image: "",
    detail: "Large display enclosure concept for a planted reptile habitat.",
  },
  {
    id: "frozen-pinky-mice",
    name: "Frozen Pinky Mice",
    category: "Food",
    price: 18,
    rating: 4.2,
    image: "",
    detail: "Frozen feeder mice listing for snake feeding schedule planning.",
  },
  {
    id: "gecko-nutrition-paste",
    name: "Gecko Nutrition Paste",
    category: "Food",
    price: 89,
    rating: 4.7,
    image: "",
    detail: "Fruit and protein paste bundle inspired by crested gecko diet products.",
  },
];

const categories = ["All", "Hardware", "Food", "Habitat"];

function ProductImage({ product }) {
  const candidates = useMemo(() => imageCandidates(product.name, product.image), [product.image, product.name]);
  const [candidateIndex, setCandidateIndex] = useState(0);

  return (
    <img
      alt={product.name}
      src={candidates[candidateIndex] || placeholderImage}
      onError={() => setCandidateIndex((index) => Math.min(index + 1, candidates.length - 1))}
    />
  );
}

function Shop() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter((product) => product.category === activeCategory);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const visibleProducts = filteredProducts.slice((page - 1) * PRODUCTS_PER_PAGE, page * PRODUCTS_PER_PAGE);
  const cartItems = useMemo(
    () =>
      products
        .map((product) => ({ ...product, quantity: cart[product.id] || 0 }))
        .filter((product) => product.quantity > 0),
    [cart],
  );
  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );
  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems],
  );
  const tax = Math.round(cartTotal * 0.08 * 100) / 100;
  const grandTotal = Math.round((cartTotal + tax) * 100) / 100;

  const addToCart = (productId) => {
    setCart((currentCart) => ({
      ...currentCart,
      [productId]: (currentCart[productId] || 0) + 1,
    }));
  };

  const decreaseQuantity = (productId) => {
    setCart((currentCart) => {
      const currentQuantity = currentCart[productId] || 0;
      if (currentQuantity <= 1) {
        const nextCart = { ...currentCart };
        delete nextCart[productId];
        return nextCart;
      }

      return {
        ...currentCart,
        [productId]: currentQuantity - 1,
      };
    });
  };

  const removeFromCart = (productId) => {
    setCart((currentCart) => {
      const nextCart = { ...currentCart };
      delete nextCart[productId];
      return nextCart;
    });
  };

  const selectCategory = (category) => {
    setActiveCategory(category);
    setPage(1);
  };

  const goToPage = (nextPage) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  return (
    <div className="page shop-page">
      <section className="panel shop-header">
        <div>
          <p className="section-label">Pet marketplace</p>
          <h2>Reptile shop partners</h2>
          <p className="muted">
            A simulated store for reptile snacks, habitat tools, sensors, and cameras.
          </p>
        </div>
        <div className="cart-summary">
          <span>{cartCount} items</span>
          <strong>${cartTotal}</strong>
        </div>
        <button className="cart-icon-button" onClick={() => setIsCartOpen(true)} type="button" aria-label="Open cart">
          <span>Cart</span>
          {cartCount > 0 && <em>{cartCount}</em>}
        </button>
      </section>

      <section className="shop-categories" aria-label="Product categories">
        {categories.map((category) => (
          <button
            className={activeCategory === category ? "active" : ""}
            key={category}
            onClick={() => selectCategory(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </section>

      <section className="product-grid" aria-label="Shop products">
        {visibleProducts.map((product) => (
          <article className="product-card" key={product.id}>
            <ProductImage product={product} />
            <div>
              <span>{product.category}</span>
              <h3>{product.name}</h3>
              <div className="product-rating" aria-label={`${product.rating} star rating`}>
                <strong>★</strong> {product.rating}
              </div>
              <p>{product.detail}</p>
            </div>
            <div className="product-buy-row">
              <strong>${product.price}</strong>
              <button onClick={() => addToCart(product.id)} type="button">
                Add{cart[product.id] ? ` (${cart[product.id]})` : ""}
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="shop-pagination" aria-label="Shop product pages">
        <button disabled={page === 1} onClick={() => goToPage(page - 1)} type="button">
          Prev
        </button>
        <div>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              className={page === pageNumber ? "active" : ""}
              key={pageNumber}
              onClick={() => goToPage(pageNumber)}
              type="button"
            >
              {pageNumber}
            </button>
          ))}
        </div>
        <button disabled={page === totalPages} onClick={() => goToPage(page + 1)} type="button">
          Next
        </button>
      </section>

      {isCartOpen && <button className="cart-scrim" onClick={() => setIsCartOpen(false)} type="button" aria-label="Close cart" />}

      <section className={isCartOpen ? "panel checkout-panel cart-drawer open" : "panel checkout-panel cart-drawer"}>
        <div className="panel-heading">
          <div>
            <p className="section-label">Checkout</p>
            <h3>Cart</h3>
          </div>
          <button className="ghost-button cart-close-button" onClick={() => setIsCartOpen(false)} type="button">Close</button>
        </div>

        {cartItems.length === 0 ? (
          <div className="cart-empty-state">
            <strong>Your cart is empty</strong>
            <span>Add products to see quantities and subtotal here.</span>
          </div>
        ) : (
          <div className="cart-line-list">
            {cartItems.map((item) => (
              <article className="cart-line-item" key={item.id}>
                <img alt="" src={item.image} />
                <div>
                  <strong>{item.name}</strong>
                  <span>${item.price} each - ${item.price * item.quantity} subtotal</span>
                </div>
                <div className="quantity-stepper" aria-label={`${item.name} quantity`}>
                  <button onClick={() => decreaseQuantity(item.id)} type="button">-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => addToCart(item.id)} type="button">+</button>
                </div>
                <button className="cart-remove-button" onClick={() => removeFromCart(item.id)} type="button">
                  Remove
                </button>
              </article>
            ))}
          </div>
        )}

        <div className="cart-total-row">
          <span>Subtotal</span>
          <strong>${cartTotal}</strong>
        </div>
        <div className="cart-total-row">
          <span>Tax</span>
          <strong>${tax}</strong>
        </div>
        <div className="cart-total-row grand-total">
          <span>Total</span>
          <strong>${grandTotal}</strong>
        </div>

        {cartItems.length > 0 && (
          <div className="cart-actions">
            <button className="ghost-button" onClick={() => setCart({})} type="button">
              Clear cart
            </button>
            <button className="submit-pet-button" type="button">
              Demo checkout
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Shop;
