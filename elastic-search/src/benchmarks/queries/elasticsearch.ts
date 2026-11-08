import { elasticSearch } from "../../infra/client.js";
import { PRODUCT_INDEX } from "../../infra/product-index.js";

export async function getProductById(
  productId: string,
): Promise<string | undefined> {
  const response = await elasticSearch.get<{ id: string }>({
    index: PRODUCT_INDEX,
    id: productId,
    _source_includes: ["id"],
  });

  return response._source?.id;
}

export async function searchProductById(
  productId: string,
): Promise<string | undefined> {
  const response = await elasticSearch.search<{ id: string }>({
    index: PRODUCT_INDEX,
    size: 1,
    _source: ["id"],
    query: {
      term: {
        id: productId,
      },
    },
  });

  return response.hits.hits[0]?._source?.id;
}

export async function countProductsByCategory(
  category: string,
): Promise<string> {
  const response = await elasticSearch.search({
    index: PRODUCT_INDEX,
    size: 0,
    track_total_hits: true,
    query: {
      term: {
        category,
      },
    },
  });

  const total = response.hits.total;

  if (total === undefined) {
    throw new Error("Elasticsearch did not return total hits");
  }

  return String(typeof total === "number" ? total : total.value);
}

export async function searchProductsFullText(
  searchText: string,
): Promise<string> {
  const response = await elasticSearch.search<{ id: string }>({
    index: PRODUCT_INDEX,
    size: 10,
    track_total_hits: true,
    _source: ["id"],

    query: {
      combined_fields: {
        query: searchText,
        fields: ["name", "description"],
        operator: "and",
      },
    },
  });

  const total = response.hits.total;

  if (total === undefined) {
    throw new Error("Elasticsearch did not return total hits");
  }

  const totalCount = typeof total === "number" ? total : total.value;

  const ids = response.hits.hits
    .map((hit) => hit._source?.id)
    .filter((id): id is string => id !== undefined);

  return JSON.stringify({
    total: String(totalCount),
    ids,
  });
}
