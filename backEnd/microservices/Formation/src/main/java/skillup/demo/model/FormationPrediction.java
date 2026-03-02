package skillup.demo.model;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "formations_predictions")
public class FormationPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "formation_id")
    private Formation formation;

    private LocalDate datePrediction;

    private int inscriptionsPrevues;

    private double croissanceEstimee; // en pourcentage (ex: 0.3 = +30%)

    private double niveauConfiance; // entre 0 et 1

    private LocalDate dateDebutAnalyse;

    private LocalDate dateFinAnalyse;

    private String tendance; // "HAUSSE", "BAISSE", "STABLE"

    // Constructeurs
    public FormationPrediction() {}

    public FormationPrediction(Formation formation, LocalDate datePrediction,
                               int inscriptionsPrevues, double croissanceEstimee,
                               double niveauConfiance, String tendance) {
        this.formation = formation;
        this.datePrediction = datePrediction;
        this.inscriptionsPrevues = inscriptionsPrevues;
        this.croissanceEstimee = croissanceEstimee;
        this.niveauConfiance = niveauConfiance;
        this.tendance = tendance;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Formation getFormation() { return formation; }
    public void setFormation(Formation formation) { this.formation = formation; }

    public LocalDate getDatePrediction() { return datePrediction; }
    public void setDatePrediction(LocalDate datePrediction) { this.datePrediction = datePrediction; }

    public int getInscriptionsPrevues() { return inscriptionsPrevues; }
    public void setInscriptionsPrevues(int inscriptionsPrevues) { this.inscriptionsPrevues = inscriptionsPrevues; }

    public double getCroissanceEstimee() { return croissanceEstimee; }
    public void setCroissanceEstimee(double croissanceEstimee) { this.croissanceEstimee = croissanceEstimee; }

    public double getNiveauConfiance() { return niveauConfiance; }
    public void setNiveauConfiance(double niveauConfiance) { this.niveauConfiance = niveauConfiance; }

    public LocalDate getDateDebutAnalyse() { return dateDebutAnalyse; }
    public void setDateDebutAnalyse(LocalDate dateDebutAnalyse) { this.dateDebutAnalyse = dateDebutAnalyse; }

    public LocalDate getDateFinAnalyse() { return dateFinAnalyse; }
    public void setDateFinAnalyse(LocalDate dateFinAnalyse) { this.dateFinAnalyse = dateFinAnalyse; }

    public String getTendance() { return tendance; }
    public void setTendance(String tendance) { this.tendance = tendance; }
}