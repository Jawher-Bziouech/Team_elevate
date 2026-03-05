package tn.esprit.joboffer.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import tn.esprit.joboffer.entity.Firm;
import tn.esprit.joboffer.repository.FirmRepository;

import java.util.List;

@RestController
@RequestMapping("/api/firms")
public class FirmController {

    private final FirmRepository firmRepository;

    public FirmController(FirmRepository firmRepository) {
        this.firmRepository = firmRepository;
    }

    @GetMapping
    public List<Firm> getAllFirms() {
        return firmRepository.findAll();
    }

    @PostMapping
    public Firm createFirm(@Valid @RequestBody Firm firm) {
        return firmRepository.save(firm);
    }

    @GetMapping("/{id}")
    public Firm getFirmById(@PathVariable Long id) {
        return firmRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Firm not found"));
    }
}