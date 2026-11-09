import { Reveal } from "../motion/Reveal";

export function PageHero({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <section className="grain border-b border-line bg-ivory-deep/60">
      <Reveal className="container max-w-3xl py-14 text-center sm:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 text-balance font-serif text-4xl font-semibold leading-tight sm:text-6xl">{title}</h1>
        {text && <p className="mx-auto mt-4 max-w-xl text-ink-soft">{text}</p>}
      </Reveal>
    </section>
  );
}
