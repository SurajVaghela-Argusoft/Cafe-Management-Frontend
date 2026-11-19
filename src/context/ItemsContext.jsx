import { useState, useEffect } from "react"
import { createContext } from "react"
// import axios from "axios";
// import axios from "../../../api";
import axios from "../api";

export const itemsContext = createContext()

const ItemsContext = (props) => {
  const [dbitems, setItems] = useState([]);

  console.log("Current State of dbitems:", dbitems);

  useEffect(() => {
    const fetchMenuData = async () => {
      const [itemsResponse] = await Promise.all([
        axios.get("/food/getitems")
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