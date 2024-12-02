package com.backend.backend.repository;


import com.backend.backend.model.TemplateFields;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TemplateFieldsRepository extends JpaRepository<TemplateFields,Long> {

    List <TemplateFields> getAllTemplateFieldsByOrderByIdAsc();

    List<TemplateFields> findByTemplateId(Long templateId);

    List<TemplateFields> findByTemplateIdOrderByIdAsc(Long templateId);

}