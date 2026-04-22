package tn.esprit.certificat;

public class PostDTO {
    private String title;
    private String content;
    private Long authorId;
    private String topic;

    // Empty Constructor
    public PostDTO() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Long getAuthorId() { return authorId; }
    public void setAuthorId(Long authorId) { this.authorId = authorId; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
}
