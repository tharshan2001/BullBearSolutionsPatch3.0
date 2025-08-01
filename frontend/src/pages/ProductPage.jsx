import React from "react";
import ProductView from "../components/product/ProductView";
import FloatingNavBar from "../components/FloatingNavBar";
import Header from "../components/Header";
import AnimatedPage from "../components/AnimatedPage";
import ProductList from "../components/product/ProductList";

const ProductPage = () => {
  return (
    <div className="w-full min-h-screen overflow-y-auto bg-gradient-to-br from-[#1f1f2f] via-[#191c2d] to-[#101015]">
      <Header title="Products" />
      <AnimatedPage>
        <div className="max-w-[480px] md:max-w-[800px] lg:max-w-[1000px] mx-auto pt-[30px] pb-15 ">
          <ProductView />
          <ProductList />
        </div>
      </AnimatedPage>

      <FloatingNavBar />
    </div>
  );
};

export default ProductPage;
