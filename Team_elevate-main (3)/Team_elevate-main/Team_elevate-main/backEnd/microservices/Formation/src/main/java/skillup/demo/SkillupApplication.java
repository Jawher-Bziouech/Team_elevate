package skillup.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableScheduling
@EnableFeignClients


public class SkillupApplication {

	public static void main(String[] args) {
		SpringApplication.run(SkillupApplication.class, args);
	}

}
