/* app.js - Stala'sGas Order Form */

// Initialize Supabase immediately
const supabase = window.supabase ? window.supabase.createClient(
  'https://prgyyylrwxkzelydtaaw.supabase.co',
  'sb_publishable_DsBKId5DVPYVOsKMLuOfAQ_Rqb1jwTY'
) : null;

document.addEventListener('DOMContentLoaded', function () {
  const productSelect = document.getElementById('product');
  const quantityInput = document.getElementById('quantity');
  const totalPriceEl = document.getElementById('totalPrice');

  function updateTotal() {
    if (!productSelect || !totalPriceEl) return;
    
    const selectedOption = productSelect.options[productSelect.selectedIndex];

    if (!selectedOption || !selectedOption.getAttribute('data-price')) {
      totalPriceEl.textContent = 'Total: R0';
      return;
    }

    const price = parseFloat(selectedOption.getAttribute('data-price')) || 0;
    const quantity = parseInt(quantityInput.value) || 1;
    const total = price * quantity;

    totalPriceEl.textContent = `Total: R${total}`;
  }

  function saveFormData() {
    const formData = {
      name: document.getElementById('name')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      address: document.getElementById('address')?.value || '',
      area: document.getElementById('area')?.value || '',
      product: document.getElementById('product')?.value || '',
      quantity: document.getElementById('quantity')?.value || '1',
      payment: document.getElementById('payment')?.value || '',
      submitMethod: document.getElementById('submitMethod')?.value || ''
    };

    localStorage.setItem('stalasgas_order', JSON.stringify(formData));
  }

  function restoreFormData() {
    const saved = JSON.parse(localStorage.getItem('stalasgas_order'));
    if (!saved) return;

    if (document.getElementById('name')) document.getElementById('name').value = saved.name || '';
    if (document.getElementById('phone')) document.getElementById('phone').value = saved.phone || '';
    if (document.getElementById('address')) document.getElementById('address').value = saved.address || '';
    if (document.getElementById('area')) document.getElementById('area').value = saved.area || '';
    if (document.getElementById('product')) document.getElementById('product').value = saved.product || '';
    if (document.getElementById('quantity')) document.getElementById('quantity').value = saved.quantity || 1;
    if (document.getElementById('payment')) document.getElementById('payment').value = saved.payment || '';
    if (document.getElementById('submitMethod')) document.getElementById('submitMethod').value = saved.submitMethod || '';

    // Wait slightly for the DOM options tree to bind values before calculating
    setTimeout(updateTotal, 50);
  }

  // Restore saved data on load
  restoreFormData();

  // Event listeners for real-time calculations and saving
  if (productSelect) {
    productSelect.addEventListener('change', () => {
      updateTotal();
      saveFormData();
    });
  }

  if (quantityInput) {
    quantityInput.addEventListener('input', () => {
      updateTotal();
      saveFormData();
    });
  }

  document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', saveFormData);
  });

  // Attach event listener straight to form submission if a form selector exists
  const orderForm = document.querySelector('form');
  if (orderForm) {
    orderForm.addEventListener('submit', submitOrder);
  }
});

// Primary Async Order Submission System
async function submitOrder(event) {
  if (event) event.preventDefault(); // Stop page from refreshing instantly

  const messageDiv = document.getElementById('message');
  if (!messageDiv) return;
  messageDiv.innerHTML = '<p style="color:orange; font-weight:bold;">Processing order, please wait...</p>';

  // Capture current values
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const area = document.getElementById('area').value.trim();
  const productSelectEl = document.getElementById('product');
  const productOption = productSelectEl ? productSelectEl.options[productSelectEl.selectedIndex] : null;
  const productText = productOption ? productOption.textContent.trim() : '';
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const payment = document.getElementById('payment').value.trim();
  const submitMethod = document.getElementById('submitMethod').value.trim();

  // Field validation
  if (!name || !phone || !address || !area || !productSelectEl.value || !payment || !submitMethod) {
    messageDiv.innerHTML = '<p style="color:red; font-weight:bold;">⚠️ Please fill in all required fields.</p>';
    return;
  }

  const selectedPrice = parseFloat(productOption.getAttribute('data-price')) || 0;
  const total = selectedPrice * quantity;

  // 1. Database Submission (Supabase)
  let databaseSuccess = true;
  if (supabase) {
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

      if (error) {
        console.error('Supabase Error:', error);
        databaseSuccess = false;
      }
    } catch (err) {
      console.error('Connection Exception:', err);
      databaseSuccess = false;
    }
  } else {
    console.error('Supabase client was not initialized properly.');
    databaseSuccess = false;
  }

  // 2. Build Messaging Strings
  let orderDetails = `New Stala'sGas Order\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n📍 Address: ${address}\n🏠 Area: ${area}\n\n🛒 Product: ${productText}\n🔢 Quantity: ${quantity}\n💰 Total: R${total}\n💳 Payment: ${payment}\n\n`;

  let bankingDetailsText = '';
  // Force clean casing checks to capture 'eft', 'EFT', or 'Eft'
  if (payment.toUpperCase().includes('EFT')) {
    bankingDetailsText = `🏦 BANKING DETAILS\nAccount Name: Stala'sGas\nBank: FNB\nAccount Type: Cheque\nAccount Number: 62732719797\nBranch Code: 250655\n\nPlease email or WhatsApp your proof of payment to: 072 574 4458`;
    orderDetails += bankingDetailsText;
  }

  // 3. UI Display Output
  if (databaseSuccess) {
    messageDiv.innerHTML = `
      <p style="color:green; font-weight:bold; font-size: 1.1em;">✅ Order recorded successfully!</p>
      ${payment.toUpperCase().includes('EFT') ? `<div style="background:#f4f4f4; padding:15px; border-radius:5px; margin-top:10px; white-space:pre-line; border-left:4px solid #007bff; color:#333; text-align:left;">${bankingDetailsText.replace(/\n/g, '<br>')}</div>` : ''}
      <p style="color:#555; font-size:0.9em; margin-top:5px;">Redirecting you to complete message dispatch...</p>
    `;
  } else {
    // Show a warning but still allow communication dispatch fallback
    messageDiv.innerHTML = `
      <p style="color:#d9534f; font-weight:bold;">⚠️ Order info processed with logging latency, proceeding to messaging window...</p>
      ${payment.toUpperCase().includes('EFT') ? `<div style="background:#f4f4f4; padding:15px; border-radius:5px; margin-top:10px; white-space:pre-line; border-left:4px solid #007bff; color:#333; text-align:left;">${bankingDetailsText.replace(/\n/g, '<br>')}</div>` : ''}
    `;
  }

  // 4. Dispatch Routings (WhatsApp / Email)
  setTimeout(() => {
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
  }, 1200); // 1.2 second brief delay to allow local state rendering visibility
}
