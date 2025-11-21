// Utility function to export data to CSV
export const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    // Create CSV header
    const csvHeader = headers.join(',') + '\n';

    // Create CSV rows
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma or newline
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        }).join(',');
    }).join('\n');

    // Combine header and rows
    const csvContent = csvHeader + csvRows;

    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};
