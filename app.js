// app.js - Stala'sGas Order Form

document.addEventListener('DOMContentLoaded', function() {
  const productSelect = document.getElementById('product');
  const quantityInput = document.getElementById('quantity');
  const totalPriceEl = document.getElementById('totalPrice');

  // Update total price
  function updateTotal() {
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

  // Event listeners
  productSelect.addEventListener('change', updateTotal);
  quantityInput.addEventListener('input', updateTotal);

  // Initial calculation
  updateTotal();
});

// Supabase Client (Global)
const supabase = Supabase.createClient(
  'https://prgyyylrwxkzelydtaaw.supabase.co',
  'sb_publishable_DsBKId5DVPYVOsKMLuOfAQ_Rqb1jwTY'
);

// Submit Order Function
async function submitOrder() {
  const messageDiv = document.getElementById('message');
  messageDiv.innerHTML = '';

  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const area = document.getElementById('area').value.trim();
  const productSelect = document.getElementById('product');
  const productOption = productSelect.options[productSelect.selectedIndex];
  const productText = productOption ? productOption.textContent : '';
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const payment = document.getElementById('payment').value;
  const submitMethod = document.getElementById('submitMethod').value;

  // Validation
  if (!name || !phone || !address || !area || !productSelect.value || !payment || !submitMethod) {
    messageDiv.innerHTML = '<p style="color: red;">Please fill in all fields.</p>';
    return;
  }

  const selectedPrice = parseFloat(productOption.dataset.price) || 0;
  const total = selectedPrice * quantity;

  const orderData = {
    customer_name: name,
    phone: phone,
    address: address,
    area: area,
    product: productText,
    quantity: quantity,
    payment_method: payment,
    total_amount: total,
    order_date: new Date().toISOString()
  };

  // Save to Supabase
  try {
    const { error } = await supabase.from('orders').insert([orderData]);
    if (error) console.error('Supabase error:', error);
  } catch (err) {
    console.log('Supabase save skipped (table may not exist yet):', err);
  }

  // Build order message
  let orderDetails = `*New Stala'sGas Order*\n\n` +
    `👤 Name: ${name}\n` +
    `📞 Phone: ${phone}\n` +
    `📍 Address: ${address}\n` +
    `🏠 Area: ${area}\n\n` +
    `🛒 Product: ${productText}\n` +
    `🔢 Quantity: ${quantity}\n` +
    `💰 Total: R${total}\n` +
    `💳 Payment: ${payment}\n\n`;

  if (payment === 'EFT') {
    orderDetails += `🏦 *Banking Details:*\n` +
      `Stala'sGas\n` +
      `FNB Cheque Account\n` +
      `Acc No: 62732719797\n\n` +
      `Please send proof of payment to 072 574 4458.\n`;
  }

  messageDiv.innerHTML = '<p style="color: green;">✅ Order submitted successfully!</p>';

  // Send via WhatsApp or Email
  if (submitMethod === 'whatsapp') {
    const whatsappNumber = '27725744458';
    const encodedMessage = encodeURIComponent(orderDetails);
    const whatsappUrl = `https://wa.me/\( {whatsappNumber}?text= \){encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  } else {
    alert('Email submission ready:\n\n' + orderDetails);
  }

  setTimeout(() => { messageDiv.innerHTML = ''; }, 6000);
}
