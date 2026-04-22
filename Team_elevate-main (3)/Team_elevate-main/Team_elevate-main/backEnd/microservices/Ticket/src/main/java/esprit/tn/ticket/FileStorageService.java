/*package esprit.tn.ticket;



import esprit.tn.ticket.FileInfo;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.Arrays;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.max-size}")
    private long maxSize;

    @Value("${file.allowed-types}")
    private String[] allowedTypes;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
            log.info("Répertoire d'upload créé: {}", uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le répertoire d'upload", e);
        }
    }

    public FileInfo storeFile(MultipartFile file, Long uploadedBy) {
        // Validation
        validateFile(file);

        // Générer nom unique
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String fileName = UUID.randomUUID().toString() + fileExtension;
        String fileType = file.getContentType();
        long fileSize = file.getSize();

        try {
            Path targetLocation = Paths.get(uploadDir).resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            FileInfo fileInfo = new FileInfo();
            fileInfo.setFileName(fileName);
            fileInfo.setOriginalFileName(originalFileName);
            fileInfo.setFileType(fileType);
            fileInfo.setFileSize(fileSize);
            fileInfo.setFileUrl("/files/" + fileName);
            fileInfo.setUploadedBy(uploadedBy);

            log.info("Fichier sauvegardé: {} ({})", fileName, fileSize);

            return fileInfo;

        } catch (IOException e) {
            log.error("Erreur lors de la sauvegarde du fichier: {}", fileName, e);
            throw new RuntimeException("Impossible de sauvegarder le fichier: " + fileName, e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("Le fichier est vide");
        }

        if (file.getSize() > maxSize) {
            throw new RuntimeException("Fichier trop volumineux. Taille maximum: " +
                    (maxSize / (1024 * 1024)) + "MB");
        }

        String contentType = file.getContentType();
        boolean allowed = Arrays.stream(allowedTypes)
                .anyMatch(type -> type.equals(contentType));

        if (!allowed) {
            throw new RuntimeException("Type de fichier non autorisé: " + contentType +
                    ". Types acceptés: " + String.join(", ", allowedTypes));
        }
    }

    public Resource loadFile(String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return resource;
            } else {
                throw new RuntimeException("Fichier non trouvé: " + fileName);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Erreur lors du chargement du fichier: " + fileName, e);
        }
    }

    public boolean deleteFile(String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            return Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.error("Erreur lors de la suppression du fichier: {}", fileName, e);
            return false;
        }
    }
}*/