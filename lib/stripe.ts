import Stripe from "stripe"

/**
 * Client Stripe serveur. Ne jamais importer côté client.
 * Le placeholder évite que le constructeur lève à l'import quand la clé n'est pas
 * définie (build). La vraie clé est lue à l'exécution (variable d'env serveur).
 */
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_placeholder_build_only",
  { typescript: true }
)
