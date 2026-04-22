package tn.esprit.internship.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "internship_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InternshipApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long internshipOfferId;
    private Long studentUserId;

    @Column(columnDefinition = "LONGTEXT")
    private String cvData;

    private String cvFileName;
    private String motivationLetter;
    private LocalDateTime applicationDate;

    @Column(length = 100)
    @Builder.Default
    private String status = "PENDING";

    // Transient fields: populated at query time, NOT stored in DB
    @Transient
    private String offerTitle;

    @Transient
    private String companyName;
}
