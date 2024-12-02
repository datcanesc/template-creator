package com.backend.backend.service;

import com.backend.backend.model.TemplateFields;
import com.backend.backend.repository.TemplateFieldsRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TemplateFieldsService {

    private final TemplateFieldsRepository templateFieldsRepository;

    public TemplateFieldsService(TemplateFieldsRepository templateFieldsRepository) {
        this.templateFieldsRepository = templateFieldsRepository;
    }

    public TemplateFields getTemplateFieldById(Long id) {
        return templateFieldsRepository.findById(id)
                .orElseThrow(() ->  new ResponseStatusException(HttpStatus.NOT_FOUND, "Şablon alanı bulunamadı!"));
}

    // public List<TemplateFields> getAllTemplateFields() {
    //     return templateFieldsRepository.findAll();
    // }

    public List<TemplateFields> getAllTemplateFieldsByOrderByIdAsc(){
        return templateFieldsRepository.getAllTemplateFieldsByOrderByIdAsc();
    }

    public List<TemplateFields> getTemplateFieldsByTemplateId(Long templateId) {
        return templateFieldsRepository.findByTemplateIdOrderByIdAsc(templateId);
    }

    public TemplateFields saveTemplateField(TemplateFields templateField) {
        return templateFieldsRepository.save(templateField);
    }

    public void deleteTemplateField(Long id) {
        templateFieldsRepository.deleteById(id);
    }

    public TemplateFields updateTemplateField(Long id, TemplateFields updatedTemplateField) {
        TemplateFields existingTemplateField = getTemplateFieldById(id);

        if (updatedTemplateField.getFieldName() != null) {
            existingTemplateField.setFieldName(updatedTemplateField.getFieldName());
        }
        if (updatedTemplateField.getFieldType() != null) {
            existingTemplateField.setFieldType(updatedTemplateField.getFieldType());
        }
        existingTemplateField.setIsRequired(updatedTemplateField.getIsRequired());

        return templateFieldsRepository.save(existingTemplateField);
    }

    public List<TemplateFields> updateTemplateFieldsByTemplateId(Long templateId, List<TemplateFields> updatedFields) {
        List<TemplateFields> existingFields = templateFieldsRepository.findByTemplateId(templateId);
        
        for (TemplateFields existingField : existingFields) {
            for (TemplateFields updatedField : updatedFields) {
                if (existingField.getId().equals(updatedField.getId())) {
                    existingField.setFieldName(updatedField.getFieldName());
                    existingField.setFieldType(updatedField.getFieldType());
                    existingField.setIsRequired(updatedField.getIsRequired());
                }
            }
        }
        return templateFieldsRepository.saveAll(existingFields);
    }
    
    
}
