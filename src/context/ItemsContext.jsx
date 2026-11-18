import { useState, useEffect } from "react"
import { createContext } from "react"
import axios from "axios";

export const itemsContext = createContext()

const ItemsContext = (props) => {
  const [dbitems, setItems] = useState([]);

  console.log("Current State of dbitems:", dbitems);

  useEffect(() => {
    const fetchMenuData = async () => {
      const [itemsResponse] = await Promise.all([
        axios.get("http://127.0.0.1:8000/food/getitems")
      ]);

      setItems(itemsResponse.data.data || []);
    };

    fetchMenuData();
  }, []);

  return (
    <itemsContext.Provider value={dbitems}>
      {props.children}
    </itemsContext.Provider>
  );
};


export default ItemsContext;