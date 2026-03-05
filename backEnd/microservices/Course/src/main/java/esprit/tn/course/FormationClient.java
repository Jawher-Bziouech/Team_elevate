package esprit.tn.course;

import esprit.tn.course.FormationDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "FORMATION", url = "http://localhost:8084") // Port du microservice formation
public interface FormationClient {

    @GetMapping("/api/formations/{id}")
    FormationDto getFormationById(@PathVariable("id") Long id);

    @GetMapping("/api/formations/{id}/exists")
    Boolean formationExists(@PathVariable("id") Long id);
}