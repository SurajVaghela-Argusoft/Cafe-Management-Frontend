import { useState, useEffect } from "react";
import axios from "../../../api";
import AlertMessage from "../../../components/common/AlertMessage";
import EmptyState from "../../../components/common/EmptyState";
import FormField from "../../../components/common/FormField";
import Panel from "../../../components/common/Panel";
import ScrollArea from "../../../components/common/ScrollArea";
import SplitLayout from "../../../components/common/SplitLayout";
import Cookies from 'js-cookie'

const CreateCategory = () => {
    const [categoryName, setCategoryName] = useState("");
    const [catdescription, setDescription] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    const [editMode, setEditMode] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState(null);

    const [search, setSearch] = useState("");                
    const [statusFilter, setStatusFilter] = useState("all"); 

    const fetchCategories = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/food/getcategories");
            const list = response.data?.data;
            setCategories(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error("Error fetching categories:", err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleToggle = async (cat) => {
        try {
            await axios.patch(`http://127.0.0.1:8000/admin/togglecategory/${cat.category_id}`);
            fetchCategories();
        } catch (err) {
            const errorMsg = err.response?.data?.detail || err.response?.data?.error?.message || "Could not update availability.";
            setMessage({ text: errorMsg, type: "error" });
        }
    };

    const handleEditClick = (category) => {
        setEditMode(true);
        setEditingCategoryId(category.category_id);
        setCategoryName(category.category_name);
        setDescription(category.description || "");
        setMessage({ text: "", type: "" });
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditingCategoryId(null);
        setCategoryName("");
        setDescription("");
        setMessage({ text: "", type: "" });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!categoryName.trim()) {
            setMessage({ text: "Category name cannot be empty.", type: "error" });
            return;
        }

        try {
            setLoading(true);
            setMessage({ text: "", type: "" });
            const token = Cookies.get("token");

            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            };

            if (editMode) {
                await axios.patch(
                    `http://127.0.0.1:8000/admin/updatecategory/${editingCategoryId}`,
                    { category_name: categoryName, description: catdescription },
                    { headers }
                );

                setMessage({ text: "Category updated successfully!", type: "success" });
                handleCancelEdit();
                fetchCategories();
            } else {
                const response = await axios.post(
                    "http://127.0.0.1:8000/admin/createcategory",
                    { category_name: categoryName, description: catdescription },
                    { headers }
                );

                if (response.data && response.data.success === false) {
                    setMessage({ text: response.data.error?.message || "Could not create category.", type: "error" });
                } else {
                    setMessage({ text: "Category created successfully!", type: "success" });
                    setCategoryName("");
                    setDescription("");
                    fetchCategories();
                }
            }

        } catch (err) {
            console.error("Error submitting category:", err);
            const errorMsg = err.response?.data?.error?.message || "Something went wrong. Please try again.";
            setMessage({ text: errorMsg, type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const q = search.trim().toLowerCase();
    const filteredCategories = categories.filter((cat) => {
        const matchesName = (cat.category_name || "").toLowerCase().includes(q);
        const matchesStatus =
            statusFilter === "all" ||
            (statusFilter === "available" && cat.is_available) ||
            (statusFilter === "unavailable" && !cat.is_available);
        return matchesName && matchesStatus;
    });

    const hasFilters = search.trim() !== "" || statusFilter !== "all";
    
    const left = (
        <Panel title={editMode ? "Update Category" : "Create New Category"} className="w-100">
            <AlertMessage message={message} />

            <form onSubmit={handleSubmit}>
                <FormField label="Category Name:" id="categoryName" type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Enter category name" disabled={loading} required />
                <FormField as="textarea" label="Category Description:" id="catDescription" rows="3" value={catdescription} onChange={(e) => setDescription(e.target.value)} placeholder="Enter Description" disabled={loading} required />

                <div className="d-flex flex-column gap-2 mt-4">
                    <button type="submit" className="btn btn-dark fw-semibold" disabled={loading}>
                        {loading ? (editMode ? "Updating..." : "Creating...") : (editMode ? "Save Changes" : "Add Category")}
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
        <Panel title="Existing Categories" className="h-100 d-flex flex-column overflow-hidden">
            {categories.length === 0 ? (
                <EmptyState text="No categories found." />
            ) : (
                <>
                    <div className="row g-2 mb-3 flex-shrink-0">
                        <div className="col-12 col-md-6">
                            <input
                                type="text"
                                className="form-control form-control-sm rounded-3 py-2 px-3"
                                placeholder="Search category by name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="col-7 col-md-4">
                            <select
                                className="form-select form-select-sm rounded-3 py-2 px-3"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                            </select>
                        </div>
                        <div className="col-5 col-md-2">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-dark w-100 rounded-3 py-2"
                                disabled={!hasFilters}
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("all");
                                }}
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {filteredCategories.length === 0 ? (
                        <EmptyState text="No categories match your search or filter." />
                    ) : (
                        <ScrollArea>
                            <ol className="list-group list-group-numbered gap-3">
                                {filteredCategories.map((cat, idx) => (
                                    <li key={cat.category_id || idx} className="list-group-item bg-light border-0 rounded p-3 d-flex justify-content-between align-items-center">
                                        <div className="ms-2 me-auto">
                                            <strong className={`d-block mb-1 ${cat.is_available ? "text-dark" : "text-muted text-decoration-line-through"}`}>
                                                {cat.category_name}
                                            </strong>
                                            <span className="text-muted small d-block">Description: {cat.description || "N/A"}</span>
                                            {!cat.is_available && <span className="badge bg-danger-subtle text-danger mt-1">Unavailable</span>}
                                        </div>

                                        <div className="d-flex gap-2 flex-shrink-0">
                                            <button type="button" onClick={() => handleToggle(cat)} className={`btn btn-sm ${cat.is_available ? "btn-outline-danger" : "btn-outline-success"}`} disabled={loading}>
                                                {cat.is_available ? "Make Unavailable" : "Make Available"}
                                            </button>
                                            <button type="button" onClick={() => handleEditClick(cat)} className="btn btn-sm bg-white border border-light-subtle fw-semibold" disabled={loading}>
                                                Update
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </ScrollArea>
                    )}
                </>
            )}
        </Panel>
    );

    return <SplitLayout left={left} right={right} />;
};

export default CreateCategory;