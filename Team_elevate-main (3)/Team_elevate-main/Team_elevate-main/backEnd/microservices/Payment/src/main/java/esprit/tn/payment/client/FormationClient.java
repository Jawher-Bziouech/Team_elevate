package esprit.tn.payment.client;

import esprit.tn.payment.Exception.PaymentException;
import esprit.tn.payment.Exception.ResourceNotFoundException;
import esprit.tn.payment.client.dto.FormationSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
@RequiredArgsConstructor
public class FormationClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${formation.service.base-url:http://localhost:8084/api/formations}")
    private String formationBaseUrl;

    public FormationSummaryDTO getFormationById(Long formationId) {
        return restClientBuilder.build()
                .get()
                .uri(formationBaseUrl + "/{id}", formationId)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (request, response) -> {
                    throw new ResourceNotFoundException("Formation introuvable avec l'id: " + formationId);
                })
                .onStatus(HttpStatusCode::is5xxServerError, (request, response) -> {
                    throw new PaymentException("Le service Formation est indisponible pour le moment");
                })
                .body(FormationSummaryDTO.class);
    }

    public List<FormationSummaryDTO> getAllFormations() {
        List<FormationSummaryDTO> formations = restClientBuilder.build()
                .get()
                .uri(formationBaseUrl)
                .retrieve()
                .onStatus(HttpStatusCode::is5xxServerError, (request, response) -> {
                    throw new PaymentException("Le service Formation est indisponible pour le moment");
                })
                .body(new ParameterizedTypeReference<List<FormationSummaryDTO>>() {});

        return formations == null ? List.of() : formations;
    }
}
