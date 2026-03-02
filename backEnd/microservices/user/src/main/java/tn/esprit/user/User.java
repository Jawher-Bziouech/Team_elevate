package tn.esprit.user;


import jakarta.persistence.*; // Change this to * to include Table
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name="app_user")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private String password;
    private String email;
    @Enumerated(EnumType.STRING)
    private Role role;

    private String badges;

}
