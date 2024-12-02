package com.backend.backend.service;

import com.backend.backend.model.TemplateRecords;
import com.backend.backend.repository.TemplateRecordsRepository;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TemplateRecordsService {

    @Autowired
    private TemplateRecordsRepository templateRecordsRepository;

    public TemplateRecords getTemplateRecordsById(Long id) {
        return templateRecordsRepository.findById(id).orElseThrow(() -> new RuntimeException("Kayıt Bulunamadı!"));
    }
    

    public List<TemplateRecords> getAllTemplateRecords() {
        return templateRecordsRepository.findAll();
    }

    // public TemplateRecords saveTemplateRecords(TemplateRecords record) {
    //     return templateRecordsRepository.save(record);
    // }


    public void deleteTemplateRecord(Long recordId) {
        templateRecordsRepository.deleteById(recordId);
    }
    
    
    public List<TemplateRecords> getRecordsByTemplateId(Long templateId) {
        return templateRecordsRepository.findByTemplateId(templateId);
    }

    public TemplateRecords saveTemplateRecords(TemplateRecords record) {
        if (record.getRecordData() == null || record.getTemplateId() == null) {
            throw new RuntimeException("Eksik veri: RecordData veya TemplateId boş olamaz!");
        }
        return templateRecordsRepository.save(record);
    }
    

    // public TemplateRecords saveTemplateRecords(Long templateId, Map<String,
    // Object> recordData) {
    // Templates template = templateRepository.findById(templateId)
    // .orElseThrow(() -> new RuntimeException("Template not found"));

    // List<TemplateFields> fields =
    // templateFieldsRepository.findByTemplateId(templateId);

    // // Validate required fields
    // for (TemplateFields field : fields) {
    // if (field.getIsRequired() && !recordData.containsKey(field.getFieldName())) {
    // throw new RuntimeException("Required field " + field.getFieldName() + " is
    // missing");
    // }
    // }

    // TemplateRecords newRecord = new TemplateRecords();
    // newRecord.setTemplate(template);
    // newRecord.setRecordData(recordData);

    // return templateRecordsRepository.save(newRecord);
    // }

}
