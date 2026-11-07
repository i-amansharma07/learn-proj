import { elasticSearch } from "./client.js";

export const PRODUCT_INDEX = "products";

/**

Type	      What it does	                Example
text	      Analyzed full-text search	    Product name
keyword	    Exact-value matching          Brand
integer   	Numeric operations            Stock
double	    Decimal numeric operations	  Price
date	      Date filtering and sorting    Creation date

 */
export async function createProductIndex() {
  const exists = await elasticSearch.indices.exists({
    index: PRODUCT_INDEX,
  });

  if (exists) {
    await elasticSearch.indices.delete({
      index: PRODUCT_INDEX,
    });
  }

  await elasticSearch.indices.create({
    index: PRODUCT_INDEX,

    mappings: {
      dynamic: "strict",

      properties: {
        id: {
          type: "keyword",
        },

        name: {
          type: "text",
          fields: {
            keyword: {
              type: "keyword",
            },
          },
        },

        description: {
          type: "text",
        },

        category: {
          type: "keyword",
        },

        brand: {
          type: "keyword",
        },

        price: {
          type: "double",
        },

        stock: {
          type: "integer",
        },

        createdAt: {
          type: "date",
        },
      },
    },
  });

  console.log("Product index created successfully");
}
