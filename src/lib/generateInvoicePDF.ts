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
  pending: 'در انتظار پرداخت',
  processing: 'در حال پردازش',
  completed: 'تکمیل شده',
  cancelled: 'لغو شده',
};

// Convert date to Persian format
const toPersianDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const generateInvoicePDF = (order: Order): void => {
  const invoiceHTML = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>فاکتور سفارش - ${order.id.substring(0, 8).toUpperCase()}</title>
  <style>
    @font-face {
      font-family: 'IRANYekan';
      src: url('/fonts/IRANYekanWebRegular.woff2') format('woff2');
      font-weight: normal;
    }
    @font-face {
      font-family: 'IRANYekan';
      src: url('/fonts/IRANYekanWebBold.woff2') format('woff2');
      font-weight: bold;
    }
    @font-face {
      font-family: 'IRANYekan';
      src: url('/fonts/IRANYekanWebLight.woff2') format('woff2');
      font-weight: 300;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'IRANYekan', 'Tahoma', sans-serif;
      background: #f8f9fa;
      padding: 20px;
      direction: rtl;
      line-height: 1.8;
    }
    
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .invoice-header {
      background: linear-gradient(135deg, #B3886D 0%, #9A7461 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .store-name {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 8px;
      letter-spacing: 2px;
    }
    
    .store-subtitle {
      font-size: 14px;
      opacity: 0.9;
      font-weight: 300;
    }
    
    .invoice-title {
      background: #2c3e50;
      color: white;
      text-align: center;
      padding: 15px;
      font-size: 20px;
      font-weight: bold;
    }
    
    .invoice-body {
      padding: 30px 40px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }
    
    .info-box {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      border-right: 4px solid #B3886D;
    }
    
    .info-box-title {
      font-size: 14px;
      color: #B3886D;
      font-weight: bold;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px dashed #e0e0e0;
    }
    
    .info-row:last-child {
      border-bottom: none;
    }
    
    .info-label {
      color: #666;
      font-size: 13px;
    }
    
    .info-value {
      color: #333;
      font-weight: bold;
      font-size: 13px;
    }
    
    .address-box {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
      border-right: 4px solid #27ae60;
    }
    
    .address-title {
      font-size: 14px;
      color: #27ae60;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .address-text {
      color: #333;
      font-size: 14px;
      line-height: 1.8;
    }
    
    .products-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    
    .products-table thead {
      background: linear-gradient(135deg, #B3886D 0%, #9A7461 100%);
      color: white;
    }
    
    .products-table th {
      padding: 15px 12px;
      text-align: right;
      font-size: 14px;
      font-weight: bold;
    }
    
    .products-table th:last-child,
    .products-table td:last-child {
      text-align: left;
    }
    
    .products-table td {
      padding: 15px 12px;
      border-bottom: 1px solid #eee;
      font-size: 13px;
    }
    
    .products-table tbody tr:nth-child(even) {
      background: #fafafa;
    }
    
    .products-table tbody tr:hover {
      background: #f5f5f5;
    }
    
    .product-name {
      font-weight: bold;
      color: #333;
    }
    
    .summary-section {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
      padding: 25px;
      margin-top: 20px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      font-size: 14px;
    }
    
    .summary-total {
      display: flex;
      justify-content: space-between;
      padding: 15px 0;
      margin-top: 10px;
      border-top: 2px solid #B3886D;
      font-size: 18px;
      font-weight: bold;
      color: #B3886D;
    }
    
    .invoice-footer {
      background: #2c3e50;
      color: white;
      text-align: center;
      padding: 25px;
    }
    
    .footer-text {
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    .footer-website {
      font-size: 16px;
      font-weight: bold;
      color: #B3886D;
    }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .status-pending {
      background: #fff3cd;
      color: #856404;
    }
    
    .status-processing {
      background: #cce5ff;
      color: #004085;
    }
    
    .status-completed {
      background: #d4edda;
      color: #155724;
    }
    
    .status-cancelled {
      background: #f8d7da;
      color: #721c24;
    }
    
    .print-button {
      position: fixed;
      bottom: 30px;
      left: 30px;
      background: linear-gradient(135deg, #B3886D 0%, #9A7461 100%);
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 50px;
      font-family: 'IRANYekan', 'Tahoma', sans-serif;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 5px 20px rgba(179, 136, 109, 0.4);
      transition: all 0.3s ease;
    }
    
    .print-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(179, 136, 109, 0.5);
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .invoice-container {
        box-shadow: none;
        border-radius: 0;
      }
      
      .print-button {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="invoice-header">
      <div class="store-name">فروشگاه انام</div>
      <div class="store-subtitle">سرامیک و سفال دست‌ساز</div>
    </div>
    
    <div class="invoice-title">
      فاکتور فروش
    </div>
    
    <div class="invoice-body">
      <div class="info-grid">
        <div class="info-box">
          <div class="info-box-title">
            📋 اطلاعات سفارش
          </div>
          <div class="info-row">
            <span class="info-label">شماره سفارش:</span>
            <span class="info-value">${order.id.substring(0, 8).toUpperCase()}</span>
          </div>
          <div class="info-row">
            <span class="info-label">تاریخ سفارش:</span>
            <span class="info-value">${toPersianDate(order.created_at)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">وضعیت:</span>
            <span class="info-value">
              <span class="status-badge status-${order.status}">
                ${statusLabels[order.status] || order.status}
              </span>
            </span>
          </div>
        </div>
        
        <div class="info-box">
          <div class="info-box-title">
            👤 اطلاعات مشتری
          </div>
          <div class="info-row">
            <span class="info-label">شماره تماس:</span>
            <span class="info-value">${order.profiles?.phone || '-'}</span>
          </div>
        </div>
      </div>
      
      <div class="address-box">
        <div class="address-title">📍 آدرس ارسال</div>
        <div class="address-text">${order.shipping_address}</div>
      </div>
      
      <table class="products-table">
        <thead>
          <tr>
            <th>ردیف</th>
            <th>نام محصول</th>
            <th>تعداد</th>
            <th>قیمت واحد</th>
            <th>قیمت کل</th>
          </tr>
        </thead>
        <tbody>
          ${order.order_items?.map((item, index) => `
            <tr>
              <td>${toPersianNumber((index + 1).toString())}</td>
              <td class="product-name">${item.product_name}</td>
              <td>${toPersianNumber(item.quantity.toString())}</td>
              <td>${formatPrice(item.price)}</td>
              <td>${formatPrice(item.quantity * item.price)}</td>
            </tr>
          `).join('') || ''}
        </tbody>
      </table>
      
      <div class="summary-section">
        <div class="summary-row">
          <span>تعداد کل اقلام:</span>
          <span>${toPersianNumber((order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0).toString())} عدد</span>
        </div>
        <div class="summary-total">
          <span>مبلغ کل:</span>
          <span>${formatPrice(order.total_amount)}</span>
        </div>
      </div>
    </div>
    
    <div class="invoice-footer">
      <div class="footer-text">با تشکر از خرید شما</div>
      <div class="footer-website">anamzoroof.ir</div>
    </div>
  </div>
  
  <button class="print-button" onclick="window.print()">
    🖨️ چاپ فاکتور
  </button>
</body>
</html>
  `;

  // Open invoice in new window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  }
};
