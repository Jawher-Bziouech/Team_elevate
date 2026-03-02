package skillup.demo.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "rapports_obsolescence")
public class RapportObsolescence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "formation_id")
    private Formation formation;

    private LocalDate dateRapport;

    private int scoreObsolescence; // 0-10, plus c'est élevé, plus c'est obsolète

    private String niveauRisque; // "FAIBLE", "MOYEN", "ELEVE", "CRITIQUE"

    private String recommandation; // "RETIRER", "METTRE_A_JOUR", "SURVEILLER", "RIEN"

    @ElementCollection
    private List<String> criteres; // Liste des raisons

    private double baisseInscriptions; // en pourcentage

    private boolean derniereMAJAncienne;

    private boolean technologiesDepreciees;

    private double tauxAnnulation;

    // Constructeurs
    public RapportObsolescence() {}

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Formation getFormation() { return formation; }
    public void setFormation(Formation formation) { this.formation = formation; }

    public LocalDate getDateRapport() { return dateRapport; }
    public void setDateRapport(LocalDate dateRapport) { this.dateRapport = dateRapport; }

    public int getScoreObsolescence() { return scoreObsolescence; }
    public void setScoreObsolescence(int scoreObsolescence) { this.scoreObsolescence = scoreObsolescence; }

    public String getNiveauRisque() { return niveauRisque; }
    public void setNiveauRisque(String niveauRisque) { this.niveauRisque = niveauRisque; }

    public String getRecommandation() { return recommandation; }
    public void setRecommandation(String recommandation) { this.recommandation = recommandation; }

    public List<String> getCriteres() { return criteres; }
    public void setCriteres(List<String> criteres) { this.criteres = criteres; }

    public double getBaisseInscriptions() { return baisseInscriptions; }
    public void setBaisseInscriptions(double baisseInscriptions) { this.baisseInscriptions = baisseInscriptions; }

    public boolean isDerniereMAJAncienne() { return derniereMAJAncienne; }
    public void setDerniereMAJAncienne(boolean derniereMAJAncienne) { this.derniereMAJAncienne = derniereMAJAncienne; }

    public boolean isTechnologiesDepreciees() { return technologiesDepreciees; }
    public void setTechnologiesDepreciees(boolean technologiesDepreciees) { this.technologiesDepreciees = technologiesDepreciees; }

    public double getTauxAnnulation() { return tauxAnnulation; }
    public void setTauxAnnulation(double tauxAnnulation) { this.tauxAnnulation = tauxAnnulation; }
}