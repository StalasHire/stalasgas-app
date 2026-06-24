// app.js - Stala'sGas Order Form

document.addEventListener('DOMContentLoaded', function() {
  const productSelect = document.getElementById('product');
  const quantityInput = document.getElementById('quantity');
  const totalPriceEl = document.getElementById('totalPrice');

  function updateTotal() {
    if (!productSelect) return;
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    if (!selectedOption || !selectedOption.dataset.price) {
      totalPriceEl.textContent = 'Total: R0';
      return;
    }
    const price = parseFloat(selectedOption.dataset.price) || 0;
    const quantity = parseInt(quantityInput.value) || 1;
    const total = price * quantity;
    totalPriceEl.textContent = `Total: R${total}`;
  }

  productSelect.addEventListener('change', updateTotal);
  quantityInput.addEventListener('input', updateTotal);
  setTimeout(updateTotal, 100);
});

// Supabase Client
const supabase = Supabase.createClient(
  'https://prgyyylrwxkzelydtaaw.supabase.co',
  'sb_publishable_DsBKId5DVPYVOsKMLuOfAQ_Rqb1jwTY'
);

// Submit Order
async function submitOrder() {
  const messageDiv = document.getElementById('message');
  if (messageDiv) messageDiv.innerHTML = '';

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const area = document.getElementById('area').value.trim();
  
  const productSelectEl = document.getElementById('product');
  const productOption = productSelectEl.options[productSelectEl.selectedIndex];
  const productText = productOption ? productOption.textContent : '';
  
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const payment = document.getElementById('payment').value;
  const submitMethod = document.getElementById('submitMethod').value;

  if (!name || !phone || !address || !area || !productSelectEl.value || !payment || !submitMethod) {
    if (messageDiv) messageDiv.innerHTML = '<p style="color: red;">Please fill in all fields.</p>';
    return;
  }

  const selectedPrice = parseFloat(productOption.dataset.price) || 0;
  const total = selectedPrice * quantity;

  // Save to Supabase
  try {
    await supabase.from('orders').insert([{
      customer_name: name,
      phone: phone,
      address: address,
      area: area,
      product: productText,
      quantity: quantity,
      payment_method: payment,
      total_amount: total,
      order_date: new Date().toISOString()
    }]);
  } catch (err) {
    console.log('Supabase save skipped:', err.message);
  }

  // Build order message with clear EFT section
  let orderDetails = `*New Stala'sGas Order*\n\n` +
    `👤 Name: ${name}\n` +
    `📞 Phone: ${phone}\n` +
    `📍 Address: ${address}\n` +
    `🏠 Area: ${area}\n\n` +
    `🛒 Product: ${productText}\n` +
    `🔢 Quantity: ${quantity}\n` +
    `💰 Total: R${total}\n` +
    `💳 Payment Method: ${payment}\n\n`;

  // === BANKING DETAILS FOR EFT ===
  if (payment === 'EFT') {
    orderDetails += `🔴 *EFT PAYMENT REQUIRED*\n` +
      `🏦 Stala'sGas\n` +
      `FNB Cheque Account\n` +
      `Account Number: 62732719797\n\n` +
      `📲 Please send proof of payment to 072 574 4458 after transferring.\n` +
      `Thank you for choosing Stala'sGas! 🔥\n\n`;
  }

  if (messageDiv) {
    messageDiv.innerHTML = '<p style="color: green;">✅ Order submitted successfully!</p>';
  }

  // Send via chosen method
  if (submitMethod === 'whatsapp') {
    const whatsappNumber = '27725744458';
    const whatsappUrl = `https://wa.me/\( {whatsappNumber}?text= \){encodeURIComponent(orderDetails)}`;
    window.open(whatsappUrl, '_blank');
  } else {
    alert('📧 Order ready for Email:\n\n' + orderDetails);
  }

  setTimeout(() => { 
    if (messageDiv) messageDiv.innerHTML = ''; 
  }, 6000);
}
