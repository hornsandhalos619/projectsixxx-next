import Link from "next/link";
import { loadHhProducts, selectLaneProducts } from "@/lib/horns-halos-shop";

export async function HornsHalosReleaseShelf({ lane }: { lane: "horns" | "halos" }) {
  const catalog = await loadHhProducts().catch(() => []);
  const products = selectLaneProducts(catalog, lane);
  return (
      <div className="hh-portal-shelf">
        {products.length > 0 && (
          <p>{products.length} live {products.length === 1 ? "piece" : "pieces"} · from $35</p>
        )}
        <div className="hh-portal-thumbs" aria-label={`${lane} Release 001 product listings`}>
          {products.map((product) => (
            <a key={product.handle} href={product.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${product.title} on Shopify`}>
              <div className="hh-image-withheld" role="img" aria-label="Product image withheld pending source verification"><span>Image withheld pending source verification</span></div>
              <span>{product.title}</span>
            </a>
          ))}
        </div>
        <Link className="btn btn-silver" href={`/horns-and-halos/shop/${lane}`}>Shop {lane === "horns" ? "Horns" : "Halos"}</Link>
      </div>
  );
}
