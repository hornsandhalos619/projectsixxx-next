import {
  Cinzel_Decorative,
  Great_Vibes,
  IM_Fell_English,
} from "next/font/google";
import {
  manifestoAxiom,
  manifestoParagraphs,
  manifestoSignoff,
  manifestoTitle,
  manifestoWelcome,
} from "@/config/manifesto";
import { ManifestoUnroll } from "@/components/ManifestoUnroll";

const imFell = IM_Fell_English({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-manifesto-fell",
  display: "swap",
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-manifesto-cinzel",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-manifesto-script",
  display: "swap",
});

function renderMarks(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    const marked = part.match(/^\*\*([^*]+)\*\*$/);
    if (marked) {
      return <strong key={index}>{marked[1]}</strong>;
    }
    return part;
  });
}

function ScrollPole({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      className={`manifesto-pole manifesto-pole--${position}`}
      aria-hidden="true"
    >
      <span className="manifesto-pole__knob manifesto-pole__knob--left" />
      <span className="manifesto-pole__shaft" />
      <span className="manifesto-pole__knob manifesto-pole__knob--right" />
    </div>
  );
}

export function Manifesto() {
  const paragraphs = manifestoParagraphs();

  return (
    <section
      id="manifesto"
      className={`section manifesto ${imFell.variable} ${cinzelDecorative.variable} ${greatVibes.variable}`}
      aria-labelledby="manifesto-heading"
    >
      <noscript>
        <style>{`#manifesto .manifesto-reveal{max-height:none!important}#manifesto .manifesto-curl{height:0!important;opacity:0!important}`}</style>
      </noscript>
      <div className="manifesto-stage">
        <ManifestoUnroll>
          <ScrollPole position="top" />
          <div className="manifesto-reveal">
            <article
              className="manifesto-scroll"
              aria-label="Manifesto parchment scroll"
            >
              <div className="manifesto-texture" aria-hidden="true" />
              <div className="manifesto-foxing" aria-hidden="true" />
              <div className="manifesto-cracks" aria-hidden="true" />
              <div className="manifesto-burn" aria-hidden="true" />
              <div className="manifesto-corner manifesto-corner--tl" aria-hidden />
              <div className="manifesto-corner manifesto-corner--tr" aria-hidden />
              <div className="manifesto-corner manifesto-corner--bl" aria-hidden />
              <div className="manifesto-corner manifesto-corner--br" aria-hidden />
              <div className="manifesto-ornate" aria-hidden>
                <span className="manifesto-star manifesto-star--tl" />
                <span className="manifesto-star manifesto-star--tr" />
                <span className="manifesto-star manifesto-star--bl" />
                <span className="manifesto-star manifesto-star--br" />
              </div>
              <div className="manifesto-body">
                <h2 id="manifesto-heading">{manifestoTitle}</h2>
                <p className="manifesto-rule">Est. in Darkness</p>
                <div className="manifesto-prose">
                  {paragraphs.map((paragraph, index) => {
                    if (paragraph === manifestoSignoff) {
                      return (
                        <p className="manifesto-sign" key={paragraph}>
                          {paragraph}
                        </p>
                      );
                    }

                    const className =
                      index === 0
                        ? "manifesto-lead"
                        : paragraph === manifestoAxiom
                          ? "manifesto-axiom"
                          : paragraph === manifestoWelcome
                            ? "manifesto-welcome"
                            : undefined;

                    return (
                      <p className={className} key={paragraph}>
                        {renderMarks(paragraph)}
                      </p>
                    );
                  })}
                </div>
              </div>
            </article>
            <div className="manifesto-leading" aria-hidden="true">
              <div className="manifesto-curl">
                <span className="manifesto-curl__lip" />
                <span className="manifesto-curl__barrel" />
              </div>
              <ScrollPole position="bottom" />
            </div>
          </div>
          <div className="manifesto-contact" aria-hidden="true" />
        </ManifestoUnroll>
      </div>
    </section>
  );
}
