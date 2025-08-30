import jsPDF from "jspdf";

export function generateQuotePDF(quote: any, fields: { label: string; value: any, rawValue?: string, fieldId?: string }[]) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setFillColor(255,255,255);
  doc.rect(0, 0, 210, 297, 'F');

  let y = 22;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(110, 53, 200);
  doc.text('Orçamento de Tatuagem', 105, y, { align: 'center' });
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(120, 120, 120);
  doc.text(`Data de emissão: ${new Date().toLocaleDateString('pt-BR')}`, 18, y);
  y += 6;
  doc.setDrawColor(220,220,220);
  doc.line(18, y, 192, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  let totalValue = '';
  fields.forEach((f: {label: string, value: any, rawValue?: string, fieldId?: string}) => {
    if (f.label === 'Valor') {
      totalValue = String(f.value);
      return;
    }
    if (f.value && f.value !== 'undefined' && f.value !== '') {
      if (f.rawValue && f.fieldId) {
        doc.setTextColor(30,30,30);
        doc.text(`${f.label}:`, 18, y);
        doc.setTextColor(80,80,80);
        doc.text(String(f.rawValue), 70, y);
        y += 7;
        return;
      }
      doc.setTextColor(30,30,30);
      doc.text(`${f.label}:`, 18, y);
      doc.setTextColor(80,80,80);
      doc.text(String(f.value), 70, y);
      y += 7;
    }
    if (y > 270) { doc.addPage(); y = 22; }
  });

  y += 8;
  doc.setDrawColor(220,220,220);
  doc.line(18, y, 192, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(30,30,30);
  doc.text('Total:', 18, y);
  doc.text(totalValue, 70, y);
  y += 10;

  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 18;
  doc.setDrawColor(230,230,230);
  doc.line(18, footerY - 4, 192, footerY - 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(140,140,140);
  doc.text('Este orçamento é válido por 30 dias. Para dúvidas, entre em contato com o estúdio.', 105, footerY, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(110, 53, 200);
  doc.text('Tattua', 105, footerY + 6, { align: 'center' });

  const clientName = (quote.client || quote.client_name || 'cliente').replace(/[^a-zA-Z0-9]/g, '_');
  let dateStr = '';
  if (quote.createdAt) {
    const d = new Date(quote.createdAt);
    dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  } else {
    const d = new Date();
    dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  doc.save(`orcamento-${clientName}-${dateStr}.pdf`);
}
