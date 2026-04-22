export interface BadgeConfig {
    label: string;
    icon: string;
}

export const BADGE_CONFIG: { [key: string]: BadgeConfig } = {
    'FIRST_STEP': { label: 'First Step', icon: '🚀' },
    'QUIZ_ENTHUSIAST': { label: 'Quiz Enthusiast', icon: '📚' },
    'QUIZ_MASTER': { label: 'Quiz Master', icon: '👑' },
    'PERFECT_SCORE': { label: 'Perfect Score', icon: '💯' },
    'SHARP_MIND': { label: 'Sharp Mind', icon: '🧠' },
    'CONSISTENT': { label: 'Consistent', icon: '🔥' },
    'SPEED_DEMON': { label: 'Speed Demon', icon: '⚡' },
    'QUICK_THINKER': { label: 'Quick Thinker', icon: '💡' },
    'CREDIT_STARTER': { label: 'Credit Starter', icon: '🪙' },
    'CREDIT_COLLECTOR': { label: 'Credit Collector', icon: '💰' },
    'CREDIT_CHAMPION': { label: 'Credit Champion', icon: '🏆' },
    'THREE_DAY_STREAK': { label: '3-Day Streak', icon: '📅' },
    'SEVEN_DAY_STREAK': { label: '7-Day Streak', icon: '🗓️' },
    'DEFAULT': { label: 'Badge', icon: '🏅' }
};
