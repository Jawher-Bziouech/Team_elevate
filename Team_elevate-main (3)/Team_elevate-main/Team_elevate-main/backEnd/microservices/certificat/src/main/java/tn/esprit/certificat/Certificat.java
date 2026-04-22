package tn.esprit.certificat;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Certificat implements Serializable {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String issuer;
    private String date; // You could also use LocalDate here
    private String description;
    private String certificateUrl;
    @Column(unique = true)
    private String credentialId;
    @PrePersist
    protected void onCreate() {
        if (this.credentialId == null) {
            // Generates a unique string like: "550e8400-e29b-41d4-a716-446655440000"
            this.credentialId = UUID.randomUUID().toString();
        }
    }

    // Link to the user who owns this certificate
    private Long userId;
    private String status;


}