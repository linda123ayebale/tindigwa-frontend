import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

/**
 * Reusable Document Generation Service
 * 
 * This service provides a flexible way to generate PDF and Word documents
 * from structured data using templates. Can be used for any document type:
 * - Loan Agreements
 * - Payment Receipts
 * - Invoices
 * - Reports
 * - Contracts
 * etc.
 */
class DocumentGenerationService {
  constructor() {
    this.defaultStyles = {
      colors: {
        primary: [66, 133, 244],
        secondary: [52, 152, 219],
        success: [40, 167, 69],
        danger: [220, 53, 69],
        text: [0, 0, 0],
        textLight: [128, 128, 128],
        white: [255, 255, 255]
      },
      fonts: {
        title: { size: 24, style: 'bold' },
        subtitle: { size: 14, style: 'normal' },
        heading: { size: 12, style: 'bold' },
        body: { size: 10, style: 'normal' },
        small: { size: 9, style: 'normal' }
      },
      spacing: {
        margin: 20,
        sectionGap: 10,
        lineHeight: 5
      }
    };
  }

  /**
   * Validate template and log any missing field mappings
   * @param {Array} sections - Template sections to validate
   * @param {Object} data - Data object to check against
   */
  _validateTemplate(sections, data) {
    if (!sections || !Array.isArray(sections)) {
      console.warn('[DocumentGeneration] Invalid sections provided for validation');
      return;
    }

    console.log('[DocumentGeneration] Validating template with', sections.length, 'sections');
    
    sections.forEach((section, index) => {
      // Validate section type
      if (!section.type) {
        console.warn(`[DocumentGeneration] Section ${index} has no type defined`);
      }

      // Validate based on section type
      switch (section.type) {
        case 'table':
          if (section.dataKey && !this._getNestedValue(data, section.dataKey)) {
            console.warn(`[DocumentGeneration] Table section "${section.title || index}" references missing dataKey: ${section.dataKey}`);
          }
          if (section.rows) {
            section.rows.forEach((row, rowIndex) => {
              row.forEach((cell, cellIndex) => {
                const placeholders = this._extractPlaceholders(cell);
                placeholders.forEach(placeholder => {
                  if (!this._getNestedValue(data, placeholder)) {
                    console.warn(`[DocumentGeneration] Table section "${section.title || index}" row ${rowIndex} cell ${cellIndex} references missing field: ${placeholder}`);
                  }
                });
              });
            });
          }
          break;

        case 'keyValue':
          if (section.dataKey && !this._getNestedValue(data, section.dataKey)) {
            console.warn(`[DocumentGeneration] KeyValue section "${section.title || index}" references missing dataKey: ${section.dataKey}`);
          }
          if (section.pairs) {
            section.pairs.forEach((pair, pairIndex) => {
              const keyPlaceholders = this._extractPlaceholders(pair.key);
              const valuePlaceholders = this._extractPlaceholders(pair.value);
              
              [...keyPlaceholders, ...valuePlaceholders].forEach(placeholder => {
                if (!this._getNestedValue(data, placeholder)) {
                  console.warn(`[DocumentGeneration] KeyValue section "${section.title || index}" pair ${pairIndex} references missing field: ${placeholder}`);
                }
              });
            });
          }
          break;

        case 'text':
          if (section.content) {
            const placeholders = this._extractPlaceholders(section.content);
            placeholders.forEach(placeholder => {
              if (!this._getNestedValue(data, placeholder)) {
                console.warn(`[DocumentGeneration] Text section "${section.title || index}" references missing field: ${placeholder}`);
              }
            });
          }
          break;

        case 'list':
          if (section.dataKey && !this._getNestedValue(data, section.dataKey)) {
            console.warn(`[DocumentGeneration] List section "${section.title || index}" references missing dataKey: ${section.dataKey}`);
          }
          break;

        case 'signature':
          if (section.signatures) {
            section.signatures.forEach((sig, sigIndex) => {
              if (sig.nameKey && !this._getNestedValue(data, sig.nameKey)) {
                console.warn(`[DocumentGeneration] Signature ${sigIndex} in section "${section.title || index}" references missing nameKey: ${sig.nameKey}`);
              }
              if (sig.dateKey && !this._getNestedValue(data, sig.dateKey)) {
                console.warn(`[DocumentGeneration] Signature ${sigIndex} in section "${section.title || index}" references missing dateKey: ${sig.dateKey}`);
              }
            });
          }
          break;
      }
    });

    console.log('[DocumentGeneration] Template validation complete');
  }

  /**
   * Extract placeholder field names from a template string
   * @param {string} text - Template text with {{placeholder}} syntax
   * @returns {Array} Array of placeholder names
   */
  _extractPlaceholders(text) {
    if (!text || typeof text !== 'string') return [];
    const regex = /\{\{(\w+(?:\.\w+)*)\}\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }
    return matches;
  }

