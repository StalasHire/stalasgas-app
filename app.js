/* app.js - Stala'sGas Order Form */

const supabase = Supabase.createClient(
  'https://prgyyylrwxkzelydtaaw.supabase.co',
  'sb_publishable_DsBKId5DVPYVOsKMLuOfAQ_Rqb1jwTY'
);

document.addEventListener('DOMContentLoaded', function () {
  const productSelect = document.getElementById('product');
  const quantityInput = document.getElementById('quantity');
  const totalPriceEl = document.getElementById('totalPrice');

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

  function saveFormData() {
    const formData = {
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      area: document.getElementById('area').value,
      product: document.getElementById('product').value,
      quantity: document.getElementById('quantity').value,
      payment: document.getElementById('payment').value,
      submitMethod: document.getElementById('submitMethod').value
    };

    localStorage.setItem('stalasgas_order', JSON.stringify(formData));
  }

  function restoreFormData() {
    const saved = JSON.parse(localStorage.getItem('stalasgas_order'));
    if (!saved) return;

    document.getElementById('name').value = saved.name || '';
    document.getElementById('phone').value = saved.phone || '';
    document.getElementById('address').value = saved.address || '';
    document.getElementById('area').value = saved.area || '';
    document.getElementById('product').value = saved.product || '';
    document.getElementById('quantity').value = saved.quantity || 1;
    document.getElementById('payment').value = saved.payment || '';
    document.getElementById('submitMethod').value = saved.submitMethod || '';

    updateTotal();
  }

  // Restore saved data on load
  restoreFormData();

  // Event listeners for real-time calculations and saving
  productSelect.addEventListener('change', () => {
    updateTotal();
    saveFormData();
  });

  quantityInput.addEventListener('input', () => {
    updateTotal();
    saveFormData();
  });

  document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', saveFormData);
  });

  updateTotal();
});

// Added 'event' parameter to stop page from reloading
async function submitOrder(event) {
  if (event) event.preventDefault(); // <-- CRITICAL: Prevents page reload

  const messageDiv = document.getElementById('message');
  messageDiv.innerHTML = '';

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
    messageDiv.innerHTML = '<p style="color:red;">Please fill in all fields.</p>';
    return;
  }

  const selectedPrice = parseFloat(productOption.dataset.price) || 0;
  const total = selectedPrice * quantity;

  try {
    const { error } = await supabase
      .from('orders')
      .insert([{
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

    if (error) console.error(error);
  } catch (err) {
    console.error(err);
  }

  let orderDetails = `New Stala'sGas Order\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n📍 Address: ${address}\n🏠 Area: ${area}\n\n🛒 Product: ${productText}\n🔢 Quantity: ${quantity}\n💰 Total: R${total}\n💳 Payment: ${payment}\n\n`;

  let bankingDetailsText = '';
  if (payment.toUpperCase() === 'EFT') {
    bankingDetailsText = `🏦 BANKING DETAILS\n\ Account Name: Stala'sGas\nBank: FNB\nAccount Type: Cheque\nAccount Number: 62732719797\n\nPlease send proof of payment to:\n0725744458`;
    orderDetails += bankingDetailsText;
  }

  // Display success message AND banking details on screen if EFT was selected
  messageDiv.innerHTML = `
    <p style="color:green; font-weight:bold;">✅ Order submitted successfully!</p>
    ${payment.toUpperCase() === 'EFT' ? `<div style="background:#f4f4f4; padding:15px; border-radius:5px; margin-top:10px; white-space:pre-line; border-left:4px solid #007bff;">${bankingDetailsText}</div>` : ''}
  `;

  // Route to WhatsApp or Email
  if (submitMethod === 'whatsapp') {
    const whatsappNumber = '27725744458';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderDetails)}`;
    window.open(whatsappUrl, '_blank');
  } else {
    const emailSubject = encodeURIComponent("New Stala'sGas Order");
    const emailBody = encodeURIComponent(orderDetails);
    const mailtoLink = `mailto:info@stala.co.za?subject=${emailSubject}&body=${emailBody}`;
    window.location.href = mailtoLink;
  }

  // Clear success message after 15 seconds so they have time to look at banking details
  setTimeout(() => {
    messageDiv.innerHTML = '';
  }, 15000);
}
