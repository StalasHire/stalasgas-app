// Price calculation and form handling for Stala'sGas

document.addEventListener('DOMContentLoaded', function() {
  const productSelect = document.getElementById('product');
  const quantityInput = document.getElementById('quantity');
  const totalPriceEl = document.getElementById('totalPrice');
  
  // Update total price when product or quantity changes
  function updateTotal() {
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    const price = parseFloat(selectedOption.getAttribute('data-price')) || 0;
    const quantity = parseInt(quantityInput.value) || 1;
    const total = price * quantity;
    totalPriceEl.textContent = `Total: R${total}`;
  }
  
  productSelect.addEventListener('change', updateTotal);
  quantityInput.addEventListener('input', updateTotal);
  
  // Initial total
  updateTotal();
});

// Submit order function
function submitOrder() {
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const area = document.getElementById('area').value.trim();
  const productSelect = document.getElementById('product');
  const productOption = productSelect.options[productSelect.selectedIndex];
  const productText = productOption.textContent;
  const quantity = document.getElementById('quantity').value;
  const payment = document.getElementById('payment').value;
  const submitMethod = document.getElementById('submitMethod').value;
  
  const messageDiv = document.getElementById('message');
  
  // Basic validation
  if (!name || !phone || !address || !area || !productSelect.value || !payment || !submitMethod) {
    messageDiv.innerHTML = '<p class="error">Please fill in all fields.</p>';
    return;
  }
  
  const selectedPrice = parseFloat(productOption.getAttribute('data-price')) || 0;
  const total = selectedPrice * parseInt(quantity);
  
  const orderDetails = `
*New Order from Stala'sGas*

👤 *Customer:* ${name}
📞 *Phone:* ${phone}
📍 *Address:* ${address}
🏠 *Area:* ${area}

🛒 *Product:* ${productText}
🔢 *Quantity:* ${quantity}
💰 *Total:* R${total}
💳 *Payment:* ${payment}
  `.trim();
  
  messageDiv.innerHTML = '<p class="success">Order prepared successfully!</p>';
  
  if (submitMethod === 'whatsapp') {
    // WhatsApp deep link
    const whatsappNumber = '27725744458'; // Replace with actual business number
    const encodedMessage = encodeURIComponent(orderDetails);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  } else if (submitMethod === 'email') {
    // For demo - alert user
    alert('Email submission simulated.\n\n' + orderDetails);
    // In production, you could use mailto: or integrate with EmailJS / backend
  }
}

// Optional: Supabase integration example (uncomment and configure if needed)
/*
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = Supabase.createClient(supabaseUrl, supabaseKey);

// To save order:
async function saveToSupabase(orderData) {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData]);
  if (error) console.error(error);
}
*/
