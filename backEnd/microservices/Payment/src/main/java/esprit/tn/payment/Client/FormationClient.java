package esprit.tn.payment.Client;

import esprit.tn.payment.DTO.FormationDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "FORMATION", url = "http://localhost:8084")
public interface FormationClient {
    @GetMapping("/api/formations")
    List<FormationDTO> getAllFormations();
}