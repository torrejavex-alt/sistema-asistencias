import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PDFExportOptions {
    title: string;
    headers: string[];
    data: any[][];
    filename: string;
}

export const exportToPDF = ({ title, headers, data, filename }: PDFExportOptions) => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.setTextColor(45, 55, 72); // slate-800
    doc.text(title, 14, 20);

    // Add date
    doc.setFontSize(10);
    doc.setTextColor(113, 128, 150); // slate-500
    const date = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.text(`Generado: ${date}`, 14, 28);

    // Add table
    autoTable(doc, {
        head: [headers],
        body: data,
        startY: 35,
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 4,
            lineColor: [203, 213, 225], // slate-300
            lineWidth: 0.5,
        },
        headStyles: {
            fillColor: [241, 245, 249], // slate-100
            textColor: [71, 85, 105], // slate-600
            fontStyle: 'bold',
            halign: 'left',
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252], // slate-50
        },
        margin: { top: 35, left: 14, right: 14 },
    });

    // Save the PDF
    doc.save(`${filename}.pdf`);
};

export const exportDashboardToPDF = (users: any[]) => {
    const headers = ['Usuario', 'Instrumento', 'Estado'];
    const data = users.map(user => [
        user.nombre,
        user.instrumento || '-',
        user.estado || 'Sin registrar'
    ]);

    exportToPDF({
        title: 'Dashboard - Lista de Usuarios',
        headers,
        data,
        filename: `dashboard-${new Date().toISOString().split('T')[0]}`
    });
};

export const exportAnaliticasToPDF = (stats: any[]) => {
    const headers = ['Usuario', 'Instrumento', 'Total', 'Asistió', 'Faltas', 'Permisos', '% Asistencia'];
    const data = stats.map(stat => [
        stat.nombre,
        stat.instrumento || '-',
        stat.totalEvents.toString(),
        stat.attended.toString(),
        stat.absent.toString(),
        stat.withPermission.toString(),
        `${stat.attendancePercentage.toFixed(1)}%`
    ]);

    exportToPDF({
        title: 'Analíticas de Asistencia',
        headers,
        data,
        filename: `analiticas-${new Date().toISOString().split('T')[0]}`
    });
};

export const exportReporteToPDF = (registros: any[], fechas: string[]) => {
    // For the attendance report, we'll create a simplified version
    // since the full matrix might be too wide for PDF
    const headers = ['Usuario', 'Total Asistencias', 'Total Faltas', 'Total Permisos'];

    const data = registros.map(registro => {
        let asistencias = 0;
        let faltas = 0;
        let permisos = 0;

        fechas.forEach(fecha => {
            const estado = registro[fecha];
            if (estado === 'Asistió') asistencias++;
            else if (estado === 'No asistió') faltas++;
            else if (estado === 'Con permiso') permisos++;
        });

        return [
            registro.nombre,
            asistencias.toString(),
            faltas.toString(),
            permisos.toString()
        ];
    });

    exportToPDF({
        title: 'Reporte de Asistencias - Resumen',
        headers,
        data,
        filename: `reporte-asistencias-${new Date().toISOString().split('T')[0]}`
    });
};
