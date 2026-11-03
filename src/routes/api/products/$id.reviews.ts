// GET/POST /api/products/:id/reviews
// Review bodies live in R2, one JSON object per product. Product aggregate
// scores stay in D1 so catalog/PDP cards can read them cheaply.

import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import { getDB } from "@/server/db";
import { nanoid } from "@/server/ids";

type ProductReview = {
  id: string;
  name: string;
  age?: string;
  rating: number;
  quality: number;
  fit: number;
  design: number;
  text: string;
  createdAt: string;
  verified?: boolean;
};

type ReviewsObject = {
  productId: string;
  reviews: ProductReview[];
  updatedAt: string;
};

type ProductAggregateRow = {
  id: string;
  rating: number;
  review_count: number;
  review_quality: number;
  review_fit: number;
  review_design: number;
};

type ReviewInput = {
  name?: unknown;
  age?: unknown;
  rating?: unknown;
  quality?: unknown;
  fit?: unknown;
  design?: unknown;
  text?: unknown;
};

const MAX_NAME_LEN = 80;
const MAX_AGE_LEN = 20;
const MAX_TEXT_LEN = 2000;

function reviewsKey(productId: string) {
  return `reviews/products/${productId}.json`;
}

function score(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < 1 || rounded > 5) return null;
  return rounded;
}

function cleanText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function average(oldValue: number, oldCount: number, currentValue: number) {
  return Number(
    (((oldValue || 0) * oldCount + currentValue) / (oldCount + 1)).toFixed(4),
  );
}

async function readReviews(
  bucket: R2Bucket,
  productId: string,
): Promise<ReviewsObject> {
  const object = await bucket.get(reviewsKey(productId));
  if (!object) {
    return { productId, reviews: [], updatedAt: new Date(0).toISOString() };
  }
  try {
    const data = await object.json<ReviewsObject>();
    return {
      productId,
      reviews: Array.isArray(data.reviews) ? data.reviews : [],
      updatedAt:
        typeof data.updatedAt === "string"
          ? data.updatedAt
          : new Date(0).toISOString(),
    };
  } catch {
    return { productId, reviews: [], updatedAt: new Date(0).toISOString() };
  }
}

export const Route = createFileRoute("/api/products/$id/reviews")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const bucket = (env as unknown as { PRODUCTS_BUCKET?: R2Bucket })
          .PRODUCTS_BUCKET;
        if (!bucket) {
          return Response.json(
            { error: "r2_binding_missing" },
            { status: 500 },
          );
        }

        const data = await readReviews(bucket, params.id);
        return Response.json(
          { reviews: data.reviews },
          { headers: { "Cache-Control": "no-store" } },
        );
      },

      POST: async ({ request, params }) => {
        const bucket = (env as unknown as { PRODUCTS_BUCKET?: R2Bucket })
          .PRODUCTS_BUCKET;
        if (!bucket) {
          return Response.json(
            { error: "r2_binding_missing" },
            { status: 500 },
          );
        }

        let body: ReviewInput;
        try {
          body = (await request.json()) as ReviewInput;
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }

        const name = cleanText(body.name, MAX_NAME_LEN);
        const age = cleanText(body.age, MAX_AGE_LEN);
        const text = cleanText(body.text, MAX_TEXT_LEN);
        const rating = score(body.rating);
        const quality = score(body.quality);
        const fit = score(body.fit);
        const design = score(body.design);

        if (
          !name ||
          !text ||
          rating == null ||
          quality == null ||
          fit == null ||
          design == null
        ) {
          return Response.json({ error: "invalid_review" }, { status: 400 });
        }

        const db = getDB();
        const product = await db
          .prepare(
            `SELECT id, rating, review_count, review_quality, review_fit, review_design
             FROM products
             WHERE id = ? AND archived_at IS NULL
             LIMIT 1`,
          )
          .bind(params.id)
          .first<ProductAggregateRow>();

        if (!product) {
          return Response.json({ error: "product_not_found" }, { status: 404 });
        }

        const now = new Date().toISOString();
        const review: ProductReview = {
          id: nanoid(),
          name,
          ...(age ? { age } : {}),
          rating,
          quality,
          fit,
          design,
          text,
          createdAt: now,
          verified: false,
        };

        const existing = await readReviews(bucket, params.id);
        const reviews = [review, ...existing.reviews];
        await bucket.put(
          reviewsKey(params.id),
          JSON.stringify({ productId: params.id, reviews, updatedAt: now }),
          { httpMetadata: { contentType: "application/json; charset=utf-8" } },
        );

        const oldCount = Math.max(0, Math.round(product.review_count || 0));
        const aggregates = {
          rating: average(product.rating, oldCount, rating),
          reviewCount: oldCount + 1,
          reviewQuality: average(product.review_quality, oldCount, quality),
          reviewFit: average(product.review_fit, oldCount, fit),
          reviewDesign: average(product.review_design, oldCount, design),
        };

        await db
          .prepare(
            `UPDATE products
             SET rating = ?,
                 review_count = ?,
                 review_quality = ?,
                 review_fit = ?,
                 review_design = ?,
                 updated_at = ?
             WHERE id = ?`,
          )
          .bind(
            aggregates.rating,
            aggregates.reviewCount,
            aggregates.reviewQuality,
            aggregates.reviewFit,
            aggregates.reviewDesign,
            Date.now(),
            params.id,
          )
          .run();

        return Response.json({ review, reviews, aggregates });
      },
    },
  },
});
