import { useMemo, useState } from "react";

const products = [
  {
    id: "camera",
    name: "Smart Terrarium Camera",
    category: "Hardware",
    price: 59,
    image: "/pets/Crocodile.jpg",
    detail: "Night vision preview, motion detection, and demo AI behavior tagging.",
  },
  {
    id: "sensor",
    name: "Temperature Sensor Pack",
    category: "Hardware",
    price: 29,
    image: "/pets/bearded-dragon.webp",
    detail: "A simulated partner device for heat-zone and cool-side monitoring.",
  },
  {
    id: "uvb",
    name: "UVB Monitor",
    category: "Hardware",
    price: 45,
    image: "/pets/ball-python.webp",
    detail: "Prototype listing for light exposure trend checks.",
  },
  {
    id: "snacks",
    name: "Reptile Snack Bundle",
    category: "Food",
    price: 18,
    image: "/pets/leopard-gecko.jpg",
    detail: "Partner marketplace demo for keeper-approved feeding supplies.",
  },
  {
    id: "hide",
    name: "Natural Hide Kit",
    category: "Habitat",
    price: 24,
    image: "/pets/pacman-frog.webp",
    detail: "Decor and hiding accessories for stress reduction.",
  },
  {
    id: "mist",
    name: "Misting Nozzle Set",
    category: "Habitat",
    price: 21,
    image: "/pets/Li.jpg",
    detail: "Humidity support for tropical and shedding-sensitive setups.",
  },
];

const categories = ["All", "Hardware", "Food", "Habitat"];

function Shop() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter((product) => product.category === activeCategory);
  const cartTotal = useMemo(
    () => cart.reduce((total, item) => total + item.price, 0),
    [cart],
  );

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
          <span>{cart.length} items</span>
          <strong>${cartTotal}</strong>
        </div>
      </section>

      <section className="shop-categories" aria-label="Product categories">
        {categories.map((category) => (
          <button
            className={activeCategory === category ? "active" : ""}
            key={category}
            onClick={() => setActiveCategory(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </section>

      <section className="product-grid" aria-label="Shop products">
        {filteredProducts.map((product) => (
          <article className="product-card" key={product.id}>
            <img alt={product.name} src={product.image} />
            <div>
              <span>{product.category}</span>
              <h3>{product.name}</h3>
              <p>{product.detail}</p>
            </div>
            <div className="product-buy-row">
              <strong>${product.price}</strong>
              <button onClick={() => setCart((currentCart) => [...currentCart, product])} type="button">
                Add
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="panel checkout-panel">
        <p className="section-label">Checkout</p>
        <h3>Demo cart</h3>
        <p className="muted">
          Cart, checkout, payment, and delivery are visual prototypes only.
        </p>
        {cart.length > 0 && (
          <button className="submit-pet-button" onClick={() => setCart([])} type="button">
            Clear demo cart
          </button>
        )}
      </section>
    </div>
  );
}

export default Shop;
