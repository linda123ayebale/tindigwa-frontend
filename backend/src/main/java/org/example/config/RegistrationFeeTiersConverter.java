package org.example.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * JPA Converter for Registration Fee Tiers stored as JSON
 * Converts between JSON string in database and List<Map<String, Object>> in Java
 * 
 * Example JSON structure:
 * [
 *   {"minAmount": 100000, "maxAmount": 250000, "fee": 5000},
 *   {"minAmount": 260000, "maxAmount": 500000, "fee": 10000},
 *   {"minAmount": 510000, "maxAmount": 1000000, "fee": 15000}
 * ]
 */
@Converter
@Slf4j
public class RegistrationFeeTiersConverter implements AttributeConverter<List<Map<String, Object>>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<Map<String, Object>> tiers) {
        if (tiers == null || tiers.isEmpty()) {
            return null;
        }
        
        try {
            return objectMapper.writeValueAsString(tiers);
        } catch (JsonProcessingException e) {
            log.error("Error converting registration fee tiers to JSON string", e);
            return null;
        }
    }

    @Override
    public List<Map<String, Object>> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        try {
            return objectMapper.readValue(dbData, new TypeReference<List<Map<String, Object>>>() {});
        } catch (JsonProcessingException e) {
            log.error("Error converting JSON string to registration fee tiers", e);
            return new ArrayList<>();
        }
    }
}
