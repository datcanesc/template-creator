package com.backend.backend.service;

import com.backend.backend.model.Templates;
import com.backend.backend.repository.TemplatesRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TemplatesService {

    @Autowired
    private TemplatesRepository TemplatesRepository;

    public Templates getTemplateById(Long id) {
        return TemplatesRepository.findById(id).orElseThrow(() -> new RuntimeException("Şablon bulunamadı!"));
    }

    // public List<Templates> getAllTemplates() {
    //     return TemplatesRepository.findAll();
    // }

    public List<Templates> getAllTemplatesByOrderByIdDesc() {
        return TemplatesRepository.getAllTemplatesByOrderByIdDesc();
    }

    public List<Templates> findAllByOrderByTemplateNameAsc() {
        return TemplatesRepository.findAllByOrderByTemplateNameAsc();
    }

    public Templates saveTemplate(Templates template) {
        return TemplatesRepository.save(template);
    }

    public void deleteTemplate(Long id) {
        TemplatesRepository.deleteById(id);
    }

    public List<Templates> searchTemplatesByKeyword(String keyword) {
        return TemplatesRepository.searchTemplatesByKeyword(keyword);
    }

    public Templates updateTemplate(Long id, Templates updatedTemplate) {
        // Retrieve the existing template from the repository
        Templates existingTemplate = TemplatesRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found"));

        // Only update fields if they are not null
        if (updatedTemplate.getTemplateName() != null) {
            existingTemplate.setTemplateName(updatedTemplate.getTemplateName());
        }
        if (updatedTemplate.getDescription() != null) {
            existingTemplate.setDescription(updatedTemplate.getDescription());
        }

        // Save the updated template
        return TemplatesRepository.save(existingTemplate);
    }
}