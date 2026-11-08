import { postgres } from "../../infra/client.js";

export async function findProductById(
  productId: string,
): Promise<string | undefined> {
  const result = await postgres.query<{ id: string }>(
    `
      SELECT id
      FROM products
      WHERE id = $1
    `,
    [productId],
  );

  return result.rows[0]?.id;
}

export async function countProductsByCategory(
  category: string,
): Promise<string> {
  const result = await postgres.query<{ count: string }>(
    `
      SELECT COUNT(*) AS count
      FROM products
      WHERE category = $1
    `,
    [category],
  );

  return result.rows[0].count;
}


export async function searchProductsFullText(
  searchText: string
): Promise<string> {
  const result = await postgres.query<{
    id: string;
    total: string;
  }>(
    `
      SELECT
        id,
        COUNT(*) OVER() AS total
      FROM products
      WHERE
        to_tsvector(
          'simple',
          COALESCE(name, '') || ' ' || COALESCE(description, '')
        )
        @@ plainto_tsquery('simple', $1)
      ORDER BY id
      LIMIT 10
    `,
    [searchText]
  );

  const total = result.rows[0]?.total ?? "0";
  const ids = result.rows.map((row) => row.id);

  return JSON.stringify({ total, ids });
}
