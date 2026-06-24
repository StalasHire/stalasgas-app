// Supabase Configuration - UPDATE THESE WITH YOUR OWN KEYS
const SUPABASE_URL = '"https://prgyyylrwxkzelydtaaw.supabase.co';
const SUPABASE_ANON_KEY = '"sb_publishable_DsBKId5DVPYVOsKMLuOfAQ_Rqb1jwTY";

co


const supabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);
// Real-time price calculation
document.getElementById('product').addEventListener('change', calculateTotal);
document.getElementById('quantity').addEventListener('input', calculateTotal);

function calculateTotal() {
  const productSelect = document.getElementById('product');
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const selectedOption = productSelect.options[productSelect.selectedIndex];
  const price = selectedOption ? parseFloat(selectedOption.dataset.price) || 0 : 0;
  
  const total = price * quantity;
  document.getElementById('totalPrice').textContent = `Total: R${total}`;
}

// Submit Order
async function submitOrder() {
  const messageDiv = document.getElementById('message');
  messageDiv.innerHTML = '';

  // Get form values
  const name = document.getElementById('name').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const area = document.getElementById('area').value.trim();
  const productSelect = document.getElementById('product');
  const product = productSelect.options[productSelect.selectedIndex].text;
  const payment = document.getElementById('payment').value;
  const quantity = document.getElementById('quantity').value;
  const submitMethod = document.getElementById('submitMethod').value;

  if (!name || !phone || !address || !area || !product || !payment) {
    messageDiv.innerHTML = '<span style="color:red;">Please fill all fields</span>';
    return;
  }

  const totalPrice = document.getElementById('totalPrice').textContent;

  const orderData = {
    customer_name: name,
    phone: phone,
    address: address,
    area: area,
    product: product,
    quantity: parseInt(quantity),
    payment_method: payment,
    total: totalPrice,
    order_date: new Date().toISOString()
  };

  // Save to Supabase
  try {
    const { error } = await supabase.from('orders').insert([orderData]);
    if (error) console.error('Supabase error:', error);
  } catch (e) {
    console.log('Supabase not configured yet - order saved locally only');
  }

  // WhatsApp or Email submission
  const orderText = `*New Order*\n\n` +
    `Name: ${name}\n` +
    `Phone: ${phone}\n` +
    `Address: ${address}\n` +
    `Area: ${area}\n` +
    `Product: ${product}\n` +
    `Quantity: ${quantity}\n` +
    `Payment: ${payment}\n` +
    `${totalPrice}`;

  if (submitMethod === 'whatsapp') {
    const whatsappNumber = '27725744458'; // ← CHANGE TO YOUR NUMBER
    const whatsappUrl = `https://wa.me/\( {whatsappNumber}?text= \){encodeURIComponent(orderText)}`;
    window.open(whatsappUrl, '_blank');
  } else {
    // Email simulation
    alert(`Order ready to send via Email:\n\n${orderText}`);
  }

  messageDiv.innerHTML = '<span style="color:green;">✅ Order submitted successfully!</span>';
  setTimeout(() => { messageDiv.innerHTML = ''; }, 5000);
}
