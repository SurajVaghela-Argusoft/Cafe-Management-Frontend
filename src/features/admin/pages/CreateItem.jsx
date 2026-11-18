import { useState, useEffect, useContext } from "react";
// import axios from "axios";
import axios from "../../../api";
import { itemsContext } from "../../../context/ItemsContext";
import AlertMessage from "../../../components/common/AlertMessage";
import EmptyState from "../../../components/common/EmptyState";
import FormField from "../../../components/common/FormField";
import Panel from "../../../components/common/Panel";
import ScrollArea from "../../../components/common/ScrollArea";
import SplitLayout from "../../../components/common/SplitLayout";
import Cookies from 'js-cookie'

const CreateItem = () => {
    const [categoryId, setCategoryId] = useState("");
    const [itemName, setItemName] = useState("");
    const [itemSize, setItemSize] = useState("");
    const [price, setPrice] = useState("");

    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);

    const dbitems = useContext(itemsContext) || [];
    const [itemList, setItemList] = useState([]);

    // State parameters tracking update actions
    const [editMode, setEditMode] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);

    useEffect(() => {
        if (dbitems.length > 0) {
            setItemList(dbitems);
        }
    }, [dbitems]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("http://127.0.0.1:8000/food/getcategories");
                setCategories(response.data.data || []);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        fetchCategories();
    }, []);

    const getCategoryName = (catId) => {
        if (!categories || categories.length === 0) return "Loading...";
        const foundCategory = categories.find(cat => String(cat.category_id) === String(catId));
        return foundCategory ? foundCategory.category_name : `Unknown (ID: ${catId})`;
    };

    const handleEditClick = (item) => {
        setEditMode(true);
        setEditingItemId(item.item_id);
        setCategoryId(item.category_id);
        setItemName(item.item_name);
        setItemSize(item.item_size);
        setPrice(item.price);
        setMessage({ text: "", type: "" });
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditingItemId(null);
        setCategoryId("");
        setItemName("");
        setItemSize("");
        setPrice("");
        setMessage({ text: "", type: "" });
    };

    const handleToggle = async (item) => {
        try {
            const response = await axios.patch(`http://127.0.0.1:8000/admin/toggleitem/${item.item_id}`);
            setItemList(prev => prev.map(i => i.item_id === item.item_id ? response.data.data : i));
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.response?.data?.error?.message || "Could not update availability.";
            setMessage({ text: errorMsg, type: "error" });
        }
    };
    const handleDelete = async (item) => {
        if (!window.confirm(`Delete "${item.item_name}"?`)) return;

        try {
            setLoading(true);
            // const token = localStorage.getItem("token");
            const token = Cookies.get("token");

            await axios.delete(`http://127.0.0.1:8000/admin/deleteitem/${item.item_id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            setItemList(prev => prev.filter(i => i.item_id !== item.item_id));
            if (editingItemId === item.item_id) handleCancelEdit();
            setMessage({ text: "Item deleted successfully!", type: "success" });
        } catch (err) {
            console.error("Error deleting item:", err);
            const errorMsg = err.response?.data?.error?.message || err.response?.data?.detail || "Could not delete item.";
            setMessage({ text: errorMsg, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!categoryId) {
            setMessage({ text: "Please select a category.", type: "error" });
            return;
        }
        if (!itemName.trim()) {
            setMessage({ text: "Item name cannot be empty.", type: "error" });
            return;
        }
        if (!itemSize.trim()) {
            setMessage({ text: "Item size cannot be empty.", type: "error" });
            return;
        }
        if (!price || isNaN(price) || Number(price) <= 0) {
            setMessage({ text: "Please enter a valid price.", type: "error" });
            return;
        }

        try {
            setLoading(true);
            setMessage({ text: "", type: "" });
            // const token = localStorage.getItem("token");
            const token = Cookies.get("token");


            const payload = {
                category_id: Number(categoryId),
                item_name: itemName,
                item_size: itemSize,
                price: Number(price)
            };

            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            };

            if (editMode) {
                const response = await axios.patch(
                    `http://127.0.0.1:8000/admin/updateitem/${editingItemId}`,
                    payload,
                    { headers }
                );

                setMessage({ text: "Item updated successfully!", type: "success" });

                setItemList(prevItems =>
                    prevItems.map(itm => itm.item_id === editingItemId ? response.data.data : itm)
                );
                handleCancelEdit();
            } else {
                const response = await axios.post(
                    "http://127.0.0.1:8000/admin/createitem",
                    payload,
                    { headers }
                );

                if (response.data && response.data.success === false) {
                    setMessage({ text: response.data.error?.message || "Could not create item.", type: "error" });
                } else {
                    setMessage({ text: "Item created successfully!", type: "success" });
                    setItemList(prevItems => [...prevItems, response.data.data]);
                    setCategoryId("");
                    setItemName("");
                    setItemSize("");
                    setPrice("");
                }
            }

        } catch (err) {
            console.error("Error submitting item:", err);
            const errorMsg = err.response?.data?.error?.message || "Something went wrong. Please try again.";
            setMessage({ text: errorMsg, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const left = (
        <Panel title={editMode ? "Update Menu Item" : "Create New Item"} className="w-100">
            <AlertMessage message={message} />

            <form onSubmit={handleSubmit}>
                <FormField as="select" label="Select Category:" id="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={loading} required>
                    <option value="">-- Choose a Category --</option>
                    {categories.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>
                            {cat.category_name}
                        </option>
                    ))}
                </FormField>
                <FormField label="Item Name:" id="itemName" type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g. Cappuccino" disabled={loading} required />
                <FormField label="Item Size:" id="itemSize" type="text" value={itemSize} onChange={(e) => setItemSize(e.target.value)} placeholder="e.g. Regular / Large" disabled={loading} required />
                <FormField label="Price Rs.:" id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Enter amount" className="mb-4" disabled={loading} required />

                <div className="d-flex flex-column gap-2">
                    <button type="submit" className="btn btn-dark fw-semibold border-0 shadow-sm" disabled={loading}>
                        {loading ? (editMode ? "Updating..." : "Creating...") : (editMode ? "Save Changes" : "Add Item")}
                    </button>
                    {editMode && (
                        <button type="button" onClick={handleCancelEdit} className="btn btn-outline-secondary" disabled={loading}>
                            Cancel Edit
                        </button>
                    )}
                </div>
            </form>
        </Panel>
    );

    const right = (
        <Panel title="Existing Menu Items" className="h-100 d-flex flex-column overflow-hidden">
            {itemList.length === 0 ? (
                <EmptyState text="No items found." />
            ) : (
                <ScrollArea className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr className="border-bottom border-dark">
                                <th className="text-muted fw-semibold small text-center" style={{ width: "50px" }}>#</th>
                                <th className="text-dark fw-bold small">Item Name</th>
                                <th className="text-dark fw-bold small">Category</th>
                                <th className="text-dark fw-bold small">Size</th>
                                <th className="text-dark fw-bold small">Price</th>
                                <th className="text-dark fw-bold small text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itemList.map((itm, idy) => (
                                <tr key={itm.item_id || idy} className="border-bottom border-light-subtle">
                                    <td className="text-muted text-center small">{idy + 1}</td>
                                    <td className="text-dark fw-semibold">
                                        <span className={itm.is_available ? "" : "text-muted text-decoration-line-through"}>{itm.item_name}</span>
                                        {!itm.is_available && <span className="badge bg-danger-subtle text-danger ms-2">Unavailable</span>}
                                    </td>                                    <td className="text-secondary small">{getCategoryName(itm.category_id)}</td>
                                    <td><span className="badge bg-light text-dark border border-light-subtle rounded px-2 py-1 small">{itm.item_size}</span></td>
                                    <td className="text-dark fw-medium">Rs. {itm.price}</td>
                                    <td className="text-end">
                                        <button
                                            type="button"
                                            onClick={() => handleToggle(itm)}
                                            className={`btn btn-sm me-2 ${itm.is_available ? "btn-outline-danger" : "btn-outline-success"}`}
                                            disabled={loading}
                                            style={{ fontSize: "0.8rem" }}
                                        >
                                            {itm.is_available ? "Make Unavailable" : "Make Available"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleEditClick(itm)}
                                            className="btn btn-sm bg-white border border-light-subtle rounded-2 px-3 py-1 fw-semibold text-dark shadow-sm"
                                            disabled={loading}
                                            style={{ fontSize: "0.8rem" }}
                                        >
                                            Update
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDelete(itm)}
                                            className="btn btn-danger btn-sm ms-2"
                                            disabled={loading}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </ScrollArea>
            )}
        </Panel>
    );

    return <SplitLayout left={left} right={right} />;
};

export default CreateItem;
