import { useRouter } from 'next/router';
import { useEffect } from 'react';

const CategoryRedirect = () => {
  const router = useRouter();
  const { category } = router.query;

  useEffect(() => {
    if (category) {
      // Redirect to products page with category filter
      router.replace(`/products?category=${category}`);
    }
  }, [category, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );
};

export default CategoryRedirect;