  /**
   * Generate PDF document from template
   * @param {Object} template - Document template configuration
   * @param {Object} data - Data to populate the document
   * @param {Object} options - Additional options (styles, filename, etc.)
   */
  async generatePDF(template, data, options = {}) {
    // Validate template before generation
    console.log('[DocumentGeneration] Starting PDF generation');
    this._validateTemplate(template.sections, data);
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = options.margin || this.defaultStyles.spacing.margin;
    const contentWidth = pageWidth - 2 * margin;

    let yPos = margin;

    // Helper to check if we need a new page
    const checkPageBreak = (requiredSpace = 20) => {
      if (yPos + requiredSpace > pageHeight - margin - 15) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Render Header
    if (template.header) {
      yPos = this._renderHeader(doc, template.header, data, pageWidth, yPos, options);
    }

    // Render Sections
    if (template.sections && Array.isArray(template.sections)) {
      for (const section of template.sections) {
        // Check if section should be shown based on showIf condition
        if (section.showIf && typeof section.showIf === 'function') {
          if (!section.showIf(data)) {
            console.log(`[DocumentGeneration] Skipping section "${section.title || 'untitled'}" due to showIf condition`);
            continue; // Skip this section
          }
        }
        
        checkPageBreak(30);
        yPos = await this._renderSection(doc, section, data, margin, contentWidth, yPos, checkPageBreak, options);
        yPos += this.defaultStyles.spacing.sectionGap;
      }
    }

    // Render Footer on all pages
    if (template.footer) {
      this._renderFooter(doc, template.footer, data, pageWidth, pageHeight);
    }

    // Save the PDF
    const fileName = this._generateFileName(template.fileName, data, 'pdf');
    doc.save(fileName);

    return { success: true, fileName };
  }

  /**
   * Generate DOCX document from template
   * @param {Object} template - Document template configuration
   * @param {Object} data - Data to populate the document
   * @param {Object} options - Additional options
   */
  async generateDOCX(template, data, options = {}) {
    // Validate template before generation
    console.log('[DocumentGeneration] Starting Word generation');
    this._validateTemplate(template.sections, data);
    
    let content = '';

    // Header
    if (template.header) {
      content += this._renderHeaderText(template.header, data);
      content += '\n\n' + '='.repeat(80) + '\n\n';
    }

    // Sections
    if (template.sections && Array.isArray(template.sections)) {
      for (const section of template.sections) {
        // Check if section should be shown based on showIf condition
        if (section.showIf && typeof section.showIf === 'function') {
          if (!section.showIf(data)) {
            console.log(`[DocumentGeneration] Skipping section "${section.title || 'untitled'}" in Word doc due to showIf condition`);
            continue; // Skip this section
          }
        }
        
        content += this._renderSectionText(section, data);
        content += '\n' + '='.repeat(80) + '\n\n';
      }
    }

    // Footer
    if (template.footer) {
      content += this._renderFooterText(template.footer, data);
    }

    // Create and save blob
    const blob = new Blob([content], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    const fileName = this._generateFileName(template.fileName, data, 'docx');
    saveAs(blob, fileName);

    return { success: true, fileName };
  }

  // ==================== PDF RENDERING METHODS ====================

  _renderHeader(doc, header, data, pageWidth, yPos, options) {
    const colors = options.colors || this.defaultStyles.colors;

    if (header.background) {
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(...colors.white);
    } else {
      doc.setTextColor(...colors.text);
    }

    // Title
    if (header.title) {
      doc.setFontSize(this.defaultStyles.fonts.title.size);
      doc.setFont('helvetica', 'bold');
      const title = this._replacePlaceholders(header.title, data);
      doc.text(title, pageWidth / 2, 20, { align: 'center' });
    }

    // Subtitle
    if (header.subtitle) {
      doc.setFontSize(this.defaultStyles.fonts.subtitle.size);
      doc.setFont('helvetica', 'normal');
      const subtitle = this._replacePlaceholders(header.subtitle, data);
      doc.text(subtitle, pageWidth / 2, 30, { align: 'center' });
    }

    doc.setTextColor(...colors.text);
    return header.background ? 50 : yPos + 30;
  }

  async _renderSection(doc, section, data, margin, contentWidth, yPos, checkPageBreak, options) {
    const colors = options.colors || this.defaultStyles.colors;

    // Section Title
    if (section.title) {
      doc.setFontSize(this.defaultStyles.fonts.heading.size);
      doc.setFont('helvetica', 'bold');
      const title = this._replacePlaceholders(section.title, data);
      doc.text(title, margin, yPos);
      yPos += 8;
    }

    // Section Content
    switch (section.type) {
      case 'text':
        yPos = this._renderText(doc, section, data, margin, contentWidth, yPos, checkPageBreak);
        break;
      case 'table':
        yPos = this._renderTable(doc, section, data, margin, contentWidth, yPos, colors);
        break;
      case 'list':
        yPos = this._renderList(doc, section, data, margin, contentWidth, yPos, checkPageBreak);
        break;
      case 'keyValue':
        yPos = this._renderKeyValue(doc, section, data, margin, contentWidth, yPos, colors);
        break;
      case 'signature':
        yPos = this._renderSignature(doc, section, data, margin, contentWidth, yPos);
        break;
      default:
        break;
    }

    return yPos;
  }

  _renderText(doc, section, data, margin, contentWidth, yPos, checkPageBreak) {
    doc.setFontSize(this.defaultStyles.fonts.body.size);
    doc.setFont('helvetica', 'normal');

    const text = this._replacePlaceholders(section.content, data);
    const lines = doc.splitTextToSize(text, contentWidth);

    lines.forEach(line => {
      checkPageBreak(10);
      doc.text(line, margin, yPos);
      yPos += this.defaultStyles.spacing.lineHeight;
    });

    return yPos;
  }

  _renderTable(doc, section, data, margin, contentWidth, yPos, colors) {
    const tableData = this._prepareTableData(section, data);

    // Call autoTable function with doc as first parameter
    autoTable(doc, {
      startY: yPos,
      head: tableData.headers ? [tableData.headers] : undefined,
      body: tableData.rows,
      theme: section.theme || 'striped',
      headStyles: { 
        fillColor: colors.primary, 
        textColor: colors.white, 
        fontStyle: 'bold' 
      },
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: section.columnStyles || {}
    });

    return doc.lastAutoTable.finalY + 10;
  }

  _renderList(doc, section, data, margin, contentWidth, yPos, checkPageBreak) {
    doc.setFontSize(this.defaultStyles.fonts.small.size);
    doc.setFont('helvetica', 'normal');

    const items = (section.dataKey ? this._getNestedValue(data, section.dataKey) : null) || section.items || [];
    
    items.forEach((item, index) => {
      checkPageBreak(15);
      const text = typeof item === 'string' ? item : this._replacePlaceholders(section.itemTemplate, item);
      const prefix = section.numbered ? `${index + 1}. ` : '• ';
      const lines = doc.splitTextToSize(prefix + text, contentWidth - 5);
      
      lines.forEach(line => {
        doc.text(line, margin + (section.indent || 0), yPos);
        yPos += 4;
      });
      yPos += 3;
    });

    return yPos;
  }

  _renderKeyValue(doc, section, data, margin, contentWidth, yPos, colors) {
    const pairs = this._prepareKeyValuePairs(section, data);

    // Call autoTable function with doc as first parameter
    autoTable(doc, {
      startY: yPos,
      body: pairs,
      theme: 'plain',
      margin: { left: margin, right: margin },
      tableWidth: contentWidth,
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: section.keyWidth || 80 },
        1: { halign: section.valueAlign || 'left' }
      }
    });

    return doc.lastAutoTable.finalY + 10;
  }

