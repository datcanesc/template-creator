package com.backend.backend.controller;

import com.backend.backend.model.TemplateFields;
import com.backend.backend.service.TemplateFieldsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/template-fields")
public class TemplateFieldsController {
    @Autowired
    private TemplateFieldsService templateFieldsService;

    // Tüm TemplateFields kayıtlarını listeleme
    @GetMapping
    public ResponseEntity<List<TemplateFields>> getAllTemplateFieldsByOrderByIdAsc() {
        List<TemplateFields> templateFields = templateFieldsService.getAllTemplateFieldsByOrderByIdAsc();
        return ResponseEntity.ok(templateFields);
    }

    // ID ile belirli bir TemplateField kaydını getirme
    @GetMapping("/{id}")
    public ResponseEntity<TemplateFields> getTemplateFieldById(@PathVariable Long id) {
        TemplateFields templateField = templateFieldsService.getTemplateFieldById(id);
        if (templateField == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(templateField);

    }

    @GetMapping("/template/{templateId}")
    public ResponseEntity<List<TemplateFields>> getTemplateFieldsByTemplateId(@PathVariable Long templateId) {
        List<TemplateFields> templateFields = templateFieldsService.getTemplateFieldsByTemplateId(templateId);
        return ResponseEntity.ok(templateFields);
    }

    // Batch update TemplateFields by templateId
    @PutMapping("/template/{templateId}")
    public ResponseEntity<List<TemplateFields>> updateTemplateFieldsByTemplateId(
            @PathVariable Long templateId,
            @RequestBody List<TemplateFields> updatedFields) {
        List<TemplateFields> updatedTemplateFields = templateFieldsService.updateTemplateFieldsByTemplateId(templateId,updatedFields);
        return ResponseEntity.ok(updatedTemplateFields);
    }

    // Yeni bir TemplateField oluşturma
    @PostMapping
    public ResponseEntity<TemplateFields> createTemplateField(@RequestBody TemplateFields templateField) {
        TemplateFields createdTemplateField = templateFieldsService.saveTemplateField(templateField);
        return ResponseEntity.ok(createdTemplateField);
    }

    // ID ile belirli bir TemplateField kaydını güncelleme
    @PutMapping("/{id}")
    public ResponseEntity<TemplateFields> updateTemplateField(
            @PathVariable Long id,
            @RequestBody TemplateFields updatedTemplateField) {
        TemplateFields updatedField = templateFieldsService.updateTemplateField(id, updatedTemplateField);
        return ResponseEntity.ok(updatedField);
    }

    // ID ile belirli bir TemplateField kaydını silme
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplateField(@PathVariable Long id) {
        templateFieldsService.deleteTemplateField(id);
        return ResponseEntity.noContent().build();
    }
}
