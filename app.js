/* app.js - Stala'sGas Order Form (Bulletproof Version) */

// Global state container to ensure fresh runs
let supabaseClient = null;

// Initialize function with instant fallback protection
function initSupabase() {
  if (window.supabase) {
    try {
      supabaseClient = window.supabase.createClient(
        'https://prgyyylrwxkzelydtaaw.supabase.co',
        'sb_publishable_DsBKId5DVPYVOsKMLuOfAQ_Rqb1jwTY'
      );
      console.log("Supabase initialized successfully.");
    } catch (e) {
      console.error("Supabase configuration failed:", e);
    }
  } else {
    console.warn("Supabase CDN not detected yet. Retrying shortly...");
  }
}

// Run immediately and again on load just in case
initSupabase();

document.addEventListener('DOMContentLoaded', function () {
  const productSelect = document.getElementById('product');
  const quantityInput = document.getElementById('quantity');
  const totalPriceEl = document.getElementById('totalPrice');

  // Force initialize if CDN arrived late
  if (!supabaseClient) initSupabase();

  function updateTotal() {
    if (!productSelect || !totalPriceEl) return;
    
    const selectedOption = productSelect.options[productSelect.selectedIndex];

    // Reset layout if default or empty
    if (!selectedOption || !productSelect.value || productSelect.value === "") {
      totalPriceEl.textContent = 'Total: R0';
      return;
    }

    // High-performance strategy: read data attribute, fallback directly to text parsing
    let price = parseFloat(selectedOption.getAttribute('data-price'));
    
    if (isNaN(price) || !price) {
      const text = selectedOption.textContent || "";
      const match = text.match(/R(\d+)/);
      price = match ? parseFloat(match[1]) : 0;
    }

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
      submitMethod: document.getElementById('submitMethod')?.value || 'whatsapp'
    };
    localStorage.setItem('stalasgas_order_v2', JSON.stringify(formData));
  }

  function restoreFormData() {
    // Upgraded storage key to instantly break old corrupt cache versions
    const saved = JSON.parse(localStorage.getItem('stalasgas_order_v2'));
    if (!saved) return;

    if (document.getElementById('name')) document.getElementById('name').value = saved.name || '';
    if (document.getElementById('phone')) document.getElementById('phone').value = saved.phone || '';
    if (document.getElementById('address')) document.getElementById('address').value = saved.address || '';
    if (document.getElementById('area')) document.getElementById('area').value = saved.area || '';
    if (document.getElementById('product')) document.getElementById('product').value = saved.product || '';
    if (document.getElementById('quantity')) document.getElementById('quantity').value = saved.quantity || 1;
    if (document.getElementById('payment')) document.getElementById('payment').value = saved.payment || '';
    if (document.getElementById('submitMethod')) document.getElementById('submitMethod').value = saved.submitMethod || 'whatsapp';

    setTimeout(updateTotal, 100);
  }

  // Restore cache data safely
  restoreFormData();

  // Attach dynamic event listeners
  if (productSelect) productSelect.addEventListener('change', () => { updateTotal(); saveFormData(); });
  if (quantityInput) quantityInput.addEventListener('input', () => { updateTotal(); saveFormData(); });

  document.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('change', saveFormData);
  });

  // Explicitly calculate layout values on load execution 
  updateTotal();
});

// Explicitly bind submitOrder directly to the global window object to bypass layout compilation limits
window.submitOrder = async function(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const messageDiv = document.getElementById('message');
  if (!messageDiv) return;
  messageDiv.innerHTML = '<p style="color:orange; font-weight:bold; text-align:center;">Processing order details...</p>';

  try {
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

    if (!name || !phone || !address || !area || !productSelectEl.value || !payment) {
      messageDiv.innerHTML = '<p style="color:red; font-weight:bold;">⚠️ Missing information. Please fill out all options.</p>';
      return;
    }

    let selectedPrice = parseFloat(productOption.getAttribute('data-price'));
    if (isNaN(selectedPrice) || !selectedPrice) {
      const match = productText.match(/R(\d+)/);
      selectedPrice = match ? parseFloat(match[1]) : 0;
    }
    const total = selectedPrice * quantity;

    // 1. Supabase Log Output Action
    let dbLogged = false;
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient
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
        
        if (!error) dbLogged = true;
        else console.error("Database validation rejected row:", error);
      } catch (dbErr) {
        console.error("Database offline fallback initiated:", dbErr);
      }
    }

    // 2. Build Messaging Strings
    let orderDetails = `New Stala'sGas Order\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n📍 Address: ${address}\n🏠 Area: ${area}\n\n🛒 Product: ${productText}\n🔢 Quantity: ${quantity}\n💰 Total: R${total}\n💳 Payment: ${payment}\n\n`;

    let bankingDetailsText = '';
    if (payment.toUpperCase().includes('EFT')) {
      bankingDetailsText = `🏦 BANKING DETAILS\nAccount Name: Stala'sGas\nBank: FNB\nAccount Type: Cheque\nAccount Number: 62732719797\nBranch Code: 250655\n\nPlease message or email your proof of payment to: 072 574 4458`;
      orderDetails += bankingDetailsText;
    }

    // Update screen markup display
    messageDiv.innerHTML = `
      <p style="color:green; font-weight:bold; font-size:1.1em;">✅ Order compiled successfully!</p>
      ${payment.toUpperCase().includes('EFT') ? `<div style="background:#f9f9f9; padding:12px; border-radius:4px; margin:10px 0; border-left:4px solid #007bff; text-align:left; font-family:sans-serif; font-size:0.95em; line-height:1.4; color:#333;">${bankingDetailsText.replace(/\n/g, '<br>')}</div>` : ''}
      <p style="color:#666; font-size:0.9em;">Launching connection application window...</p>
    `;

    // 3. Launch external messenger protocols
    setTimeout(() => {
      if (submitMethod === 'email') {
        const emailSubject = encodeURIComponent("New Stala'sGas Order");
        const emailBody = encodeURIComponent(orderDetails);
        window.location.href = `mailto:info@stala.co.za?subject=${emailSubject}&body=${emailBody}`;
      } else {
        const whatsappNumber = '27725744458';
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderDetails)}`;
        window.open(whatsappUrl, '_blank');
      }
    }, 1200);

  } catch (err) {
    console.error("Critical submission failure loop tracker:", err);
    messageDiv.innerHTML = '<p style="color:red; font-weight:bold;">⚠️ App script error. Please refresh and try again.</p>';
  }
};
