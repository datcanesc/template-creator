package com.backend.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Entity
@Table(name = "templaterecords")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true) // Ekstra JSON alanlarını görmezden gelir
public class TemplateRecords {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    private Long id;

    @Column(name = "template_id", nullable = false)
    private Long templateId;

    @Column(name = "record_data", nullable = false)
    @Convert(converter = JsonbConverter.class)
    private Map<String, Object> recordData;

    @Converter
    public static class JsonbConverter implements AttributeConverter<Map<String, Object>, String> {
        private static final ObjectMapper objectMapper = new ObjectMapper();
    
        @Override
        public String convertToDatabaseColumn(Map<String, Object> attribute) {
            try {
                return objectMapper.writeValueAsString(attribute);
            } catch (Exception e) {
                throw new IllegalArgumentException("Error converting Map to JSON String", e);
            }
        }
    
        @Override
        public Map<String, Object> convertToEntityAttribute(String dbData) {
            try {
                return objectMapper.readValue(dbData, new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                throw new IllegalArgumentException("Error converting JSON String to Map", e);
            }
        }
    }
    
}
