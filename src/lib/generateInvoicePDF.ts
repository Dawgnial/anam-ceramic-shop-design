import jsPDF from 'jspdf';
import { formatPrice, toPersianNumber } from './utils';

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
  product_image?: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  profiles?: {
    phone: string;
  };
  order_items?: OrderItem[];
}

const statusLabels: Record<string, string> = {
  pending: 'در انتظار',
  processing: 'در حال پردازش',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
};

// Convert Persian/Arabic numbers to English for PDF
const toEnglishNumber = (str: string): string => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(persianNumbers[i], 'g'), i.toString());
    result = result.replace(new RegExp(arabicNumbers[i], 'g'), i.toString());
  }
  return result;
};

// Reverse text for RTL display in PDF
const reverseText = (text: string): string => {
  return text.split('').reverse().join('');
};

export const generateInvoicePDF = (order: Order): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Set default font
  doc.setFont('helvetica');

  // Header background
  doc.setFillColor(179, 136, 109); // #B3886D
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Store name (English for PDF compatibility)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('ANAM Store', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('Ceramic & Pottery Shop', pageWidth / 2, 30, { align: 'center' });

  yPosition = 55;

  // Invoice title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;

  // Order info box
  doc.setDrawColor(179, 136, 109);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPosition, pageWidth - 2 * margin, 35, 3, 3, 'S');

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  
  // Order ID
  doc.text('Order ID:', margin + 5, yPosition + 10);
  doc.setTextColor(0, 0, 0);
  doc.text(order.id.substring(0, 8).toUpperCase(), margin + 30, yPosition + 10);

  // Date
  doc.setTextColor(100, 100, 100);
  doc.text('Date:', margin + 5, yPosition + 20);
  doc.setTextColor(0, 0, 0);
  const orderDate = new Date(order.created_at);
  doc.text(orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }), margin + 30, yPosition + 20);

  // Status
  doc.setTextColor(100, 100, 100);
  doc.text('Status:', margin + 5, yPosition + 30);
  doc.setTextColor(0, 0, 0);
  doc.text(order.status.charAt(0).toUpperCase() + order.status.slice(1), margin + 30, yPosition + 30);

  // Phone
  doc.setTextColor(100, 100, 100);
  doc.text('Phone:', pageWidth / 2, yPosition + 10);
  doc.setTextColor(0, 0, 0);
  doc.text(order.profiles?.phone || '-', pageWidth / 2 + 20, yPosition + 10);

  yPosition += 45;

  // Shipping Address
  doc.setFontSize(12);
  doc.setTextColor(179, 136, 109);
  doc.text('Shipping Address:', margin, yPosition);
  
  yPosition += 7;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Split address into lines if too long
  const addressLines = doc.splitTextToSize(order.shipping_address, pageWidth - 2 * margin);
  doc.text(addressLines, margin, yPosition);
  yPosition += addressLines.length * 5 + 10;

  // Products table header
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Product', margin + 5, yPosition + 7);
  doc.text('Qty', pageWidth - margin - 60, yPosition + 7);
  doc.text('Price', pageWidth - margin - 40, yPosition + 7);
  doc.text('Total', pageWidth - margin - 15, yPosition + 7, { align: 'right' });

  yPosition += 15;

  // Products list
  doc.setTextColor(0, 0, 0);
  order.order_items?.forEach((item, index) => {
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = margin;
    }

    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(252, 252, 252);
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 12, 'F');
    }

    // Product name (truncate if too long)
    const productName = item.product_name.length > 35 
      ? item.product_name.substring(0, 35) + '...' 
      : item.product_name;
    doc.text(productName, margin + 5, yPosition);
    
    // Quantity
    doc.text(item.quantity.toString(), pageWidth - margin - 60, yPosition);
    
    // Price
    doc.text(formatPriceSimple(item.price), pageWidth - margin - 40, yPosition);
    
    // Total
    doc.text(formatPriceSimple(item.quantity * item.price), pageWidth - margin - 15, yPosition, { align: 'right' });

    yPosition += 12;
  });

  // Separator line
  yPosition += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  
  yPosition += 15;

  // Total section
  doc.setFillColor(179, 136, 109);
  doc.roundedRect(pageWidth - margin - 70, yPosition - 5, 70, 20, 3, 3, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text('Total:', pageWidth - margin - 65, yPosition + 5);
  doc.setFontSize(12);
  doc.text(formatPriceSimple(order.total_amount) + ' T', pageWidth - margin - 5, yPosition + 5, { align: 'right' });

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('Thank you for your purchase!', pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.text('anamzoroof.ir', pageWidth / 2, pageHeight - 15, { align: 'center' });

  // Save the PDF
  const fileName = `invoice-${order.id.substring(0, 8)}-${orderDate.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Simple price formatter for PDF (English numbers with comma)
const formatPriceSimple = (price: number): string => {
  return price.toLocaleString('en-US');
};
