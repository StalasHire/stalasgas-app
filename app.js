// 1. Initialization (Fixed 'Const' typo)
const SUPABASE_URL = 'https://prgyyylrwxkzelydtaaw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DsBKId5DVPYVOsKMLuOfAQ_Rqb1jwTY';
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Unified Price List (Moved to the top scope)
const prices = {
  exchange_5kg: 250,
  exchange_7kg: 325,
  exchange_9kg: 380,
  exchange_14kg: 580,
  exchange_19kg: 750,
  exchange_48kg: 1600,

  cylinder_9kg: 650,
  cylinder_48kg: 1200,

  combo_9kg: 1030, 
  combo_48kg: 2800 
};

// 3. Live Price Calculator (Moved outside submitOrder so it works immediately)
function updateTotalPrice() {
  const product = document.getElementById("product").value;
  const quantity = parseInt(document.getElementById("quantity").value) || 1;
  const basePrice = prices[product] || 0;
  const total = basePrice * quantity;

  document.getElementById("totalPrice").innerHTML = "Total: R" + total;
}

// Event listeners to update price when product OR quantity changes
document.getElementById("product").addEventListener("change", updateTotalPrice);
document.getElementById("quantity").addEventListener("input", updateTotalPrice);

// 4. Submit Order Function
async function submitOrder() {
  // Get Form Values
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const area = document.getElementById('area').value;
  const product = document.getElementById('product').value;
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  
  // Added missing payment field (Ensure you have an element with id="payment" in your HTML)
  const payment = document.getElementById('payment') ? document.getElementById('payment').value : 'Not Specified';

  // Calculate total amount
  const amount = (prices[product] || 0) * quantity;

  // Insert Customer
  const customer = {
    name: name,
    phone: phone,
    address: address,
    area: area
  };

  const { data: customerData, error: customerError } = await client
    .from('customers')
    .insert([customer])
    .select();

  if (customerError) {
    console.error('Customer insert failed:', customerError);
    document.getElementById('message').innerHTML = 'Error submitting customer details';
    return;
  }

  const customerId = customerData[0].id;

  // Insert Order
  const { error: orderError } = await client
    .from('orders')
    .insert([{
      customer_id: customerId,
      product: product,
      quantity: quantity,
      amount: amount
    }]);

  if (orderError) {
    console.error('Order insert failed:', orderError);
    document.getElementById('message').innerHTML = 'Error submitting order';
    return;
  }

  // Trigger WhatsApp Message
  const message = `NEW GAS ORDER

Customer: ${name}
Phone: ${phone}
Address: ${address}
Area: ${area}

Product: ${product}
Qty: ${quantity}
Total: R${amount}
Payment Method: ${payment}`;

  window.open(
    `https://wa.me/27725744458?text=${encodeURIComponent(message)}`,
    '_blank'
  );

  document.getElementById('message').innerHTML = 'Order Submitted Successfully';
}
