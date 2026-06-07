export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}时${minutes.toString().padStart(2, "0")}分${secs.toString().padStart(2, "0")}秒`;
  } else if (minutes > 0) {
    return `${minutes}分${secs.toString().padStart(2, "0")}秒`;
  }
  return `${secs}秒`;
};

export const formatDifficulty = (level: number): string => {
  const stars = "★".repeat(level) + "☆".repeat(5 - level);
  return stars;
};

export const getRankBadgeColor = (rank: number): string => {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "default";
};

export const getRankText = (rank: number): string => {
  if (rank === 1) return "🏆 冠军";
  if (rank === 2) return "🥈 亚军";
  if (rank === 3) return "🥉 季军";
  return `第 ${rank} 名`;
};
