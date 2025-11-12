import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'config/axios';

const CategoryProducts = () => {
  const router = useRouter();
  const { category } = router.query;
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!category) return;

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`/api/products`, {
          params: { category }
        });
        setProducts(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, [category]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Products in {category}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded shadow">
            <img src={product.image} alt={product.name} className="w-full h-40 object-cover mb-2" />
            <h2 className="text-lg font-semibold">{product.name}</h2>
            <p className="text-gray-600">${product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryProducts;
