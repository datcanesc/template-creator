package com.backend.backend.controller;

import com.backend.backend.model.TemplateRecords;
import com.backend.backend.service.TemplateRecordsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/template-records")
public class TemplateRecordsController {

    @Autowired
    private TemplateRecordsService templateRecordsService;

    @GetMapping
    public ResponseEntity<List<TemplateRecords>> getAllTemplateRecords() {
        return ResponseEntity.ok(templateRecordsService.getAllTemplateRecords());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TemplateRecords> getTemplateRecordsById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(templateRecordsService.getTemplateRecordsById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/template/{templateId}")
    public ResponseEntity<List<TemplateRecords>> getRecordsByTemplateId(@PathVariable Long templateId) {
        List<TemplateRecords> templateRecords = templateRecordsService.getRecordsByTemplateId(templateId);
        return ResponseEntity.ok(templateRecords);
    }

    @PostMapping
    public ResponseEntity<TemplateRecords> createTemplateRecord(@RequestBody TemplateRecords templateRecord) {
        TemplateRecords createdTemplateRecord = templateRecordsService.saveTemplateRecords(templateRecord);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTemplateRecord);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplateRecord(@PathVariable Long id) {
        try {
            templateRecordsService.deleteTemplateRecord(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // Eğer bulamazsa 404 döner.
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TemplateRecords> updateTemplateRecord(
            @PathVariable Long id,
            @RequestBody TemplateRecords updatedTemplateRecord) {
        if (updatedTemplateRecord == null || updatedTemplateRecord.getRecordData() == null) {
            return ResponseEntity.badRequest().build(); // 400 Hatalı İstek
        }
        try {
            TemplateRecords existingRecord = templateRecordsService.getTemplateRecordsById(id);
            existingRecord.setTemplateId(updatedTemplateRecord.getTemplateId());
            existingRecord.setRecordData(updatedTemplateRecord.getRecordData());
    
            TemplateRecords savedRecord = templateRecordsService.saveTemplateRecords(existingRecord);
            return ResponseEntity.ok(savedRecord);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // 404 Kayıt bulunamadı
        }
    }

}
