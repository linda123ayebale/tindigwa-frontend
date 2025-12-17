package org.example.Controllers;

import org.example.Entities.LoanInstallmentSchedule;
import org.example.Services.InstallmentScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/installments")
@CrossOrigin(origins = "*")
public class InstallmentScheduleController {
    
    @Autowired
    private InstallmentScheduleService installmentScheduleService;
    
    @Autowired
    private org.example.Repositories.LoanInstallmentScheduleRepository installmentRepository;
    
    /**
     * Generate installment schedule for a loan
     */
    @PostMapping("/generate/{loanId}")
    public ResponseEntity<?> generateSchedule(@PathVariable Long loanId) {
        try {
            List<LoanInstallmentSchedule> schedule = installmentScheduleService.generateSchedule(loanId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Schedule generated successfully",
                "totalInstallments", schedule.size(),
                "installments", schedule
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
    
    /**
     * Get full payment schedule for a loan
     */
    @GetMapping("/loan/{loanId}/schedule")
    public ResponseEntity<List<LoanInstallmentSchedule>> getScheduleForLoan(@PathVariable Long loanId) {
        List<LoanInstallmentSchedule> schedule = installmentScheduleService.getScheduleForLoan(loanId);
        return ResponseEntity.ok(schedule);
    }
    
    /**
     * Get next unpaid installment for a loan
     */
    @GetMapping("/loan/{loanId}/next")
    public ResponseEntity<?> getNextUnpaidInstallment(@PathVariable Long loanId) {
        LoanInstallmentSchedule nextInstallment = installmentScheduleService.getNextUnpaidInstallment(loanId);
        if (nextInstallment != null) {
            return ResponseEntity.ok(nextInstallment);
        }
        return ResponseEntity.ok(Map.of("message", "No unpaid installments found"));
    }
    
    /**
     * Get specific installment
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getInstallmentById(@PathVariable Long id) {
        return installmentRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get installments due today
     */
    @GetMapping("/due/today")
    public ResponseEntity<List<LoanInstallmentSchedule>> getInstallmentsDueToday() {
        List<LoanInstallmentSchedule> installments = installmentRepository.findDueToday();
        return ResponseEntity.ok(installments);
    }
    
    /**
     * Get installments due in next N days
     */
    @GetMapping("/due/upcoming")
    public ResponseEntity<List<LoanInstallmentSchedule>> getUpcomingDueInstallments(
            @RequestParam(defaultValue = "7") int days) {
        LocalDate endDate = LocalDate.now().plusDays(days);
        List<LoanInstallmentSchedule> installments = installmentRepository.findDueInNextDays(endDate);
        return ResponseEntity.ok(installments);
    }
    
    /**
     * Get installments due between dates
     */
    @GetMapping("/due/range")
    public ResponseEntity<List<LoanInstallmentSchedule>> getInstallmentsDueBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<LoanInstallmentSchedule> installments = installmentRepository.findDueBetweenDates(startDate, endDate);
        return ResponseEntity.ok(installments);
    }
    
    /**
     * Get all overdue installments
     */
    @GetMapping("/overdue")
    public ResponseEntity<List<LoanInstallmentSchedule>> getOverdueInstallments() {
        List<LoanInstallmentSchedule> installments = installmentRepository.findOverdueInstallments();
        return ResponseEntity.ok(installments);
    }
    
    /**
     * Get overdue installments for a specific loan
     */
    @GetMapping("/loan/{loanId}/overdue")
    public ResponseEntity<List<LoanInstallmentSchedule>> getOverdueInstallmentsByLoan(@PathVariable Long loanId) {
        List<LoanInstallmentSchedule> installments = installmentRepository.findOverdueInstallmentsByLoanId(loanId);
        return ResponseEntity.ok(installments);
    }
    
    /**
     * Get installments in grace period
     */
    @GetMapping("/grace-period")
    public ResponseEntity<List<LoanInstallmentSchedule>> getInstallmentsInGracePeriod() {
        List<LoanInstallmentSchedule> installments = installmentRepository.findInGracePeriod();
        return ResponseEntity.ok(installments);
    }
    
    /**
     * Get installments where grace period expires soon
     */
    @GetMapping("/grace-period/expiring")
    public ResponseEntity<List<LoanInstallmentSchedule>> getGracePeriodExpiringSoon(
            @RequestParam(defaultValue = "3") int days) {
        LocalDate endDate = LocalDate.now().plusDays(days);
        List<LoanInstallmentSchedule> installments = installmentRepository.findGracePeriodExpiringSoon(endDate);
        return ResponseEntity.ok(installments);
    }
    
    /**
     * Get partial payments
     */
    @GetMapping("/partial")
    public ResponseEntity<List<LoanInstallmentSchedule>> getPartialPayments() {
        List<LoanInstallmentSchedule> installments = installmentRepository.findByIsPartialTrueOrderByDueDateDesc();
        return ResponseEntity.ok(installments);
    }
    
    /**
     * Get installments by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<LoanInstallmentSchedule>> getInstallmentsByStatus(@PathVariable String status) {
        List<LoanInstallmentSchedule> installments = installmentRepository.findByStatus(status.toUpperCase());
        return ResponseEntity.ok(installments);
    }
    
    /**
     * Get schedule summary for a loan
     */
    @GetMapping("/loan/{loanId}/summary")
    public ResponseEntity<Map<String, Object>> getScheduleSummary(@PathVariable Long loanId) {
        Long totalInstallments = installmentRepository.countByLoanId(loanId);
        Long paidInstallments = installmentRepository.countByLoanIdAndIsPaidTrue(loanId);
        Long overdueInstallments = installmentRepository.countOverdueInstallmentsByLoanId(loanId);
        
        Double totalPaid = installmentRepository.getTotalPaidByLoanId(loanId);
        Double totalOutstanding = installmentRepository.getTotalOutstandingByLoanId(loanId);
        Double totalPenalties = installmentRepository.getTotalPenaltiesByLoanId(loanId);
        
        Double completionRate = installmentRepository.getPaymentCompletionRate(loanId);
        Long onTimePayments = installmentRepository.getOnTimePaymentCount(loanId);
        Long latePayments = installmentRepository.getLatePaymentCount(loanId);
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalInstallments", totalInstallments != null ? totalInstallments : 0);
        summary.put("paidInstallments", paidInstallments != null ? paidInstallments : 0);
        summary.put("unpaidInstallments", totalInstallments != null && paidInstallments != null ? totalInstallments - paidInstallments : 0);
        summary.put("overdueInstallments", overdueInstallments != null ? overdueInstallments : 0);
        summary.put("totalPaid", totalPaid != null ? totalPaid : 0.0);
        summary.put("totalOutstanding", totalOutstanding != null ? totalOutstanding : 0.0);
        summary.put("totalPenalties", totalPenalties != null ? totalPenalties : 0.0);
        summary.put("completionRate", completionRate != null ? completionRate : 0.0);
        summary.put("onTimePayments", onTimePayments != null ? onTimePayments : 0);
        summary.put("latePayments", latePayments != null ? latePayments : 0);
        
        return ResponseEntity.ok(summary);
    }
    
    /**
     * Get all loans with overdue installments
     */
    @GetMapping("/loans/overdue")
    public ResponseEntity<List<Long>> getLoansWithOverdueInstallments() {
        List<Long> loanIds = installmentRepository.findLoansWithOverdueInstallments();
        return ResponseEntity.ok(loanIds);
    }
    
    /**
     * Get all loans with upcoming installments
     */
    @GetMapping("/loans/upcoming")
    public ResponseEntity<List<Long>> getLoansWithUpcomingInstallments(
            @RequestParam(defaultValue = "7") int days) {
        LocalDate endDate = LocalDate.now().plusDays(days);
        List<Long> loanIds = installmentRepository.findLoansWithUpcomingInstallments(endDate);
        return ResponseEntity.ok(loanIds);
    }
    
    /**
     * Update installment statuses (manual trigger for scheduled job)
     */
    @PostMapping("/update-statuses")
    public ResponseEntity<Map<String, Object>> updateInstallmentStatuses() {
        try {
            installmentScheduleService.updateInstallmentStatuses();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Installment statuses updated successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
    
    /**
     * Delete schedule for a loan (use with caution)
     */
    @DeleteMapping("/loan/{loanId}")
    public ResponseEntity<Map<String, Object>> deleteScheduleForLoan(@PathVariable Long loanId) {
        try {
            installmentRepository.deleteByLoanId(loanId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Schedule deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
}
