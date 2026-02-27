/*package esprit.tn.course;



import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;



import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
@FeignClient(name = "formation", url = "http://localhost:9090")
public interface FormationClient {

    @GetMapping("/api/formations/{id}")
    Object getFormationById(@PathVariable("id") Long id);
}*/
// esprit.tn.course.client.FormationClient.java
package esprit.tn.course;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "formation", url = "http://localhost:8083") // Port du microservice formation
public interface FormationClient {

    @GetMapping("/api/formations/{id}")
    FormationDto getFormationById(@PathVariable("id") Long id);

    @GetMapping("/api/formations/{id}/exists")
    Boolean formationExists(@PathVariable("id") Long id);
}