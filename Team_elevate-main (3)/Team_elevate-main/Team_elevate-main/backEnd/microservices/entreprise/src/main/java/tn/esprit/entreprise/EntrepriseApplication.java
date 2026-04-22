package tn.esprit.entreprise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableDiscoveryClient
@EnableScheduling
public class EntrepriseApplication {
    public static void main(String[] args) {
        SpringApplication.run(EntrepriseApplication.class, args);
    }
}
