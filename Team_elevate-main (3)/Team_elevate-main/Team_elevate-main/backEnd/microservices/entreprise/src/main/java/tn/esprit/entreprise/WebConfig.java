package tn.esprit.entreprise;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:4200")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
//  1. Partnership Requests (Demandes de Partenariat)                                                                                      Allow trainees to send partnership/internship
//  requests to approved companies. Add a
//  DemandePartenariat entity with fields like
//  traineeId, entrepriseId, message, status
//  (PENDING/ACCEPTED/REFUSED), dateEnvoi. The
//  admin can review and manage requests from the
//  back-office.
//
//  2. Company Ratings & Reviews (Avis et Notes)
//
//  Let trainees rate and review companies they've
//  interacted with. Add a ReviewEntreprise entity
//  with rating (1-5 stars), comment, userId,
//  entrepriseId. Display average ratings on
//  company cards and a reviews section in the
//  detail modal.
//
//  3. Company Statistics Dashboard (Tableau de
//  Bord)
//
//  Build an analytics page in the back-office with
//   charts (using Chart.js or ng2-charts):
//  companies by sector (pie chart), companies by
//  size (bar chart), approval rate over time (line
//   chart), top-rated companies. Gives admins a
//  visual overview of the entreprise data.
//
//  4. Company-Job Offer Integration (Lier
//  Entreprises aux Offres d'Emploi)
//
//  Link the entreprise module to the existing
//  job-offer microservice. Each company can have
//  associated job offers. On the company detail
//  modal, show a list of related job postings.
//  This connects two existing modules and adds
//  real business value.