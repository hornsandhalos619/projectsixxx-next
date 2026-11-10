import type { Metadata } from "next";
import Link from "next/link";
import { FollowTheHouse } from "@/components/FollowTheHouse";
import { shareMetadata } from "@/lib/seo";
import {
  listTapestryLandings,
  tapestryCollectionLandingUrl,
  tapestryLandingPath,
} from "@/lib/tapestry-drop";

export const revalidate = 3600;

const title = "Crest Tapestries";
const description =
  "Heraldic wall tapestries from Horns & Halos and Project SiXXX. Original artwork for the walls of those who chose a side, or refused to.";

export const metadata: Metadata = {
  title,
  description,
  ...shareMetadata("/drop", { title, description }),
};

export default async function DropIndexPage() {
  const items = await listTapestryLandings();
  const collectionUrl = tapestryCollectionLandingUrl("landing-index");

  return (
    <div className="shell drop-page">
      <header className="page-head">
        <p className="kicker">The drop</p>
        <h1>{title}</h1>
        <p className="lede">{description}</p>
      </header>

      <FollowTheHouse spot="home" />

      {items.length === 0 ? (
        <p className="drop-empty">
          The drop is being set on the wall. Visit the shop to see the crest tapestries.
        </p>
      ) : (
        <ul className="drop-index-grid">
          {items.map((item) => (
            <li key={item.slug}>
              <Link className="drop-card" href={tapestryLandingPath(item.slug)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.imageAlt} />
                <div className="drop-card-copy">
                  <p className="kicker">{item.series}</p>
                  <h2>{item.shortTitle}</h2>
                  <p className="drop-price">{item.price}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="drop-shop-link">
        <a href={collectionUrl} rel="noopener noreferrer" target="_blank">
          See every crest tapestry on the shop
        </a>
      </p>
    </div>
  );
}
