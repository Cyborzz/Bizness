// Calcul pur du crédit fidélité (tampons ou points), partagé pour rester
// cohérent avec addStampAction / validatePassageAction : on ajoute `amount`,
// on débloque autant de récompenses que le seuil est franchi, et on reporte le
// reste (gère le multi-récompense en une fois).

export type CardCounters = {
  current_stamps: number;
  total_stamps: number;
  rewards_available: number;
};

export type CreditResult = CardCounters & {
  rewardsEarned: number;
};

export function computeCredit(
  card: CardCounters,
  threshold: number,
  amount: number,
): CreditResult {
  const safeThreshold = Math.max(1, threshold);
  const safeAmount = Math.max(0, Math.floor(amount));
  const totalNow = card.current_stamps + safeAmount;
  const rewardsEarned = Math.floor(totalNow / safeThreshold);

  return {
    current_stamps: totalNow % safeThreshold,
    total_stamps: card.total_stamps + safeAmount,
    rewards_available: card.rewards_available + rewardsEarned,
    rewardsEarned,
  };
}