  _renderSignature(doc, section, data, margin, contentWidth, yPos) {
    doc.setFontSize(this.defaultStyles.fonts.body.size);
    doc.setFont('helvetica', 'normal');

    const signatures = section.signatures || [];
    const sigWidth = (contentWidth - (signatures.length - 1) * 20) / signatures.length;
    
    signatures.forEach((sig, index) => {
      const xPos = margin + index * (sigWidth + 20);
      
      // Signature line
      doc.line(xPos, yPos + 15, xPos + sigWidth, yPos + 15);
      
      // Label
      doc.text(this._replacePlaceholders(sig.label, data), xPos, yPos + 20);
      
      // Name
      if (sig.nameKey) {
        doc.setFont('helvetica', 'bold');
        const name = this._getNestedValue(data, sig.nameKey);
        doc.text(name || 'N/A', xPos, yPos + 25);
        doc.setFont('helvetica', 'normal');
      }
      
      // Date
      if (sig.showDate) {
        const date = sig.dateKey ? this._getNestedValue(data, sig.dateKey) : this._formatDate(new Date());
        doc.text(`Date: ${date}`, xPos, yPos + 30);
      }
    });

    return yPos + 45;
  }

  _renderFooter(doc, footer, data, pageWidth, pageHeight) {
    const pageCount = doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      
      const footerText = this._replacePlaceholders(footer.text, { 
        ...data, 
        pageNumber: i, 
        totalPages: pageCount 
      });
      
      doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  }

  // ==================== DOCX RENDERING METHODS ====================

  _renderHeaderText(header, data) {
    let text = '';
    if (header.title) {
      text += this._replacePlaceholders(header.title, data).toUpperCase() + '\n';
    }
    if (header.subtitle) {
      text += this._replacePlaceholders(header.subtitle, data) + '\n';
    }
    return text;
  }

