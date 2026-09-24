import {
  manifestoAxiom,
  manifestoParagraphs,
  manifestoSignoff,
  manifestoTitle,
  manifestoWelcome,
} from "@/config/manifesto";

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

export function Manifesto() {
  const paragraphs = manifestoParagraphs();

  return (
    <section
      id="manifesto"
      className="section section--centered manifesto"
      aria-labelledby="manifesto-heading"
    >
      <div className="shell">
        <h2 id="manifesto-heading">{manifestoTitle}</h2>
        <div className="prose prose--centered manifesto-prose">
          {paragraphs.map((paragraph) => {
            if (paragraph === manifestoSignoff) {
              return (
                <p className="manifesto-sign" key={paragraph}>
                  {paragraph}
                </p>
              );
            }

            const className =
              paragraph === manifestoAxiom
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
    </section>
  );
}
