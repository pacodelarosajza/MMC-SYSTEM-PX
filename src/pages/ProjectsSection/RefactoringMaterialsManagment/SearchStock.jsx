import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLongArrowAltLeft } from "@fortawesome/free-solid-svg-icons";

// Custom function to calculate similarity between two strings
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  const longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (
    (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength)
  );
};

const editDistance = (str1, str2) => {
  const costs = [];
  for (let i = 0; i <= str1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= str2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) {
      costs[str2.length] = lastValue;
    }
  }
  return costs[str2.length];
};

const SearchStock = ({ id }) => {
  const [items, setItems] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantityToTake, setQuantityToTake] = useState(0);
  const apiIpAddress = import.meta.env.VITE_API_IP_ADDRESS;

  const handleClose = () => {
    window.location.reload();
  };

  const handlePatchClick = (item) => {
    setSelectedItem(item);
  };

  const handleQuantityChange = (e) => {
    const maxQuantity = Math.min(
      selectedItem.matchedStockItem.stock_items[0].stock.stock_quantity,
      selectedItem.subassembly_assignment_quantity
    );
    const value = Math.min(e.target.value, maxQuantity);
    setQuantityToTake(value);
  };

  const handlePatchSubmit = async () => {
    if (quantityToTake > 0) {
      try {
        const newQuantity =
          selectedItem.subassembly_assignment_quantity - quantityToTake;

        const projectResponse = await fetch(
          `${apiIpAddress}/api/patchItem/${selectedItem.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subassembly_assignment_quantity: newQuantity,
              ...(newQuantity === 0 && { in_subassembly: 1 }),
            }),
          }
        );

        if (!projectResponse.ok) {
          throw new Error("Failed to update project item");
        }

        const newStockQuantity =
          selectedItem.matchedStockItem.stock_items[0].stock.stock_quantity -
          quantityToTake;

        let stockResponse;
        if (newStockQuantity === 0) {
          stockResponse = await fetch(
            `${apiIpAddress}/api/items/${selectedItem.matchedStockItem.id}/stock`,
            {
              method: "DELETE",
            }
          );
        } else {
          stockResponse = await fetch(
            `${apiIpAddress}/api/items/${selectedItem.matchedStockItem.id}/stock`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                stock_quantity: newStockQuantity,
              }),
            }
          );
        }

        if (!stockResponse.ok) {
          throw new Error("Failed to update stock item");
        }

        setMatches((prevMatches) =>
          prevMatches.map((match) =>
            match === selectedItem
              ? {
                  ...match,
                  processed: true,
                  matchedStockItem: {
                    ...match.matchedStockItem,
                    stock_items: [
                      {
                        ...match.matchedStockItem.stock_items[0],
                        stock: {
                          ...match.matchedStockItem.stock_items[0].stock,
                          stock_quantity: newStockQuantity,
                        },
                      },
                    ],
                  },
                }
              : match
          )
        );
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.number_material === selectedItem.number_material
              ? {
                  ...item,
                  processed: true,
                  subassembly_assignment_quantity: newQuantity,
                  ...(newQuantity === 0 && { in_subassembly: 1 }),
                }
              : item
          )
        );
      } catch (error) {
        console.error(error);
      }
    }
    // Close the modal
    setSelectedItem(null);
    setQuantityToTake(0);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setQuantityToTake(0);
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(
          `${apiIpAddress}/api/getItems/project/${id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch project items");
        }
        const result = await response.json();
        setItems(result);
      } catch (error) {
        console.error(error);
      }
    };

    fetchItems();
  }, [id, apiIpAddress]);

  useEffect(() => {
    const fetchStockItems = async () => {
      try {
        const response = await fetch(`${apiIpAddress}/api/items-with-stock`);
        if (!response.ok) {
          throw new Error("Failed to fetch stock items");
        }
        const result = await response.json();
        setStockItems(result);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStockItems();
  }, [apiIpAddress]);

  {
    /* FUNCION PARA EVITAR DUPLICADOS */
  }
  useEffect(() => {
    const findMatches = () => {
      let remainingItems = [...items];
      const matchedItems = [];

      while (remainingItems.length > 0) {
        const newMatches = remainingItems.flatMap((item) => {
          const matchedStockItems = stockItems.filter(
            (stockItem) =>
              calculateSimilarity(
                stockItem.description.toLowerCase(),
                item.description.toLowerCase()
              ) > 0.5
          );
          {
            /* ) > 0.7 && // Increase similarity threshold
              stockItem.supplier.toLowerCase() === item.supplier.toLowerCase() && // Match supplier
              stockItem.number_material === item.number_material // Match material number */
          }
          return matchedStockItems.map((matchedStockItem) => ({
            ...item,
            matchedStockItem,
          }));
        });

        if (newMatches.length === 0) {
          break;
        }

        matchedItems.push(...newMatches);
        remainingItems = remainingItems.filter(
          (item) => !newMatches.some((match) => match.id === item.id)
        );
      }

      setMatches(matchedItems);
    };

    if (items.length > 0 && stockItems.length > 0) {
      findMatches();
    }
  }, [items, stockItems]);

  if (!isVisible) {
    return null;
  }

  const groupedMatches = matches.reduce((acc, item) => {
    if (!acc[item.id]) {
      acc[item.id] = [];
    }
    acc[item.id].push(item);
    return acc;
  }, {});

  return (
    <div className="submit-materials-container fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-60 transition-opacity duration-300">
      <div className="py-6 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl transform scale-100 transition-transform duration-200 w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-blue-200">
        <div className="px-2 flex flex-col">
                   <div className="flex justify-between gap-2">
            <div className="flex gap-2">
            <h1 className="text-lg font-extrabold text-gray-500">
              Materials Matching.
            </h1>
            <h1 className="text-xl font-bold mb-10 text-blue-600">
              Search for matches in stock
            </h1>
            </div>
            <div>
            <button
          onClick={handleClose}
          className=" px-4 py-2 mx-2 font-medium hover:bg-red-600 bg-pageBackground rounded"          >
          Close
        </button>
            </div>
           
           
          </div>
          
          <div className="grid grid-cols-12 gap-4">
            <h2 className="col-span-4 text-xl font-bold text-gray-300 text-center">
              Materials registered for the project{" "}
            </h2>
            <h2 className="col-span-5 text-xl font-bold text-gray-500 text-center">
              Stock matches
            </h2>
          </div>
          <hr className="border-t border-gray-500 mt-3 mb-10" />
          <div className="space-y-2">
            {Object.keys(groupedMatches).map((key, index) => (
              <React.Fragment key={index}>
                <div className="grid grid-cols-12 gap-10">
                  <div
                    className={`col-span-4 p-2 border-2 border-blue-500 bg-blue-500 bg-opacity-20 rounded-lg shadow-md ${
                      groupedMatches[key][0].processed ? "opacity-50" : ""
                    }`}
                  >
                    {/* CARD DE Materials registered for the project */}
                    <div className="flex text-lg gap-2 pb-1 font-bold">
                      <p className="text-gray-200">PART NUMBER:</p>
                      <p className="text-gray-400">
                        {groupedMatches[key][0].name}
                      </p>
                    </div>
                    <div className="flex gap-2 pb-1 font-semibold">
                      <p className="text-gray-200">MTL:</p>
                      <p className="text-gray-400">
                        {groupedMatches[key][0].number_material}
                      </p>
                      <div className="bg-white bg-opacity-10 px-1 flex rounded gap-1">
                        <p className="text-gray-200">QTY:</p>
                        <p className="text-gray-400">
                          {
                            groupedMatches[key][0]
                              .subassembly_assignment_quantity
                          }
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300">
                      {groupedMatches[key][0].description} / Supplier:{" "}
                      {groupedMatches[key][0].supplier}
                    </p>
                  </div>
                  <div className="col-span-6 space-y-2">
                    {groupedMatches[key].map((item, subIndex) => (
                      <div
                        key={subIndex}
                        className={`flex ${item.processed ? "opacity-50" : ""}`}
                      >
                        <button
                          id="patch-mtls"
                          className="text-gray-400 text-2xl p-1 m-1 hover:text-green-500 rounded"
                          onClick={() => handlePatchClick(item)}
                          disabled={item.processed}
                        >
                          <FontAwesomeIcon icon={faLongArrowAltLeft} />
                        </button>
                        <div className="p-4 border border-green-500 bg-green-500 bg-opacity-5 rounded-lg shadow-md">
                          <div className="text- flex gap-2 pb-1 font-bold">
                            {/* CARD DE Stock matches */}
                            <p className="text-gray-200">PART NUMBER:</p>
                            <p className="text-gray-400">
                              {item.matchedStockItem.name}
                            </p>
                            <div className="bg-white bg-opacity-10 px-1 flex rounded gap-1">
                              <p className="text-gray-200">QTY:</p>
                              <p className="text-gray-400">
                                {
                                  item.matchedStockItem.stock_items[0].stock
                                    .stock_quantity
                                }
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-300">
                            {item.matchedStockItem.description} / Supplier:{" "}
                            {item.matchedStockItem.supplier}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <hr className="border-t border-gray-700 my-4" />
              </React.Fragment>
            ))}
          </div>
        </div>
        
      </div>
      {selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Patch Materials</h2>
            <div className="flex mb-2">
              <div>Materials required for the project: </div>
              <div className="mx-2 px-2 bg-gray-700 rounded font-semibold">
                {selectedItem.subassembly_assignment_quantity}
              </div>
            </div>

            <div className="flex mb-2">
              <div>Stock Quantity:</div>
              <div
                className={`mx-2 px-2 bg-gray-700 rounded font-medium ${
                  selectedItem.matchedStockItem.stock_items[0].stock
                    .stock_quantity -
                    (quantityToTake || 0) <
                  0
                    ? "text-red-500"
                    : "bg-gray-700"
                }`}
              >
                {
                  selectedItem.matchedStockItem.stock_items[0].stock
                    .stock_quantity
                }{" "}
                - {quantityToTake || 0} ={" "}
                {selectedItem.matchedStockItem.stock_items[0].stock
                  .stock_quantity - (quantityToTake || 0)}
              </div>
            </div>
            <input
              type="number"
              value={quantityToTake}
              onChange={handleQuantityChange}
              className="border p-2 rounded w-full mb-4 bg-gray-800 border border-gray-700"
              placeholder="Enter quantity to take from stock"
              max={Math.min(
                selectedItem.matchedStockItem.stock_items[0].stock
                  .stock_quantity,
                selectedItem.subassembly_assignment_quantity
              )}
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCloseModal}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handlePatchSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={
                  selectedItem.matchedStockItem.stock_items[0].stock
                    .stock_quantity -
                    (quantityToTake || 0) <
                  0
                }
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchStock;