  _renderSectionText(section, data) {
    let text = '';
    
    if (section.title) {
      text += this._replacePlaceholders(section.title, data).toUpperCase() + '\n';
    }

    switch (section.type) {
      case 'text':
        text += this._replacePlaceholders(section.content, data) + '\n';
        break;
      case 'table':
      case 'keyValue':
        const pairs = section.type === 'table' 
          ? this._prepareTableData(section, data).rows 
          : this._prepareKeyValuePairs(section, data);
        pairs.forEach(row => {
          text += Array.isArray(row) ? row.join(': ') : row + '\n';
        });
        break;
      case 'list':
        const items = (section.dataKey ? this._getNestedValue(data, section.dataKey) : null) || section.items || [];
        items.forEach((item, index) => {
          const itemText = typeof item === 'string' ? item : this._replacePlaceholders(section.itemTemplate, item);
          const prefix = section.numbered ? `${index + 1}. ` : '• ';
          text += prefix + itemText + '\n';
        });
        break;
      case 'signature':
        const signatures = section.signatures || [];
        signatures.forEach(sig => {
          text += `\n${this._replacePlaceholders(sig.label, data)}: _________________________\n`;
          if (sig.nameKey) {
            text += `Name: ${this._getNestedValue(data, sig.nameKey) || 'N/A'}\n`;
          }
          if (sig.showDate) {
            const date = sig.dateKey ? this._getNestedValue(data, sig.dateKey) : this._formatDate(new Date());
            text += `Date: ${date}\n`;
          }
        });
        break;
    }

    return text + '\n';
  }

  _renderFooterText(footer, data) {
    return '\n' + this._replacePlaceholders(footer.text, data);
  }

  // ==================== UTILITY METHODS ====================

  _replacePlaceholders(text, data) {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (match, path) => {
      const value = this._getNestedValue(data, path);
      // Return 'N/A' for missing values, value for found values
      if (value === null || value === undefined || value === '') {
        return 'N/A';
      }
      return String(value);
    });
  }

  _getNestedValue(obj, path) {
    // Harden against null/undefined/non-string paths
    if (!path) {
      console.warn('[DocumentGeneration] _getNestedValue called with null/undefined path');
      return '';
    }
    
    if (typeof path !== 'string') {
      console.warn('[DocumentGeneration] _getNestedValue called with non-string path:', path);
      return '';
    }
    
    if (!obj) {
      console.warn('[DocumentGeneration] _getNestedValue called with null/undefined object for path:', path);
      return '';
    }
    
    try {
      const value = path.split('.').reduce((current, prop) => current?.[prop], obj);
      return value !== undefined && value !== null ? value : '';
    } catch (error) {
      console.error('[DocumentGeneration] Error getting nested value for path:', path, error);
      return '';
    }
  }

  _prepareTableData(section, data) {
    const tableData = { headers: section.headers, rows: [] };
    
    if (section.dataKey) {
      const rows = this._getNestedValue(data, section.dataKey) || [];
      tableData.rows = rows.map(row => 
        section.columns.map(col => 
          typeof col === 'string' ? row[col] : this._replacePlaceholders(col.template, row)
        )
      );
    } else if (section.rows) {
      tableData.rows = section.rows.map(row => 
        row.map(cell => this._replacePlaceholders(cell, data))
      );
    }

    return tableData;
  }

  _prepareKeyValuePairs(section, data) {
    if (section.dataKey) {
      const obj = this._getNestedValue(data, section.dataKey) || {};
      return Object.entries(obj).map(([key, value]) => [key, value]);
    } else if (section.pairs) {
      return section.pairs.map(pair => [
        this._replacePlaceholders(pair.key, data),
        this._replacePlaceholders(pair.value, data)
      ]);
    }
    return [];
  }

  _generateFileName(template, data, extension) {
    const fileName = this._replacePlaceholders(template, data);
    const timestamp = Date.now();
    return `${fileName}_${timestamp}.${extension}`;
  }

  _formatDate(date) {
    if (!date) return new Date().toLocaleDateString('en-GB');
    return new Date(date).toLocaleDateString('en-GB');
  }

  _formatCurrency(amount, currency = 'UGX', symbol = 'USh') {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount || 0).replace(currency, symbol);
  }

  // Public utility methods
  formatters = {
    currency: (amount, currency, symbol) => this._formatCurrency(amount, currency, symbol),
    date: (date) => this._formatDate(date),
    uppercase: (text) => text?.toUpperCase(),
    lowercase: (text) => text?.toLowerCase(),
    capitalize: (text) => text?.charAt(0).toUpperCase() + text?.slice(1)
  };
}

export default new DocumentGenerationService();
