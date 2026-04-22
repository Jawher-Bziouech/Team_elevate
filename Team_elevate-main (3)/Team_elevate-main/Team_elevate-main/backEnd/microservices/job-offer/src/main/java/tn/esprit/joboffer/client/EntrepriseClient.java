package tn.esprit.joboffer.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import tn.esprit.joboffer.dto.EntrepriseDto;

@FeignClient(name = "ENTREPRISE")
public interface EntrepriseClient {
    @GetMapping("/api/entreprises/{id}")
    EntrepriseDto getById(@PathVariable Long id);
}
