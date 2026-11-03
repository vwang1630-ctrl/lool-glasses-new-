import { LangLink } from "@/components/LangLink";
import { Product } from "@/data/products";
import { useI18n } from "@/lib/i18n";
import { pickLang } from "@/lib/lang";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Camera, Star, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  isLocallyRecommended,
  useGeoRecommend,
} from "@/hooks/use-geo-recommend";
import tortoiseAngle from "@/assets/gallery/tortoise-angle.jpg";
import goldAngle from "@/assets/gallery/gold-angle.jpg";
import blackAngle from "@/assets/gallery/black-angle.jpg";

// Map front-frame PNG → angled "back face" image used during hover flip
function getAngleImg(framePng: string): string {
  if (framePng.includes("tortoise")) return tortoiseAngle;
  if (framePng.includes("gold")) return goldAngle;
  return blackAngle;
}

export function ProductCard({ product }: { product: Product }) {
  const { t, contentLang, localizeProductName } = useI18n();
  const { has, toggle } = useFavorites();
  const liked = has(product.id);
  const geo = useGeoRecommend();
  const localPick = isLocallyRecommended(product, geo);
  const displayName = localizeProductName(
    product.slug,
    pickLang(product.name, contentLang),
  );

  const onFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    toast.success(liked ? t("favorites.removed") : t("favorites.added"));
  };

  return (
    <LangLink
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group block"
      data-i18n-scope="product-card"
    >
      <div
        className={`card-media relative aspect-[5/4] ${product.categories.includes("presbyopia") ? "bg-gradient-presbyopia" : "bg-gradient-myopia"}`}
        style={{ perspective: "1200px" }}
      >
        {/* Overlays stay above the flipping card */}
        <button
          onClick={onFav}
          aria-label="favorite"
          className="absolute top-3 right-3 z-20 inline-flex items-center justify-center w-8 h-8 rounded-full bg-background/85 backdrop-blur hover:bg-background transition-smooth"
        >
          <Heart
            className={`w-4 h-4 ${liked ? "text-primary fill-primary" : "text-foreground/70"}`}
          />
        </button>
        {localPick && (
          <span className="absolute bottom-3 left-3 z-20 inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-background/90 backdrop-blur text-foreground shadow-sm">
            <Sparkles className="w-3 h-3 text-primary" />
            {contentLang === "zh" ? "本地热门推荐" : "AI pick for your region"}
          </span>
        )}

        {/* NEW / HOT badges */}
        {(product.isNew || product.bestseller) && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
            {product.isNew ? (
              <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-primary text-primary-foreground shadow-sm">
                {t("pdp.badge.new")}
              </span>
            ) : product.bestseller ? (
              <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-foreground text-background shadow-sm">
                {t("section.bestseller")}
              </span>
            ) : null}
          </div>
        )}

        {/* 3D flip container. Back face is the product's own second gallery
            image (typically a model-worn shot). Falls back to the legacy
            static angle assets when the catalog row only has a hero image. */}
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out group-hover:[transform:rotateY(180deg)]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front face — product-level card hero. Falls back to framePng
              (legacy try-on PNG) only when card_image_url isn't seeded yet.
              Uses object-cover (no padding, no blend) so the photo fully
              fills the card and the gradient background doesn't peek through
              the edges on mobile. */}
          <img
            src={product.cardImageUrl ?? product.framePng}
            alt={displayName}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          />
          {/* Back face — product-level lifestyle/model-worn shot. Falls back
              to the first color's second image, then to the legacy static
              angle asset, only when card_hover_image_url isn't seeded yet. */}
          <img
            src={
              product.cardHoverImageUrl ??
              product.colors?.[0]?.images?.[1] ??
              getAngleImg(product.framePng)
            }
            alt={displayName}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3 z-20 flex justify-end opacity-0 group-hover:opacity-100 transition-smooth">
          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-background/90 text-foreground shadow-sm">
            <Camera className="w-3 h-3" /> {t("product.tryon")}
          </span>
        </div>
      </div>
      <div className="mt-3 px-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium leading-snug">{displayName}</h3>
          <span className="text-sm font-semibold whitespace-nowrap">
            ${product.priceUSD}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="w-3 h-3 fill-current text-amber-500" />
          {product.rating.toFixed(1)} · {product.reviewCount}
        </div>
      </div>
    </LangLink>
  );
}
