"use client"

import { useEffect, useRef, useState } from "react"

const NAV_SECTIONS = [
  { id: "hero", label: "Intro" },
  { id: "origines", label: "1913" },
  { id: "miuccia", label: "Miuccia" },
  { id: "nylon", label: "Le sac nylon" },
  { id: "galerie", label: "Icônes" },
  { id: "groupe", label: "Le groupe" },
  { id: "chiffres", label: "Chiffres" },
  { id: "durable", label: "Re-Nylon" },
  { id: "sources", label: "Sources" },
]

const GALLERY_ITEMS = [
  {
    year: "1913",
    title: "Malletier Prada",
    text: "Fondée par Mario Prada Galleria Vittorio Emanuele II, Milan. Malles et sacs en cuir pour une clientèle aristocratique.",
    pattern: "diag",
  },
  {
    year: "1984",
    title: "Le sac Pocone",
    text: "Un sac à dos en toile de nylon technique (Pocono) — matière industrielle détournée en objet de luxe minimaliste.",
    pattern: "dots",
  },
  {
    year: "1990s",
    title: "Cuir Saffiano",
    text: "Cuir texturé, résistant aux rayures et à l'eau — devenu la signature discrète des sacs Prada.",
    pattern: "cross",
  },
  {
    year: "2000",
    title: "Mocassins & Linea Rossa",
    text: "Prada Sport (Linea Rossa) : la ligne technique, entre performance sportive et vestiaire quotidien.",
    pattern: "stripe",
  },
  {
    year: "2019",
    title: "Re-Nylon",
    text: "Le nylon ECONYL, régénéré à partir de déchets plastiques (filets de pêche, textiles), remplace le nylon vierge.",
    pattern: "wave",
  },
]

const STATS = [
  { value: 1913, suffix: "", label: "Année de fondation, à Milan" },
  { value: 1978, suffix: "", label: "Arrivée de Miuccia Prada à la tête de la maison" },
  { value: 6, suffix: "+", label: "Maisons dans le groupe Prada (Prada, Miu Miu, Church's, Car Shoe…)" },
  { value: 45, suffix: "+", label: "Pays où la maison est distribuée" },
]

function useOnScreen<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true)
    }, options ?? { threshold: 0.2 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [options])

  return { ref, visible }
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children?: React.ReactNode
  className?: string
  delay?: number
}) {
  const { ref, visible } = useOnScreen<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const { ref, visible } = useOnScreen<HTMLSpanElement>({ threshold: 0.5 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!visible) return
    const duration = 1200
    const start = performance.now()
    let raf: number
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(value * eased))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [visible, value])

  return (
    <span ref={ref} className="stat-value">
      {display}
      {suffix}
    </span>
  )
}

