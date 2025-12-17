package org.example.Services;

import org.example.Entities.Sequence;
import org.example.Repositories.SequenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UniqueIdGeneratorTest {

    @Mock
    private SequenceRepository sequenceRepository;

    @InjectMocks
    private UniqueIdGenerator uniqueIdGenerator;

    private String currentYear;

    @BeforeEach
    void setUp() {
        currentYear = LocalDate.now().format(DateTimeFormatter.ofPattern("yy"));
    }

    @Test
    void testGenerateId_FirstTime_CreatesNewSequence() {
        // Arrange
        String prefix = "LN";
        
        when(sequenceRepository.findByModulePrefixAndBranchCodeAndYearMonthForUpdate(
                anyString(), anyString(), anyString()))
                .thenReturn(Optional.empty());
        
        Sequence savedSequence = new Sequence();
        savedSequence.setModulePrefix(prefix);
        savedSequence.setBranchCode(currentYear);
        savedSequence.setYearMonth(currentYear);
        savedSequence.setLastNumber(1);
        
        when(sequenceRepository.save(any(Sequence.class))).thenReturn(savedSequence);

        // Act
        String generatedId = uniqueIdGenerator.generateId(prefix);

        // Assert
        assertNotNull(generatedId);
        assertTrue(generatedId.startsWith("LN"));
        assertEquals(8, generatedId.length());
        assertEquals(String.format("LN%s0001", currentYear), generatedId);
        
        verify(sequenceRepository, times(1)).save(any(Sequence.class));
    }

    @Test
    void testGenerateId_ExistingSequence_IncrementsCounter() {
        // Arrange
        String prefix = "PM";
        
        Sequence existingSequence = new Sequence();
        existingSequence.setModulePrefix(prefix);
        existingSequence.setBranchCode(currentYear);
        existingSequence.setYearMonth(currentYear);
        existingSequence.setLastNumber(42);
        
        when(sequenceRepository.findByModulePrefixAndBranchCodeAndYearMonthForUpdate(
                eq(prefix), eq(currentYear), eq(currentYear)))
                .thenReturn(Optional.of(existingSequence));
        
        when(sequenceRepository.save(any(Sequence.class))).thenReturn(existingSequence);

        // Act
        String generatedId = uniqueIdGenerator.generateId(prefix);

        // Assert
        assertNotNull(generatedId);
        assertEquals(String.format("PM%s0043", currentYear), generatedId);
        assertEquals(43, existingSequence.getLastNumber());
        assertEquals(8, generatedId.length());
        
        verify(sequenceRepository, times(1)).save(existingSequence);
    }

    @Test
    void testGenerateLoanId() {
        // Arrange
        when(sequenceRepository.findByModulePrefixAndBranchCodeAndYearMonthForUpdate(
                anyString(), anyString(), anyString()))
                .thenReturn(Optional.empty());
        
        when(sequenceRepository.save(any(Sequence.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        String loanId = uniqueIdGenerator.generateLoanId();

        // Assert
        assertNotNull(loanId);
        assertTrue(loanId.startsWith("LN"));
        assertEquals(8, loanId.length());
    }

    @Test
    void testGeneratePaymentId() {
        // Arrange
        when(sequenceRepository.findByModulePrefixAndBranchCodeAndYearMonthForUpdate(
                anyString(), anyString(), anyString()))
                .thenReturn(Optional.empty());
        
        when(sequenceRepository.save(any(Sequence.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        String paymentId = uniqueIdGenerator.generatePaymentId();

        // Assert
        assertNotNull(paymentId);
        assertTrue(paymentId.startsWith("PM"));
        assertEquals(8, paymentId.length());
    }

    @Test
    void testGenerateExpenseId() {
        // Arrange
        when(sequenceRepository.findByModulePrefixAndBranchCodeAndYearMonthForUpdate(
                anyString(), anyString(), anyString()))
                .thenReturn(Optional.empty());
        
        when(sequenceRepository.save(any(Sequence.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        String expenseId = uniqueIdGenerator.generateExpenseId();

        // Assert
        assertNotNull(expenseId);
        assertTrue(expenseId.startsWith("EX"));
        assertEquals(8, expenseId.length());
    }

    @Test
    void testPreviewNextId_NoExistingSequence() {
        // Arrange
        String prefix = "LN";
        
        when(sequenceRepository.findByModulePrefixAndBranchCodeAndYearMonth(
                eq(prefix), eq(currentYear), eq(currentYear)))
                .thenReturn(Optional.empty());

        // Act
        String previewId = uniqueIdGenerator.previewNextId(prefix);

        // Assert
        assertNotNull(previewId);
        assertEquals(8, previewId.length());
        assertTrue(previewId.endsWith("0001"));
        
        verify(sequenceRepository, never()).save(any(Sequence.class));
    }

    @Test
    void testPreviewNextId_WithExistingSequence() {
        // Arrange
        String prefix = "LN";
        
        Sequence existingSequence = new Sequence();
        existingSequence.setLastNumber(99);
        
        when(sequenceRepository.findByModulePrefixAndBranchCodeAndYearMonth(
                eq(prefix), eq(currentYear), eq(currentYear)))
                .thenReturn(Optional.of(existingSequence));

        // Act
        String previewId = uniqueIdGenerator.previewNextId(prefix);

        // Assert
        assertNotNull(previewId);
        assertEquals(8, previewId.length());
        assertTrue(previewId.endsWith("0100"));
        
        verify(sequenceRepository, never()).save(any(Sequence.class));
    }

    @Test
    void testMultipleGenerations_IncrementsProperly() {
        // Arrange
        String prefix = "EX";
        
        Sequence sequence = new Sequence();
        sequence.setModulePrefix(prefix);
        sequence.setBranchCode(currentYear);
        sequence.setYearMonth(currentYear);
        sequence.setLastNumber(0);
        
        when(sequenceRepository.findByModulePrefixAndBranchCodeAndYearMonthForUpdate(
                eq(prefix), eq(currentYear), eq(currentYear)))
                .thenReturn(Optional.of(sequence));
        
        when(sequenceRepository.save(any(Sequence.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        String id1 = uniqueIdGenerator.generateId(prefix);
        sequence.setLastNumber(1); // Simulate increment
        String id2 = uniqueIdGenerator.generateId(prefix);
        sequence.setLastNumber(2); // Simulate increment
        String id3 = uniqueIdGenerator.generateId(prefix);

        // Assert
        assertEquals(8, id1.length());
        assertEquals(8, id2.length());
        assertEquals(8, id3.length());
        assertTrue(id1.endsWith("0001"));
        assertTrue(id2.endsWith("0002"));
        assertTrue(id3.endsWith("0003"));
    }

    @Test
    void testDifferentPrefixes_IndependentSequences() {
        // Arrange
        String prefix1 = "LN";
        String prefix2 = "PM";
        
        when(sequenceRepository.findByModulePrefixAndBranchCodeAndYearMonthForUpdate(
                anyString(), anyString(), anyString()))
                .thenReturn(Optional.empty());
        
        when(sequenceRepository.save(any(Sequence.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act
        String id1 = uniqueIdGenerator.generateId(prefix1);
        String id2 = uniqueIdGenerator.generateId(prefix2);

        // Assert
        assertTrue(id1.startsWith("LN"));
        assertTrue(id2.startsWith("PM"));
        assertEquals(8, id1.length());
        assertEquals(8, id2.length());
        assertTrue(id1.endsWith("0001"));
        assertTrue(id2.endsWith("0001")); // Independent sequence for PM
    }
}
