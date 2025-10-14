const generateReceiptHTML = (student, payment) => {
  const totalFee = student.totalFeeAmount || 0;
  const totalPaid = student.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = totalFee - totalPaid;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Fee Receipt</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 30px; color: #333; }
      header { text-align: center; margin-bottom: 20px; }
      header h1 { margin: 0; font-size: 24px; color: #2c3e50; }
      header h2 { margin: 0; font-size: 18px; color: #34495e; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
      th { background-color: #f2f2f2; }
      .section-title { font-size: 16px; margin-top: 20px; text-decoration: underline; }
      .terms { font-size: 12px; margin-top: 20px; }
      .center { text-align: center; }
      .highlight { color: #e74c3c; font-weight: bold; }
    </style>
  </head>
  <body>
    <header>
      <h1>Sri Pratibha U.P School</h1>
      <h2>Fee Receipt</h2>
    </header>

    <div class="section-title">Student Information</div>
    <table>
      <tr><th>Name</th><td>${student.name}</td></tr>
      <tr><th>Admission Number</th><td>${student.admissionNumber}</td></tr>
      <tr><th>Class</th><td>${student.class}</td></tr>
    </table>

    <div class="section-title">Payment Details</div>
    <table>
      <tr><th>Total Fee Amount</th><td>₹${totalFee}</td></tr>
      <tr><th>Amount Paid</th><td>₹${payment.amount}</td></tr>
      <tr><th>Remaining Balance</th><td>₹${remaining >= 0 ? remaining : 0}</td></tr>
      <tr><th>Payment Mode</th><td>${payment.mode}</td></tr>
      <tr><th>Payment Date</th><td>${payment.date ? new Date(payment.date).toLocaleDateString() : '-'}</td></tr>
      <tr><th>Receipt Number</th><td>${payment.receiptNumber}</td></tr>
      <tr><th>Due Date</th><td>${student.feeDueDate ? new Date(student.feeDueDate).toLocaleDateString() : '-'}</td></tr>
    </table>

    <div class="section-title">Important Terms</div>
    <ul class="terms">
      <li>Please retain this receipt for future reference.</li>
      <li>Fees once paid are non-refundable.</li>
      <li>Payment is subject to verification by school administration.</li>
      <li>Ensure all dues are cleared before final examinations.</li>
      <li>Late payments may incur penalties as per school policy.</li>
    </ul>

    <p class="center highlight">Thank you for your payment!</p>
  </body>
  </html>
  `;
};

module.exports = generateReceiptHTML;