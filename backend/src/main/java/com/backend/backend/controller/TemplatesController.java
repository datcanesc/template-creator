package com.backend.backend.controller;

import com.backend.backend.model.Templates;
import com.backend.backend.service.TemplatesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")

public class TemplatesController {
    @Autowired
    private TemplatesService templatesService;

    @GetMapping
    public ResponseEntity<List<Templates>> getAllTemplatesByOrderByIdDesc() {
        return ResponseEntity.ok(templatesService.getAllTemplatesByOrderByIdDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Templates> getTemplateById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(templatesService.getTemplateById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Templates>> searchTemplatesByKeyword(@RequestParam String keyword) {
        List<Templates> templates = templatesService.searchTemplatesByKeyword(keyword);
        return ResponseEntity.ok(templates);
    }

    @PostMapping
    public ResponseEntity<Templates> createTemplates(@RequestBody Templates template) {
        return ResponseEntity.status(HttpStatus.CREATED).body(templatesService.saveTemplate(template));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        try {
            templatesService.deleteTemplate(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Templates> updateTemplate(@PathVariable Long id, @RequestBody Templates templateDetails) {
        try {
            Templates updatedTemplate = templatesService.updateTemplate(id, templateDetails);
            return ResponseEntity.ok(updatedTemplate);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
