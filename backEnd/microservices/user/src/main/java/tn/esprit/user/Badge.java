package tn.esprit.user;

public enum Badge {
    NEWBIE("Nouveau membre", "🌟"),
    ACTIVE("Membre actif", "⚡"),
    EXPERT("Expert", "🏆"),
    HELPER("Aide les autres", "🤝"),
    VETERAN("Ancien membre", "🎖️"),
    POPULAR("Membre populaire", "⭐");

    private final String description;
    private final String icon;

    Badge(String description, String icon) {
        this.description = description;
        this.icon = icon;
    }

    public String getDescription() {
        return description;
    }

    public String getIcon() {
        return icon;
    }
}