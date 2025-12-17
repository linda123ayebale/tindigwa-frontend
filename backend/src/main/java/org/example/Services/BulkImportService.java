package org.example.Services;

import org.example.Entities.OperationalExpenses;
import org.example.Entities.ExpenseCategory;
import org.example.Repositories.OperationalExpensesRepository;
import org.example.Repositories.ExpenseCategoryRepository;
import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.opencsv.exceptions.CsvValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BulkImportService {

    @Autowired
    private OperationalExpensesRepository expensesRepository;

    @Autowired
    private ExpenseCategoryRepository expenseCategoryRepository;

    private static final DateTimeFormatter[] DATE_FORMATS = {
        DateTimeFormatter.ofPattern("yyyy-MM-dd"),
        DateTimeFormatter.ofPattern("MM/dd/yyyy"),
        DateTimeFormatter.ofPattern("dd/MM/yyyy"),
        DateTimeFormatter.ofPattern("yyyy/MM/dd")
    };

    public Map<String, Object> importExpensesFromCSV(MultipartFile file) throws IOException, CsvValidationException {
        Map<String, Object> result = new HashMap<>();
        List<String> errors = new ArrayList<>();
        List<OperationalExpenses> successfulImports = new ArrayList<>();
        int totalRecords = 0;

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            String[] headers = reader.readNext();
            if (headers == null) {
                throw new IllegalArgumentException("CSV file is empty or has no headers");
            }

            // Validate required headers
            Map<String, Integer> headerMap = createHeaderMap(headers);
            validateRequiredHeaders(headerMap);

            String[] line;
            int lineNumber = 2; // Start from 2 (1 for headers)

            while ((line = reader.readNext()) != null) {
                totalRecords++;
                try {
                    OperationalExpenses expense = parseExpenseFromCSVLine(line, headerMap);
                    expensesRepository.save(expense);
                    successfulImports.add(expense);
                } catch (Exception e) {
                    errors.add("Line " + lineNumber + ": " + e.getMessage());
                }
                lineNumber++;
            }
        }

        result.put("totalRecords", totalRecords);
        result.put("successfulImports", successfulImports.size());
        result.put("failedImports", errors.size());
        result.put("errors", errors);

        return result;
    }

    public byte[] exportExpensesToCSV(List<OperationalExpenses> expenses) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(outputStream))) {
            // Write headers (removed Subcategory)
            String[] headers = {
                "ID", "Description", "Amount", "Date", "Category",
                "Vendor", "Payment Method", "Reference Number", "Status",
                "Notes", "Created At", "Updated At"
            };
            writer.writeNext(headers);

            // Write data
            for (OperationalExpenses expense : expenses) {
                String categoryName = expense.getCategory() != null ? expense.getCategory().getCategoryName() : "";

                String[] record = {
                    expense.getId() != null ? expense.getId().toString() : "",
                    expense.getDescription() != null ? expense.getDescription() : "",
                    expense.getAmount() != null ? expense.getAmount().toString() : "",
                    expense.getExpenseDate() != null ? expense.getExpenseDate().toString() : "",
                    categoryName,
                    expense.getVendor() != null ? expense.getVendor() : "",
                    expense.getPaymentMethod() != null ? expense.getPaymentMethod() : "",
                    expense.getExpenseReference() != null ? expense.getExpenseReference() : "",
                    expense.getStatus() != null ? expense.getStatus() : "",
                    expense.getNotes() != null ? expense.getNotes() : "",
                    expense.getCreatedAt() != null ? expense.getCreatedAt().toString() : "",
                    expense.getUpdatedAt() != null ? expense.getUpdatedAt().toString() : ""
                };
                writer.writeNext(record);
            }
        }

        return outputStream.toByteArray();
    }

    private Map<String, Integer> createHeaderMap(String[] headers) {
        Map<String, Integer> headerMap = new HashMap<>();
        for (int i = 0; i < headers.length; i++) {
            headerMap.put(headers[i].toLowerCase().trim(), i);
        }
        return headerMap;
    }

    private void validateRequiredHeaders(Map<String, Integer> headerMap) {
        String[] requiredHeaders = {"description", "amount", "date"};
        List<String> missingHeaders = new ArrayList<>();

        for (String required : requiredHeaders) {
            if (!headerMap.containsKey(required)) {
                missingHeaders.add(required);
            }
        }

        if (!missingHeaders.isEmpty()) {
            throw new IllegalArgumentException("Missing required headers: " + String.join(", ", missingHeaders));
        }
    }

    private OperationalExpenses parseExpenseFromCSVLine(String[] line, Map<String, Integer> headerMap) {
        OperationalExpenses expense = new OperationalExpenses();

        // Required fields
        expense.setDescription(getValueFromLine(line, headerMap, "description"));
        BigDecimal amount = parseAmount(getValueFromLine(line, headerMap, "amount"));
        expense.setAmount(amount.doubleValue());
        expense.setExpenseDate(parseDate(getValueFromLine(line, headerMap, "date"))); 

        // Optional fields
        String categoryName = getValueFromLine(line, headerMap, "category");
        if (categoryName != null && !categoryName.isEmpty()) {
            ExpenseCategory category = expenseCategoryRepository.findByCategoryNameIgnoreCase(categoryName)
                    .orElseGet(() -> {
                        ExpenseCategory newCat = new ExpenseCategory();
                        newCat.setCategoryName(categoryName);
                        return expenseCategoryRepository.save(newCat);
                    });
            expense.setCategory(category);
        } else {
            expense.setCategory(null);
        }

        expense.setVendor(getValueFromLine(line, headerMap, "vendor"));
        expense.setPaymentMethod(getValueFromLine(line, headerMap, "payment method"));
        expense.setExpenseReference(getValueFromLine(line, headerMap, "reference number"));
        expense.setNotes(getValueFromLine(line, headerMap, "notes"));
        
        String status = getValueFromLine(line, headerMap, "status");
        expense.setStatus(status != null && !status.isEmpty() ? status : "PENDING");

        return expense;
    }

    private String getValueFromLine(String[] line, Map<String, Integer> headerMap, String header) {
        Integer index = headerMap.get(header);
        if (index != null && index < line.length) {
            String value = line[index].trim();
            return value.isEmpty() ? null : value;
        }
        return null;
    }

    private BigDecimal parseAmount(String amountStr) {
        if (amountStr == null || amountStr.isEmpty()) {
            throw new IllegalArgumentException("Amount is required");
        }

        // Remove currency symbols and whitespace
        String cleanAmount = amountStr.replaceAll("[^\\d.-]", "");
        
        try {
            return new BigDecimal(cleanAmount);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Invalid amount format: " + amountStr);
        }
    }

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isEmpty()) {
            throw new IllegalArgumentException("Date is required");
        }

        for (DateTimeFormatter formatter : DATE_FORMATS) {
            try {
                return LocalDate.parse(dateStr.trim(), formatter);
            } catch (DateTimeParseException e) {
                // Try next format
            }
        }

        throw new IllegalArgumentException("Invalid date format: " + dateStr + ". Expected formats: yyyy-MM-dd, MM/dd/yyyy, dd/MM/yyyy, yyyy/MM/dd");
    }

    public String generateCSVTemplate() throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(outputStream))) {
            String[] headers = {
                "description", "amount", "date", "category",
                "vendor", "payment method", "reference number", "status", "notes"
            };
            writer.writeNext(headers);

            // Add sample row
            String[] sampleRow = {
                "Sample Office Supplies", "150.00", "2024-01-15", "Office",
                "Office Depot", "Credit Card", "REF123", "APPROVED", "Monthly office supplies"
            };
            writer.writeNext(sampleRow);
        }

        return outputStream.toString();
    }
}
