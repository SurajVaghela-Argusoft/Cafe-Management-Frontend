import { useEffect, useState } from "react";
import axios from "axios";
import EmptyState from "../../../components/common/EmptyState";
import Panel from "../../../components/common/Panel";
import ScrollArea from "../../../components/common/ScrollArea";
import SplitLayout from "../../../components/common/SplitLayout";
import MenuItemRow from "../components/MenuItemRow";
import Cookies from 'js-cookie'

const Item = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // const token = localStorage.getItem("token");
    const token = Cookies.get("token");

    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        setLoading(true);
        setError("");

        const [categoriesResponse, itemsResponse] = await Promise.all([
          axios.get("http://127.0.0.1:8000/food/getcategories"),
          axios.get("http://127.0.0.1:8000/food/getitems")
        ]);

        setCategories(categoriesResponse.data.data || []);
        setItems(itemsResponse.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch menu items from backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  const handleAddToCart = (itemId, itemName) => {
    const existingCartItems = JSON.parse(localStorage.getItem("cart_items")) || [];

    const existingItemIndex = existingCartItems.findIndex((cartItem) => cartItem.item_id === itemId);

    if (existingItemIndex > -1) {
      existingCartItems[existingItemIndex].quantity += 1;
    } else {
      existingCartItems.push({
        item_id: itemId,
        quantity: 1
      });
    }

    localStorage.setItem("cart_items", JSON.stringify(existingCartItems));
    alert(`${itemName} added`);
  };

  if (loading) return <div>Loading records from database...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  const left = (
    <Panel title="Cafe Menu" subtitle="Explore our crafted culinary selections" className="h-100 w-100 d-flex flex-column">
      {categories.length === 0 ? (
        <EmptyState text="No categories available" />
      ) : (
        <ScrollArea className="d-flex flex-column gap-2">
          {categories.map((category) => (
            <a href={`#cat-${category.category_id}`} key={category.category_id} className="p-3 bg-light rounded-3 text-dark text-decoration-none fw-semibold small d-block border-0 link-secondary">
              <span className="d-block text-dark fs-6 mb-0">{category.category_name}</span>
              <span className="text-muted small fw-normal opacity-75 text-truncate d-block">{category.description || "Fresh house specials"}</span>
            </a>
          ))}
        </ScrollArea>
      )}
    </Panel>
  );

  const right = (
    <Panel className="h-100 d-flex flex-column overflow-hidden">
      {categories.length === 0 ? (
        <EmptyState text="No menu data available" />
      ) : (
        <ScrollArea className="d-flex flex-column gap-5 pe-2">
          {categories.map((category) => {
            const filteredItems = items.filter((item) => item.category_id === category.category_id);

            return (
              <div key={category.category_id} id={`cat-${category.category_id}`} className="pt-2">
                <div className="border-bottom border-light-subtle pb-2 mb-3">
                  <h2 className="fw-bold text-dark fs-4 mb-1" style={{ letterSpacing: "-0.3px" }}>
                    {category.category_name}
                    {!category.is_available && (
                      <span className="badge bg-danger-subtle text-danger fs-6 ms-2">Unavailable</span>
                    )}
                  </h2>
                  <p className="text-muted small mb-0 opacity-75">{category.description}</p>
                </div>

                {filteredItems.length === 0 ? (
                  <EmptyState variant="box" text="No items found in this section." />
                ) : (
                  <div className="d-flex flex-column">
                    {filteredItems.map((item) => (
                      <MenuItemRow
                        key={item.item_id}
                        item={item}
                        isLoggedIn={isLoggedIn}
                        onAddToCart={handleAddToCart}
                        unavailable={!category.is_available || !item.is_available}  // NEW
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </ScrollArea>
      )}
    </Panel>
  );

  return <SplitLayout left={left} right={right} leftCols={4} centerLeft={false} />;
};

export default Item;