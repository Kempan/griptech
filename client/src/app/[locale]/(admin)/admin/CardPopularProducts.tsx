import { useGetDashboardMetricsQuery } from "@/app/state/api";
import { ShoppingBag } from "lucide-react";
import React from "react";
import Rating from "@/app/[locale]/(components)/admin/Rating";
import Image from "next/image";

const CardPopularProducts = () => {
  
  const { data: dashboardMetrics, isLoading } = useGetDashboardMetricsQuery();

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl pb-16">
      {isLoading ? (
        <div className="m-5">Loading...</div>
      ) : (
        <>
          <h3 className="text-lg font-semibold px-6 pt-5 pb-2">
            Popular Products
          </h3>
          <hr />
          <div className="overflow-auto h-full">
            {dashboardMetrics?.popularProducts && dashboardMetrics.popularProducts.length > 0 ? (
              dashboardMetrics.popularProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-3 px-5 py-7 border-b"
                >
                  <div className="flex items-center gap-3">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_AWS_BUCKET_PREFIX}/product${
                        Math.floor(Math.random() * 3) + 1
                      }.webp`}
                      alt={product.name}
                      width={48}
                      height={48}
                      className="rounded-lg w-14 h-14"
                    />
                    <div className="flex flex-col justify-between gap-1">
                      <div className="font-bold text-gray-700">
                        {product.name}
                      </div>
                      <div className="flex text-sm items-center">
                        <span className="font-bold text-gray-800 text-xs">
                          ${product.price}
                        </span>
                        <span className="mx-2">|</span>
                        <Rating rating={product.rating || 0} />
                      </div>
                    </div>
                  </div>

                  <div className="text-xs flex items-center">
                    <button className="p-2 rounded-full bg-gray-100 text-gray-600 mr-2">
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                    {Math.round(product.stockQuantity / 1000)}k Sold
                  </div>
                </div>
              ))
            ) : (
              <div className="p-5 text-center text-gray-500">
                No popular products available
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CardPopularProducts;
