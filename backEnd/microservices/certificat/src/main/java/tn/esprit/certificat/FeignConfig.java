package tn.esprit.certificat;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.Response;
import feign.codec.Decoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.lang.reflect.Type;

@Configuration
public class FeignConfig {

    @Bean
    public Decoder feignDecoder() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return (Response response, Type type) ->
                mapper.readValue(response.body().asInputStream(),
                        mapper.constructType(type));
    }
}