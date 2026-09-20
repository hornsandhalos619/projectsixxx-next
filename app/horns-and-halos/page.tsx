import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PortalCta } from "@/components/PortalCta";
import { duality, portalArt } from "@/config/duality";

export const metadata: Metadata = {
  title: "Horns & Halos",
  description: `${duality.first} ${duality.second}`,
};

export default function HornsAndHalosPage() {
  return (
    <div className="portal-root">
      {/* Equal Horns + Halos entry atmosphere — split backdrop */}
      <div className="portal-splash" aria-hidden>
        <div className="portal-splash-half portal-splash-half--horns bl-portal-well bl-portal-well--plate">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="portal-splash-art" src={portalArt.hornsPortalPlate} alt="" />
        </div>
        <div className="portal-splash-half portal-splash-half--halos">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="portal-splash-art" src={portalArt.halosBg} alt="" />
        </div>
        <div className="portal-splash-veil" />
      </div>

      <div className="shell page-head portal-head">
        <div className="logo-bed logo-bed--portal logo-bed--dual">
          <div className="logo-bed-split" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="logo-bed-art logo-bed-art--horns" src={portalArt.hornsBg} alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="logo-bed-art logo-bed-art--halos" src={portalArt.halosBg} alt="" />
          </div>
          <div className="logo-bed-veil" />
          <p className="kicker logo-bed-title">World portal</p>
        </div>
        <h1>{duality.title}</h1>
        <p className="lede portal-first">{duality.first}</p>
        <p className="portal-second">{duality.second}</p>
      </div>

      <section className="nave" aria-label="The two gates">
        <article className="nave-field nave-field--horns" id="horns">
          <Image
            className="nave-bg"
            src={portalArt.hornsBg}
            alt=""
            fill
            priority
            sizes="50vw"
          />
          <div className="nave-veil" aria-hidden />
          <div className="gate-stack">
            <div className="gate-wordmark">
              <Image
                className="gate-emblem"
                src={portalArt.emblemHorns}
                alt=""
                width={96}
                height={96}
                priority
              />
              <h2>Horns</h2>
            </div>
            <p className="gate-line">{duality.hornsStandalone}</p>
          </div>
        </article>

        <article className="nave-field nave-field--halos" id="halos">
          <Image
            className="nave-bg"
            src={portalArt.halosBg}
            alt=""
            fill
            priority
            sizes="50vw"
          />
          <div className="nave-veil" aria-hidden />
          <div className="gate-stack">
            <div className="gate-wordmark">
              <Image
                className="gate-emblem"
                src={portalArt.emblemHalos}
                alt=""
                width={96}
                height={96}
                priority
              />
              <h2>Halos</h2>
            </div>
            <p className="gate-line">{duality.halosStandalone}</p>
          </div>
        </article>
      </section>

      <div className="shell section section--centered">
        <div className="cta-row cta-row--centered">
          <PortalCta className="btn btn-silver">Cross the Threshold</PortalCta>
          <Link className="btn btn-silver" href="/gallery/project-sixxx">
            House roster
          </Link>
          <Link className="btn" href="/journal">
            Journal
          </Link>
        </div>
      </div>
    </div>
  );
}
