package tn.esprit.internship.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParsedResumeDTO {
    private String name;
    private String email;
    private List<String> skills;
    private String education;
}