export default function PradaPage() {
  const [progress, setProgress] = useState(0)
  const [activeSection, setActiveSection] = useState("hero")

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      const scrollTop = doc.scrollTop
      const height = doc.scrollHeight - doc.clientHeight
      setProgress(height > 0 ? (scrollTop / height) * 100 : 0)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: "-45% 0px -45% 0px" }
    )
    NAV_SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <main className="prada-root">
      <div className="progress-bar" style={{ width: `${progress}%` }} />

      <nav className="side-nav" aria-label="Navigation des sections">
        {NAV_SECTIONS.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className={`side-nav-dot ${activeSection === section.id ? "active" : ""}`}
            aria-label={section.label}
          >
            <span className="side-nav-tooltip">{section.label}</span>
          </a>
        ))}
      </nav>

      <section id="hero" className="section hero">
        <div className="hero-bg" />
        <Reveal className="hero-content">
          <p className="eyebrow">Maison de luxe italienne · Milan, 1913</p>
          <h1 className="hero-title">PRADA</h1>
          <p className="hero-subtitle">
            De la maroquinerie milanaise à l&apos;empire du luxe contemporain —
            un siècle d&apos;audace, de minimalisme et de réinvention.
          </p>
          <a href="#origines" className="scroll-cue">
            <span>Défiler pour découvrir</span>
            <span className="scroll-cue-arrow" />
          </a>
        </Reveal>
      </section>

      <section id="origines" className="section split">
        <Reveal className="split-media pattern-diag" />
        <Reveal className="split-text" delay={100}>
          <p className="eyebrow">01 — Les origines</p>
          <h2>1913, Galleria Vittorio Emanuele II</h2>
          <p>
            Mario Prada ouvre une boutique de maroquinerie et d&apos;articles de
            voyage en plein cœur de Milan. Malles, sacs et accessoires en cuir
            et en peau d&apos;autruche séduisent une clientèle aristocratique —
            la maison devient rapidement fournisseur officiel de la maison
            royale d&apos;Italie en 1919.
          </p>
        </Reveal>
      </section>

      <section id="miuccia" className="section split reverse">
        <Reveal className="split-text" delay={100}>
          <p className="eyebrow">02 — La rupture créative</p>
          <h2>1978 — Miuccia Prada prend les rênes</h2>
          <p>
            Petite-fille du fondateur, docteure en sciences politiques et mime
            de formation, Miuccia Prada transforme la maison familiale en
            laboratoire créatif. Avec son associé Patrizio Bertelli, elle
            impose une esthétique intellectuelle, en rupture avec le luxe
            ostentatoire des années 1980 : le « laid chic ».
          </p>
        </Reveal>
        <Reveal className="split-media pattern-cross" />
      </section>

      <section id="nylon" className="section split">
        <Reveal className="split-media pattern-dots" />
        <Reveal className="split-text" delay={100}>
          <p className="eyebrow">03 — L&apos;objet culte</p>
          <h2>1984 — Le sac en nylon</h2>
          <p>
            Miuccia détourne le Pocono, un tissu technique utilisé pour les
            housses de parachute et le matériel militaire, pour créer un sac à
            dos noir, minimaliste, sans logo apparent. Provocation totale dans
            un monde du luxe fondé sur le cuir : le nylon devient un signe de
            reconnaissance discret, presque anti-bling.
          </p>
        </Reveal>
      </section>

      <section id="galerie" className="section gallery-section">
        <Reveal>
          <p className="eyebrow center">04 — Pièces iconiques</p>
          <h2 className="center">Une chronologie d&apos;objets cultes</h2>
        </Reveal>
        <div className="gallery-scroll">
          {GALLERY_ITEMS.map((item) => (
            <div className="gallery-card" key={item.title}>
              <div className={`gallery-card-visual pattern-${item.pattern}`} />
              <div className="gallery-card-body">
                <span className="gallery-year">{item.year}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="gallery-hint">← Fais défiler horizontalement →</p>
      </section>

      <section id="groupe" className="section split reverse">
        <Reveal className="split-text" delay={100}>
          <p className="eyebrow">05 — Un groupe, plusieurs maisons</p>
          <h2>Prada Group</h2>
          <p>
            Au fil des rachats, Prada devient un groupe : Miu Miu (1993, la
            griffe plus ludique et jeune de Miuccia), Church&apos;s (chaussures
            anglaises traditionnelles), Car Shoe (mocassins de conduite) et
            Marchesi 1824 (pâtisserie milanaise historique). En 2011, le
            groupe entre en bourse à Hong Kong.
          </p>
        </Reveal>
        <Reveal className="split-media pattern-stripe" />
      </section>

      <section id="chiffres" className="section stats-section">
        <Reveal>
          <p className="eyebrow center">06 — En quelques chiffres</p>
          <h2 className="center">Un siècle en repères</h2>
        </Reveal>
        <div className="stats-grid">
          {STATS.map((stat) => (
            <Reveal key={stat.label} className="stat-card">
              <Counter value={stat.value} suffix={stat.suffix} />
              <p>{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="durable" className="section split">
        <Reveal className="split-media pattern-wave" />
        <Reveal className="split-text" delay={100}>
          <p className="eyebrow">07 — Engagement</p>
          <h2>Re-Nylon : vers un luxe plus responsable</h2>
          <p>
            Depuis 2019, Prada s&apos;engage avec Re-Nylon : le nylon ECONYL,
            régénéré à partir de déchets plastiques océaniques, de filets de
            pêche et de résidus textiles, remplace progressivement le nylon
            vierge dans les collections. La maison s&apos;est aussi associée à
            l&apos;UNESCO sur la protection des océans.
          </p>
        </Reveal>
      </section>

      <section id="sources" className="section sources-section">
        <Reveal>
          <p className="eyebrow center">Pour aller plus loin</p>
          <h2 className="center">Sources à citer à l&apos;oral</h2>
          <ul className="sources-list">
            <li>Site officiel Prada Group — prada.com / pradagroup.com</li>
            <li>Fondazione Prada — fondazioneprada.org</li>
            <li>Programme Re-Nylon — communication officielle Prada</li>
            <li>
              Articles de presse spécialisée mode (Vogue, WWD, Business of
              Fashion) sur l&apos;histoire de la maison
            </li>
          </ul>
          <p className="sources-note">
            Vérifie les chiffres et dates précis auprès de ces sources avant
            ta présentation — ce site est une vitrine de synthèse, pas une
            référence académique.
          </p>
        </Reveal>
      </section>

      <style jsx>{`
        .prada-root {
          --ink: #12100e;
          --paper: #faf7f2;
          --line: rgba(18, 16, 14, 0.12);
          background: var(--paper);
          color: var(--ink);
          font-family: "Times New Roman", Georgia, "Playfair Display", serif;
          overflow-x: hidden;
        }

        .progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          height: 3px;
          background: var(--ink);
          z-index: 100;
          transition: width 80ms linear;
        }

        .side-nav {
          position: fixed;
          right: clamp(10px, 3vw, 28px);
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 14px;
          z-index: 90;
        }

        .side-nav-dot {
          position: relative;
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: rgba(18, 16, 14, 0.25);
          transition:
            background 0.3s,
            transform 0.3s;
        }

        .side-nav-dot.active {
          background: var(--ink);
          transform: scale(1.5);
        }

        .side-nav-tooltip {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          white-space: nowrap;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: var(--ink);
          color: var(--paper);
          padding: 4px 8px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }

        .side-nav-dot:hover .side-nav-tooltip {
          opacity: 1;
        }

        .section {
          min-height: 100svh;
          padding: clamp(24px, 6vw, 80px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }

        .eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.22em;
          font-size: 12px;
          font-family: system-ui, sans-serif;
          font-weight: 600;
          opacity: 0.65;
          margin-bottom: 14px;
        }

        .eyebrow.center {
          text-align: center;
        }

        h2 {
          font-size: clamp(28px, 4.5vw, 52px);
          font-weight: 400;
          line-height: 1.1;
          margin: 0 0 20px;
        }

        h2.center {
          text-align: center;
        }

        .section p {
          font-size: clamp(15px, 1.5vw, 19px);
          line-height: 1.7;
          max-width: 56ch;
        }

        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition:
            opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero {
          align-items: center;
          text-align: center;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              circle at 30% 20%,
              rgba(18, 16, 14, 0.08),
              transparent 55%
            ),
            radial-gradient(
              circle at 75% 75%,
              rgba(18, 16, 14, 0.06),
              transparent 50%
            );
          pointer-events: none;
        }

        .hero-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-title {
          font-size: clamp(64px, 16vw, 200px);
          letter-spacing: 0.06em;
          font-weight: 400;
          margin: 0;
          line-height: 0.95;
        }

        .hero-subtitle {
          max-width: 46ch;
          margin: 18px auto 40px;
          font-size: clamp(15px, 1.8vw, 20px);
          opacity: 0.8;
        }

        .scroll-cue {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          font-family: system-ui, sans-serif;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink);
          text-decoration: none;
          opacity: 0.7;
        }

        .scroll-cue-arrow {
          width: 1px;
          height: 40px;
          background: var(--ink);
          position: relative;
          overflow: hidden;
        }

        .scroll-cue-arrow::after {
          content: "";
          position: absolute;
          top: -100%;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--ink);
          animation: cue-drip 1.8s ease-in-out infinite;
        }

        @keyframes cue-drip {
          0% {
            top: -100%;
          }
          60% {
            top: 100%;
          }
          100% {
            top: 100%;
          }
        }

        .split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(24px, 6vw, 80px);
          align-items: center;
        }

        .split.reverse .split-media {
          order: 2;
        }

        .split-media {
          aspect-ratio: 4 / 5;
          width: 100%;
          border: 1px solid var(--line);
        }

        @media (max-width: 780px) {
          .split {
            grid-template-columns: 1fr;
          }
          .split.reverse .split-media {
            order: 0;
          }
          .split-media {
            aspect-ratio: 16 / 10;
          }
        }

        .pattern-diag {
          background: repeating-linear-gradient(
            135deg,
            #12100e 0px,
            #12100e 1px,
            transparent 1px,
            transparent 14px
          );
        }
        .pattern-dots {
          background:
            radial-gradient(#12100e 1.5px, transparent 1.5px) 0 0 / 16px 16px;
        }
        .pattern-cross {
          background:
            repeating-linear-gradient(
              0deg,
              #12100e 0px,
              #12100e 1px,
              transparent 1px,
              transparent 18px
            ),
            repeating-linear-gradient(
              90deg,
              #12100e 0px,
              #12100e 1px,
              transparent 1px,
              transparent 18px
            );
          opacity: 0.9;
        }
        .pattern-stripe {
          background: repeating-linear-gradient(
            90deg,
            #12100e 0px,
            #12100e 10px,
            transparent 10px,
            transparent 26px
          );
        }
        .pattern-wave {
          background:
            radial-gradient(
              circle at 20% 30%,
              rgba(18, 16, 14, 0.9) 0,
              rgba(18, 16, 14, 0.9) 2px,
              transparent 2px
            ),
            radial-gradient(
              circle at 60% 70%,
              rgba(18, 16, 14, 0.5) 0,
              rgba(18, 16, 14, 0.5) 40px,
              transparent 41px
            );
          background-size:
            22px 22px,
            140px 140px;
        }

        .gallery-section {
          padding-left: 0;
          padding-right: 0;
        }

        .gallery-section > .reveal {
          padding: 0 clamp(24px, 6vw, 80px);
        }

        .gallery-scroll {
          display: flex;
          gap: 24px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding: 40px clamp(24px, 6vw, 80px);
          -webkit-overflow-scrolling: touch;
        }

        .gallery-card {
          flex: 0 0 min(320px, 78vw);
          scroll-snap-align: start;
          border: 1px solid var(--line);
          background: #fff;
        }

        .gallery-card-visual {
          aspect-ratio: 4 / 3;
        }

        .gallery-card-body {
          padding: 22px;
        }

        .gallery-year {
          font-family: system-ui, sans-serif;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          opacity: 0.6;
        }

        .gallery-card-body h3 {
          font-size: 20px;
          font-weight: 400;
          margin: 8px 0 10px;
        }

        .gallery-card-body p {
          font-size: 14px;
          line-height: 1.6;
          opacity: 0.85;
        }

        .gallery-hint {
          text-align: center;
          font-family: system-ui, sans-serif;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.5;
        }

        .stats-section {
          align-items: center;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 28px;
          max-width: 1000px;
          margin: 40px auto 0;
          width: 100%;
        }

        .stat-card {
          text-align: center;
          border: 1px solid var(--line);
          padding: 32px 16px;
        }

        .stat-value {
          display: block;
          font-size: clamp(32px, 5vw, 48px);
          margin-bottom: 10px;
        }

        .stat-card p {
          font-size: 13px;
          font-family: system-ui, sans-serif;
          opacity: 0.75;
          margin: 0 auto;
          max-width: 24ch;
        }

        .sources-section {
          align-items: center;
          text-align: center;
        }

        .sources-list {
          list-style: none;
          padding: 0;
          margin: 24px 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-size: 15px;
        }

        .sources-note {
          font-family: system-ui, sans-serif;
          font-size: 12px;
          opacity: 0.6;
          max-width: 50ch;
          margin: 0 auto;
        }
      `}</style>
    </main>
  )
}
