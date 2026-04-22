package tn.esprit.internship.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tn.esprit.internship.dto.ParsedResumeDTO;

import java.io.InputStream;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ResumeParserService {

    private static final List<String> SKILL_KEYWORDS = Arrays.asList(
            "Java", "Spring", "Angular", "Python", "SQL", "JavaScript", "React", "Node", "Docker", "Kubernetes", "AWS", "Git", "C++", "C#"
    );

    private static final List<String> EDUCATION_KEYWORDS = Arrays.asList(
            "Bachelor", "Master", "Degree", "University", "License", "Ingénieur", "Engineering", "PhD", "Institute", "College"
    );

    public ParsedResumeDTO parseResume(MultipartFile file) throws Exception {
        String text = extractText(file);
        
        String email = extractEmail(text);
        String name = extractName(text);
        List<String> skills = extractSkills(text);
        String education = extractEducation(text);

        return new ParsedResumeDTO(name, email, skills, education);
    }

    private String extractText(MultipartFile file) throws Exception {
        String filename = file.getOriginalFilename();
        if (filename == null) return "";
        
        try (InputStream is = file.getInputStream()) {
            if (filename.toLowerCase().endsWith(".pdf")) {
                try (PDDocument document = PDDocument.load(is)) {
                    PDFTextStripper textStripper = new PDFTextStripper();
                    return textStripper.getText(document);
                }
            } else if (filename.toLowerCase().endsWith(".docx")) {
                try (XWPFDocument document = new XWPFDocument(is);
                     XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
                    return extractor.getText();
                }
            } else {
                throw new IllegalArgumentException("Unsupported file type: " + filename + ". Only PDF and DOCX are supported.");
            }
        }
    }

    private String extractEmail(String text) {
        String emailRegex = "[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}";
        Pattern pattern = Pattern.compile(emailRegex);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }

    private String extractName(String text) {
        // Simple heuristic: Take the first 2-3 content-bearing words.
        // Look for the first non-empty line that isn't just numbers/symbols
        String[] lines = text.split("\\r?\\n");
        for (String line : lines) {
            String trimmed = line.trim();
            // Basic check to see if looks like a name (no numbers, length > 3)
            if (!trimmed.isEmpty() && !trimmed.matches(".*\\d.*") && trimmed.length() > 3) {
                String[] words = trimmed.split("\\s+");
                if (words.length >= 2 && words.length <= 4) {
                    return trimmed;
                }
            }
        }
        return "Unknown Name";
    }

    private List<String> extractSkills(String text) {
        String textLower = text.toLowerCase();
        return SKILL_KEYWORDS.stream()
                .filter(skill -> textLower.contains(skill.toLowerCase()))
                .collect(Collectors.toList());
    }

    private String extractEducation(String text) {
        String[] lines = text.split("\\r?\\n");
        for (String line : lines) {
            String tempLower = line.toLowerCase();
            for (String keyword : EDUCATION_KEYWORDS) {
                if (tempLower.contains(keyword.toLowerCase())) {
                    return line.trim();
                }
            }
        }
        return null; // Return null if nothing is found
    }
}
