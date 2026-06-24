// ==========================================================================
// 1. Initialization & Configuration
// ==========================================================================
const SUPABASE_URL = 'https://prgyyylrwxkzelydtaaw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DsBKId5DVPYVOsKMLuOfAQ_Rqb1jwTY';
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Unified Price List
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

// ==========================================================================
// 3. Live Price Calculator
// ==========================================================================
function updateTotalPrice() {
  const product = document.getElementById("product").value;
  const quantity = parseInt(document.getElementById("quantity").value) || 1;
  const basePrice = prices[product] || 0;
  const total = basePrice * quantity;

  document.getElementById("totalPrice").innerHTML = "Total: R" + total;
}

// Event listeners to update price dynamically when values change
document.getElementById("product").addEventListener("change", updateTotalPrice);
document.getElementById("quantity").addEventListener("input", updateTotalPrice);


// ==========================================================================
// 4. Submit Order Function
// ==========================================================================
async function submitOrder() {
  // Get Form Inputs
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const area = document.getElementById('area').value;
  const product = document.getElementById('product').value;
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const payment = document.getElementById('payment') ? document.getElementById('payment').value : 'Not Specified';
  const submitMethod = document.getElementById('submitMethod').value; // Added

  // Basic Validation
  if (!name || !phone || !address || !product || !submitMethod) {
    document.getElementById('message').innerHTML = '<span style="color:red;">Please fill in all required fields.</span>';
    return;
  }

  // Calculate final amount
  const amount = (prices[product] || 0) * quantity;

  // Insert Into Supabase (Customers Table)
  const customer = { name, phone, address, area };
  const { data: customerData, error: customerError } = await client
    .from('customers')
    .insert([customer])
    .select();

  if (customerError) {
    console.error('Customer insert failed:', customerError);
    document.getElementById('message').innerHTML = 'Error saving customer details';
    return;
  }

  const customerId = customerData[0].id;

  // Insert Into Supabase (Orders Table)
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
    document.getElementById('message').innerHTML = 'Error saving order';
    return;
  }

  // Construct Uniform Message Payload
  const messageText = `NEW GAS ORDER

Customer: ${name}
Phone: ${phone}
Address: ${address}
Area: ${area}

Product: ${product}
Qty: ${quantity}
Total: R${amount}
Payment Method: ${payment}`;

  // 5. Route Based on Choice (Now nested properly inside the function!)
  if (submitMethod === 'whatsapp') {
    window.open(
      `https://wa.me/27725744458?text=${encodeURIComponent(messageText)}`,
      '_blank'
    );
    document.getElementById('message').innerHTML = 'Order Submitted! Opening WhatsApp...';
    
  } else if (submitMethod === 'email') {
    // METHOD A: Simple "mailto" link pointing directly to your business inbox
    const emailSubject = encodeURIComponent(`New Gas Order - ${name}`);
    const emailBody = encodeURIComponent(messageText);
    window.location.href = `mailto:info@stala.co.za?subject=${emailSubject}&body=${emailBody}`;
    
    /* // METHOD B: Silent Background Email via EmailJS (Alternative setup)
    emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
        customer_name: name,
        customer_phone: phone,
        delivery_address: `${address}, ${area}`,
        order_details: `${quantity}x ${product}`,
        total_amount: `R${amount}`,
        payment_method: payment,
        to_email: "info@stala.co.za" 
    }).then(() => {
        document.getElementById('message').innerHTML = 'Order submitted & Email sent to Stala\'sGas!';
    }, (err) => {
        console.error('Email failed to send...', err);
        document.getElementById('message').innerHTML = 'Order saved to database, but email notification failed.';
    });
    */
    
    document.getElementById('message').innerHTML = 'Order Submitted! Opening Email Client...';
  }
}
