package com.backend.backend.repository;

import com.backend.backend.model.TemplateRecords;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TemplateRecordsRepository extends JpaRepository<TemplateRecords, Long> {
    List<TemplateRecords> findByTemplateId(Long templateId);

}