import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { Student } from '../../types';

export const DataMigration: React.FC = () => {
  const { students, importStudentsCSV } = useApp();

  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<Partial<Student>[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importSummary, setImportSummary] = useState<{ added: number; skipped: number } | null>(null);

  // Sample CSV template content
  const sampleCsvContent = `FirstName,LastName,DOB,Email,Phone,City,Category
Laura,Brunner,2014-03-22,laura.brunner@bluewin.ch,+41 79 123 45 67,Zürich,Kids
Julian,Favre,2008-11-14,julian.favre@sunrise.ch,+41 78 987 65 43,Winterthur,Teens
Valérie,Müller,1995-07-02,valerie.mueller@gmail.com,+41 76 555 12 34,Uster,Adults`;

  const downloadSampleTemplate = () => {
    const encoded = encodeURI('data:text/csv;charset=utf-8,' + sampleCsvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', 'DanseFlow_Student_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleParseCsv = (textToParse: string) => {
    setCsvText(textToParse);
    const lines = textToParse.trim().split('\n');
    if (lines.length < 2) {
      setParsedRows([]);
      setValidationErrors(['CSV file must have a header line and at least one data row.']);
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows: Partial<Student>[] = [];
    const errors: string[] = [];

    const existingEmails = new Set(students.map(s => s.email.toLowerCase()));

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());

      const rowObj: any = {};
      headers.forEach((h, idx) => {
        const val = values[idx] || '';
        if (h.includes('first')) rowObj.firstName = val;
        else if (h.includes('last')) rowObj.lastName = val;
        else if (h.includes('dob') || h.includes('birth')) rowObj.dateOfBirth = val;
        else if (h.includes('email')) rowObj.email = val;
        else if (h.includes('phone')) rowObj.phone = val;
        else if (h.includes('city')) rowObj.city = val;
        else if (h.includes('category')) rowObj.pricingCategory = val;
      });

      if (!rowObj.firstName || !rowObj.lastName) {
        errors.push(`Row ${i}: Missing dancer name (${rowObj.firstName || ''} ${rowObj.lastName || ''})`);
      } else if (!rowObj.email) {
        errors.push(`Row ${i} (${rowObj.firstName} ${rowObj.lastName}): Missing email address`);
      } else if (existingEmails.has(rowObj.email.toLowerCase())) {
        errors.push(`Row ${i} (${rowObj.firstName} ${rowObj.lastName}): Email ${rowObj.email} already exists in database (duplicate)`);
      }

      rows.push(rowObj);
    }

    setParsedRows(rows);
    setValidationErrors(errors);
    setImportSummary(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      handleParseCsv(text);
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) return;
    const res = importStudentsCSV(parsedRows);
    setImportSummary(res);
    setParsedRows([]);
    setCsvText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Data Import & Migration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Migrate existing Excel and CSV dancer rosters with duplicate detection and column mapping.
          </p>
        </div>

        <button
          onClick={downloadSampleTemplate}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-violet-600" />
          <span>Download Sample CSV Template</span>
        </button>
      </div>

      {/* Upload Drop Zone & Sample Loader */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-violet-400 transition bg-slate-50/50">
          <Upload className="w-8 h-8 text-violet-600 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-900">Upload CSV File</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Drop your dance school spreadsheet or click to select a file from your computer.
          </p>

          <label className="mt-4 inline-block px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-sm cursor-pointer transition">
            Browse Files
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => handleParseCsv(sampleCsvContent)}
            className="ml-3 mt-4 inline-block px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            Load Sample Swiss Roster
          </button>
        </div>
      </div>

      {/* Validation & Preview Queue */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Data Preview ({parsedRows.length} rows parsed)
              </h3>
              <p className="text-xs text-slate-400">Review mapped fields before committing to database</p>
            </div>

            <button
              onClick={handleExecuteImport}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5 active:scale-95"
            >
              <FileCheck className="w-4 h-4" />
              <span>Import Valid Records Now</span>
            </button>
          </div>

          {/* Validation Warnings */}
          {validationErrors.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Validation Warnings ({validationErrors.length}):</span>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-0.5 pt-1">
                {validationErrors.map((err, idx) => (
                  <p key={idx} className="text-amber-800 text-[11px]">• {err}</p>
                ))}
              </div>
            </div>
          )}

          {/* Rows table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Date of Birth</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {parsedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {row.firstName} {row.lastName}
                    </td>
                    <td className="py-2.5 px-3 font-mono-num">{row.dateOfBirth}</td>
                    <td className="py-2.5 px-3">{row.email}</td>
                    <td className="py-2.5 px-3">{row.phone}</td>
                    <td className="py-2.5 px-3">{row.city}</td>
                    <td className="py-2.5 px-3">{row.pricingCategory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Completion Summary */}
      {importSummary && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-sm">Migration Successful</h4>
            <p className="mt-1">
              Successfully imported <strong>{importSummary.added}</strong> dancers. 
              {importSummary.skipped > 0 && ` ${importSummary.skipped} duplicate or invalid rows were safely bypassed.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
