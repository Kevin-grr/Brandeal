-- =============================================================================
-- ContratCréateur — Seed du template légal v1-2026
-- ⚠️ Contenu légal repris VERBATIM du brief (sections 3.A / 3.B / 3.C).
-- Stocké comme donnée (jsonb), jamais codé en dur dans la logique applicative.
-- Source : Loi n°2023-451 du 9 juin 2023, art. 8 — Décret n°2025-1137 du 28/11/2025.
-- =============================================================================

insert into public.legal_template_versions
  (version_label, law_reference, threshold_eur, mandatory_clauses, effective_date, is_active)
select
  'v1-2026',
  'Loi n°2023-451 du 9 juin 2023, art. 8 — Décret n°2025-1137 du 28 novembre 2025',
  1000,
  $json$
  {
    "threshold_eur": 1000,
    "threshold_basis": "HT",
    "threshold_period": "par annonceur et par an",
    "threshold_rule": "Un contrat écrit est obligatoire, sous peine de nullité, quand la somme des rémunérations + avantages en nature versés par un même annonceur sur une même année, pour des prestations poursuivant un même objectif promotionnel, atteint ou dépasse 1 000€ HT.",
    "contract": {
      "title": "Contrat de partenariat commercial",
      "mandatory_clauses": [
        { "key": "parties", "label": "Identité des parties", "requirement": "Identité des parties : nom/raison sociale, coordonnées postales et électroniques, pays de résidence fiscale de chaque partie." },
        { "key": "missions", "label": "Nature précise des missions confiées", "requirement": "Nature précise des missions confiées (type de contenu, plateformes, nombre de publications, calendrier)." },
        { "key": "remuneration", "label": "Rémunération", "requirement": "Rémunération en numéraire (montant exact en euros) et/ou valeur de l'avantage en nature, avec les conditions et modalités d'attribution de cet avantage." },
        { "key": "droits", "label": "Droits et obligations des parties", "requirement": "Droits et obligations des parties, notamment en matière de propriété intellectuelle (durée d'exploitation des contenus, droit à l'image, exclusivité éventuelle)." },
        { "key": "droit_applicable", "label": "Droit applicable", "requirement": "Clause d'application du droit français lorsque le public visé inclut un public établi en France." },
        { "key": "transparence", "label": "Transparence publicitaire", "requirement": "Mention claire et visible du caractère commercial de la collaboration (obligation de transparence publicitaire — ex : #partenariat, #sponsorisé)." }
      ],
      "article_titles": {
        "objet": "Article 1 — Objet et nature des missions",
        "remuneration": "Article 2 — Rémunération",
        "propriete_intellectuelle": "Article 3 — Propriété intellectuelle et droits",
        "droit_applicable": "Article 4 — Droit applicable",
        "transparence": "Article 5 — Transparence publicitaire"
      },
      "signature_labels": { "creator": "Le créateur", "advertiser": "L'annonceur" }
    },
    "invoice": {
      "mandatory_mentions": [
        "Numéro de facture unique, séquentiel et continu (jamais de trou dans la séquence).",
        "Date d'émission.",
        "Identité du créateur : nom, adresse, SIRET.",
        "Identité de la marque cliente : raison sociale, adresse de facturation, numéro de TVA intracommunautaire si applicable.",
        "Nature de la prestation (type de partenariat, ex : « Publication sponsorisée Instagram »).",
        "Montant unitaire et montant total, en précisant si TVA incluse ou non.",
        "Si franchise en base de TVA : mention « TVA non applicable, article 293 B du CGI »."
      ],
      "vat_franchise_mention": "TVA non applicable, article 293 B du CGI",
      "retention_note": "Conservation de la facture pendant 10 ans (obligation légale de conservation)."
    },
    "disclaimer": "Ce document a été généré automatiquement à partir des informations fournies par l'utilisateur. Il ne constitue ni un acte authentique ni un conseil juridique personnalisé. Il est fortement recommandé de le faire relire par un avocat ou un professionnel du droit avant signature.",
    "advertising_transparency_on_screen_note": "Rappel : vous devez identifier clairement et de façon visible le caractère commercial de vos publications réalisées dans le cadre de ce partenariat (ex : #partenariat, #sponsorisé). C'est une obligation de transparence publicitaire."
  }
  $json$::jsonb,
  '2026-01-01',
  true
where not exists (
  select 1 from public.legal_template_versions where version_label = 'v1-2026'
);
