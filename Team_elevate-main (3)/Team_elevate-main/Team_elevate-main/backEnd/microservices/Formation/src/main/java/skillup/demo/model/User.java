package skillup.demo.model;

import lombok.Data;

@Data
public class User {
    private Long id;
    private String email;
    private String nom;
    private String prenom;
    private String telephone;
}