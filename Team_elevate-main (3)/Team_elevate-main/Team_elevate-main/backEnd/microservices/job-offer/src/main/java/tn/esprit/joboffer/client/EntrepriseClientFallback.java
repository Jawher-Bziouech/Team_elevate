package tn.esprit.joboffer.client;

import org.springframework.stereotype.Component;
import tn.esprit.joboffer.dto.EntrepriseDto;

@Component
public class EntrepriseClientFallback implements EntrepriseClient {
    @Override
    public EntrepriseDto getById(Long id) {
        EntrepriseDto fallback = new EntrepriseDto();
        fallback.setId(id);
        fallback.setNom("Unknown Company");
        return fallback;
    }
}
