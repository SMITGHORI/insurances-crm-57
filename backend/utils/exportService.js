
const XLSX = require('xlsx');
const { Parser } = require('json2csv');
const path = require('path');
const fs = require('fs').promises;

class ExportService {
  constructor() {
    this.ensureExportDirectory();
  }

  async ensureExportDirectory() {
    const exportDir = path.join(__dirname, '../exports');
    try {
      await fs.access(exportDir);
    } catch {
      await fs.mkdir(exportDir, { recursive: true });
    }
  }

  async generateCSV(data, fields, filename) {
    try {
      const parser = new Parser({ fields });
      const csv = parser.parse(data);
      
      const filePath = path.join(__dirname, '../exports', `${filename}.csv`);
      await fs.writeFile(filePath, csv);
      
      return {
        success: true,
        filePath,
        contentType: 'text/csv',
        filename: `${filename}.csv`
      };
    } catch (error) {
      throw new Error(`CSV generation failed: ${error.message}`);
    }
  }

  async generateExcel(data, fields, filename, sheetName = 'Data') {
    try {
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      
      // Filter data to only include specified fields if provided
      let filteredData = data;
      if (fields && fields.length > 0) {
        filteredData = data.map(item => {
          const filtered = {};
          fields.forEach(field => {
            if (item[field] !== undefined) {
              filtered[field] = item[field];
            }
          });
          return filtered;
        });
      }
      
      const ws = XLSX.utils.json_to_sheet(filteredData);
      
      // Auto-size columns
      const range = XLSX.utils.decode_range(ws['!ref']);
      const colWidths = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxWidth = 10;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cellAddress = XLSX.utils.encode_cell({ c: C, r: R });
          const cell = ws[cellAddress];
          if (cell && cell.v) {
            const cellLength = cell.v.toString().length;
            if (cellLength > maxWidth) {
              maxWidth = cellLength;
            }
          }
        }
        colWidths[C] = { width: Math.min(maxWidth + 2, 50) };
      }
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      
      const filePath = path.join(__dirname, '../exports', `${filename}.xlsx`);
      XLSX.writeFile(wb, filePath);
      
      return {
        success: true,
        filePath,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `${filename}.xlsx`
      };
    } catch (error) {
      throw new Error(`Excel generation failed: ${error.message}`);
    }
  }

  async cleanupFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error cleaning up file:', error);
    }
  }

  formatDataForExport(data, type) {
    return data.map(item => {
      const formatted = { ...item };
      
      // Convert ObjectIds to strings
      Object.keys(formatted).forEach(key => {
        if (formatted[key] && typeof formatted[key] === 'object' && formatted[key]._id) {
          formatted[key] = formatted[key]._id.toString();
        }
        if (key === '_id' || key.endsWith('Id')) {
          formatted[key] = formatted[key].toString();
        }
        if (formatted[key] instanceof Date) {
          formatted[key] = formatted[key].toISOString().split('T')[0];
        }
      });
      
      // Type-specific formatting
      switch (type) {
        case 'clients':
          return this.formatClientData(formatted);
        case 'quotations':
          return this.formatQuotationData(formatted);
        case 'leads':
          return this.formatLeadData(formatted);
        case 'policies':
          return this.formatPolicyData(formatted);
        case 'claims':
          return this.formatClaimData(formatted);
        case 'agents':
          return this.formatAgentData(formatted);
        default:
          return formatted;
      }
    });
  }

  formatClientData(client) {
    return {
      'Client ID': client.clientId,
      'Type': client.clientType,
      'Name': client.displayName || client.name,
      'Email': client.email,
      'Phone': client.phone,
      'Status': client.status,
      'City': client.city,
      'State': client.state,
      'Assigned Agent': client.assignedAgentId,
      'Created Date': client.createdAt,
      'Updated Date': client.updatedAt
    };
  }

  formatQuotationData(quotation) {
    return {
      'Quotation ID': quotation.quotationId,
      'Client Name': quotation.clientName,
      'Insurance Type': quotation.insuranceType,
      'Premium Amount': quotation.premiumAmount,
      'Status': quotation.status,
      'Valid Until': quotation.validUntil,
      'Agent': quotation.agentId,
      'Created Date': quotation.createdAt,
      'Updated Date': quotation.updatedAt
    };
  }

  formatLeadData(lead) {
    return {
      'Lead ID': lead.leadId,
      'Name': lead.name,
      'Email': lead.email,
      'Phone': lead.phone,
      'Source': lead.source,
      'Status': lead.status,
      'Interest': lead.interestArea,
      'Agent': lead.assignedAgent,
      'Created Date': lead.createdAt,
      'Updated Date': lead.updatedAt
    };
  }

  formatPolicyData(policy) {
    return {
      'Policy Number': policy.policyNumber,
      'Client Name': policy.clientName,
      'Insurance Type': policy.insuranceType,
      'Premium': policy.premium,
      'Status': policy.status,
      'Start Date': policy.startDate,
      'End Date': policy.endDate,
      'Agent': policy.agentId,
      'Created Date': policy.createdAt
    };
  }

  formatClaimData(claim) {
    return {
      'Claim ID': claim.claimId,
      'Policy Number': claim.policyNumber,
      'Client Name': claim.clientName,
      'Claim Amount': claim.claimAmount,
      'Status': claim.status,
      'Claim Type': claim.claimType,
      'Date Filed': claim.dateFiled,
      'Agent': claim.agentId,
      'Created Date': claim.createdAt
    };
  }

  formatAgentData(agent) {
    return {
      'Agent ID': agent.agentId,
      'Name': agent.name,
      'Email': agent.email,
      'Phone': agent.phone,
      'Status': agent.status,
      'Department': agent.department,
      'Join Date': agent.joinDate,
      'Created Date': agent.createdAt
    };
  }
}

module.exports = new ExportService();
