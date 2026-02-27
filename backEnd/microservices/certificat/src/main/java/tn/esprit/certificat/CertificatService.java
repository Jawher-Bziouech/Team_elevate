package tn.esprit.certificat;

<<<<<<< HEAD
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CertificatService {

    private final CertificatRepository repository;

    // Use constructor injection
    public CertificatService(CertificatRepository repository) {
        this.repository = repository;
    }

    public List<Certificat> getAllCertificats() {
        return repository.findAll();
    }

    public Optional<Certificat> getCertificatById(Long id) {
        return repository.findById(id);
    }

    public List<Certificat> getCertificatsByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    public Certificat saveCertificat(Certificat certificat) {
        return repository.save(certificat);
    }

    public void deleteCertificat(Long id) {
        repository.deleteById(id);
    }
}
=======
public class CertificatService {
}
>>>>>>> cb93fa2fdf96a55ba80d2c859ecd05d11de45e53
