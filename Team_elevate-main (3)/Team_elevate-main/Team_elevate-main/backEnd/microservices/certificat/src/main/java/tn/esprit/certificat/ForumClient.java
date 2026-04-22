package tn.esprit.certificat;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "FORUM", url = "http://localhost:9090")
public interface ForumClient {

    // Expect a raw String, but tell the Forum server it's application/json!
    @PostMapping(value = "/forum/posts", consumes = "application/json")
    void createForumPost(@RequestBody String postPayloadJson);

}
