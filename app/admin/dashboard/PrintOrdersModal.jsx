'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PrintOrdersModal({ orders, onClose }) {
  const [filters, setFilters] = useState({
    dateFilter: 'all', // 'all', 'today', 'yesterday', 'custom'
    customStartDate: '',
    customEndDate: '',
    orderStatus: 'all', // 'all', 'processing', 'shipped', 'delivered', 'cancelled'
    paymentStatus: 'all', // 'all', 'paid', 'pending'
  });

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const getFilteredOrders = () => {
    let filtered = [...orders];

    // Date filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (filters.dateFilter === 'today') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });
    } else if (filters.dateFilter === 'yesterday') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === yesterday.getTime();
      });
    } else if (filters.dateFilter === 'custom' && filters.customStartDate && filters.customEndDate) {
      const startDate = new Date(filters.customStartDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(filters.customEndDate);
      endDate.setHours(23, 59, 59, 999);

      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // Order status filtering
    if (filters.orderStatus !== 'all') {
      filtered = filtered.filter(order => 
        (order.order_status || 'processing') === filters.orderStatus
      );
    }

    // Payment status filtering
    if (filters.paymentStatus !== 'all') {
      filtered = filtered.filter(order => 
        (order.payment_status || 'pending') === filters.paymentStatus
      );
    }

    return filtered;
  };

  const generatePDF = () => {
    const filteredOrders = getFilteredOrders();
    
    if (filteredOrders.length === 0) {
      alert('No orders match the selected filters');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header Section
    // Main Heading - Looms and Petals
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Looms and Petals', pageWidth / 2, 20, { align: 'center' });
    
    // Subheading - Orders List
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Orders List', pageWidth / 2, 28, { align: 'center' });
    
    // Horizontal line under header
    doc.setLineWidth(0.5);
    doc.line(14, 32, pageWidth - 14, 32);
    
    // Generated Date and Time (Right aligned)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const generatedText = `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    doc.text(generatedText, pageWidth - 14, 40, { align: 'right' });
    
    // Number of Orders (Left aligned)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Orders: ${filteredOrders.length}`, 14, 40);
    
    // Show active filters if any
    let yPos = 48;
    const filterTexts = [];
    if (filters.dateFilter === 'today') filterTexts.push('Today');
    else if (filters.dateFilter === 'yesterday') filterTexts.push('Yesterday');
    else if (filters.dateFilter === 'custom' && filters.customStartDate && filters.customEndDate) {
      filterTexts.push(`${filters.customStartDate} to ${filters.customEndDate}`);
    }
    
    if (filters.orderStatus !== 'all') filterTexts.push(`Status: ${filters.orderStatus}`);
    if (filters.paymentStatus !== 'all') filterTexts.push(`Payment: ${filters.paymentStatus}`);
    
    if (filterTexts.length > 0) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(`Filters Applied: ${filterTexts.join(' | ')}`, 14, yPos);
      yPos += 8;
      doc.setTextColor(0, 0, 0);
    } else {
      yPos += 4;
    }

    // Prepare table data
    const tableData = filteredOrders.map(order => {
      const orderItems = Array.isArray(order.items) ? order.items : 
                        (typeof order.items === 'string' ? JSON.parse(order.items) : []);
      
      const products = orderItems.map(item => item.name || item.product_name || 'Unknown').join(', ');
      const productIds = orderItems.map(item => item.id || item.product_id || 'N/A').join(', ');
      const quantities = orderItems.map(item => item.quantity || 1).join(', ');
      
      // Build full address
      const addressParts = [];
      if (order.shipping_address) addressParts.push(order.shipping_address);
      if (order.city) addressParts.push(order.city);
      if (order.state) addressParts.push(order.state);
      if (order.pincode) addressParts.push(order.pincode);
      const fullAddress = addressParts.join(', ') || 'N/A';
      
      return [
        `#${order.id}`,
        new Date(order.created_at).toLocaleDateString() + '\n' + new Date(order.created_at).toLocaleTimeString(),
        order.customer_name || 'N/A',
        products,
        productIds,
        quantities,
        fullAddress,
        order.payment_status || 'pending',
        order.order_status || 'processing',
        `₹${Number(order.total_amount).toLocaleString()}`
      ];
    });

    // Create table
    autoTable(doc, {
      startY: yPos,
      head: [['Order ID', 'Date & Time', 'Customer', 'Products', 'Product IDs', 'Units', 'Address', 'Payment', 'Status', 'Total']],
      body: tableData,
      styles: { 
        fontSize: 8, 
        cellPadding: 3,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 4
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 20, fontSize: 7 },
        2: { cellWidth: 16 },
        3: { cellWidth: 23 },
        4: { cellWidth: 14, fontSize: 7 },
        5: { cellWidth: 15, halign: 'center' },
        6: { cellWidth: 27, fontSize: 7 },
        7: { cellWidth: 14, halign: 'center', fontSize: 7 },
        8: { cellWidth: 14, halign: 'center', fontSize: 7 },
        9: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 },
      didDrawPage: function (data) {
        // Header on each page
        const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
        if (pageNumber > 1) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text('Looms and Petals - Orders List', pageWidth / 2, 10, { align: 'center' });
        }
        
        // Footer
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        
        // Page number
        doc.text(
          `Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        
        // Company name in footer
        doc.setFontSize(7);
        doc.text('Looms and Petals', 14, pageHeight - 10);
        
        doc.setTextColor(0, 0, 0);
      }
    });

    // Save the PDF
    const fileName = `Looms_Petals_Orders_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    alert(`PDF generated successfully! ${filteredOrders.length} orders included.`);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#333' }}>Print Orders</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#666',
              lineHeight: '1',
              padding: '0',
              width: '32px',
              height: '32px'
            }}
          >
            &times;
          </button>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Select filters to customize your orders report. Multiple filters can be combined.
          </p>

          {/* Date Filter */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
              Date & Time Filter
            </label>
            <select
              value={filters.dateFilter}
              onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="custom">Custom Date Range</option>
            </select>

            {filters.dateFilter === 'custom' && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    From
                  </label>
                  <input
                    type="date"
                    value={filters.customStartDate}
                    onChange={(e) => handleFilterChange('customStartDate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    To
                  </label>
                  <input
                    type="date"
                    value={filters.customEndDate}
                    onChange={(e) => handleFilterChange('customEndDate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Status Filter */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
              Order Status
            </label>
            <select
              value={filters.orderStatus}
              onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
              Payment Status
            </label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            >
              <option value="all">All Payment Status</option>
              <option value="paid">Success / Paid</option>
              <option value="pending">Pending / Declined</option>
            </select>
          </div>

          {/* Preview Count */}
          <div style={{
            background: '#f0f7ff',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            borderLeft: '4px solid #428bca'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
              <strong>{getFilteredOrders().length}</strong> orders match your filters
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              background: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: '#666'
            }}
          >
            Cancel
          </button>
          <button
            onClick={generatePDF}
            style={{
              padding: '10px 24px',
              borderRadius: '6px',
              border: 'none',
              background: '#428bca',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
}
