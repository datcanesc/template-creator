package com.backend.backend.repository;


import com.backend.backend.model.Templates;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface TemplatesRepository extends JpaRepository<Templates, Long> {

    @Query("SELECT t FROM Templates t WHERE LOWER(t.templateName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Templates> searchTemplatesByKeyword(String keyword);
    
    List<Templates> getAllTemplatesByOrderByIdDesc();

    List<Templates> findAllByOrderByTemplateNameAsc();

}
