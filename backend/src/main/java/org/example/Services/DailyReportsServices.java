package org.example.Services;

import org.example.Entities.DailyReports;
import org.example.Repositories.DailyReportsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DailyReportsServices {

    @Autowired
    private DailyReportsRepository repository;

    // Create
    public DailyReports createReport(DailyReports report) {
        // The save method expects a DailyReports entity, not a repository
        return repository.save(report);
    }

    // Get all
    public List<DailyReports> getAllReports() {
        // The findAll method returns a List of DailyReports entities
        return repository.findAll();
    }

    // Get by ID
    public Optional<DailyReports> getReportById(Long id) {
        // findById returns an Optional of a DailyReports entity
        return repository.findById(id);
    }

//    // Update
//    public DailyReports updateReport(Long id, DailyReports updatedReport) {
//        return repository.findById(id)
//                .map(existingReport -> {
//                    // This block updates the existing entity with new data
//                    // We need to set the ID of the new report to ensure we're updating the right one
//                    // updatedReport.setId(existingReport.getId()); is not needed if you're updating fields individually
//
//                    // A better way to update is to copy fields from updatedReport to existingReport
//                    // assuming DailyReports has getters and setters for its fields.
//                    existingReport.setDate(updatedReport.getDate());
//                    existingReport.setTotalSales(updatedReport.getTotalSales());
//                    // ... and so on for all relevant fields
//
//                    // Then, save the modified existingReport
//                    return repository.save(existingReport);
//                }).orElseThrow(() -> new RuntimeException("Report not found with id: " + id));
//    }

    // Delete
    public void deleteReport(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Report not found with id: " + id);
        }
        repository.deleteById(id);
    }
}