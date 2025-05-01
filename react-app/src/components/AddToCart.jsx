// 
import { useEffect, useState } from "react";
import Header from "./Header";
import axios from "axios";
import Categories from "./Categories";
import "./Home.css";
import API_URL from "../constants";

function AddToCart() {
    const [products, setproducts] = useState([]);
    const [cproducts, setcproducts] = useState([]);
    const [search, setsearch] = useState("");

    useEffect(() => {
        const url = API_URL + "/add-cart";
        let data = { userId: localStorage.getItem("userId") };
        axios
            .post(url, data)
            .then((res) => {
                console.log(res.data); // Debug response
                if (res.data.products) {
                    setproducts(res.data.products);
                    setcproducts(res.data.products); // Initialize filtered products
                }
            })
            .catch((err) => {
                console.error(err); // Debug error
                alert("Server Err.");
            });
    }, []);

    const handlesearch = (value) => {
        setsearch(value);
    };

    const handleClick = () => {
        let filteredProducts = products.filter((item) =>
            item.pname.toLowerCase().includes(search.toLowerCase()) ||
            item.pdesc.toLowerCase().includes(search.toLowerCase()) ||
            item.category.toLowerCase().includes(search.toLowerCase())
        );
        setcproducts(filteredProducts);
    };

    const handleCategory = (value) => {
        let filteredProducts = products.filter((item) => item.category === value);
        setcproducts(filteredProducts);
    };

    const handleaddtocart = (productId) => {
        let userId = localStorage.getItem("userId");

        const url = API_URL + "/add-cart";
        const data = { userId, productId };
        axios
            .post(url, data)
            .then((res) => {
                if (res.data.message) {
                    alert("Added to cart.");
                }
            })
            .catch((err) => {
                console.error(err);
                alert("Server Err.");
            });
    };

    return (
        <div>
            <Header search={search} handlesearch={handlesearch} handleClick={handleClick} />
            <Categories handleCategory={handleCategory} />

            <div className="d-flex justify-content-center flex-wrap">
                {cproducts && cproducts.length > 0 ? (
                    cproducts.map((item) => (
                        <div key={item._id} className="card m-3 ">
                            <div onClick={() => handleaddtocart(item._id)} className="icon-con"></div>
                            <img width="300px" height="200px" src={API_URL + "/" + item.pimage} alt="" />
                            <p className="m-2">
                                {item.pname} | {item.category}
                            </p>
                            <h3 className="m-2 text-danger">{item.price}</h3>
                            <p className="m-2 text-success">{item.pdesc}</p>
                        </div>
                    ))
                ) : (
                    <p>No products found</p>
                )}
            </div>
        </div>
    );
}

export default AddToCart;
