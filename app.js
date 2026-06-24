const SUPABASE_URL = 'https://prgyyylrwxkzelydtaaw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DsBKId5DVPYVOsKMLuOfAQ_Rqb1jwTY';
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const prices = {
  '5kg': 250,
  '7kg': 325,
  '9kg': 380,
  '14kg': 580,
  '19kg': 750,
  '48kg': 1600
};

async function submitOrder() {
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const area = document.getElementById('area').value;
  const product = document.getElementById('product').value;
  const quantity = parseInt(document.getElementById('quantity').value);

  const amount = prices[product] * quantity;

  // Single customer object, single insert
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
    document.getElementById('message').innerHTML = 'Error submitting order';
    return;
  }

  const customerId = customerData[0].id;

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
  const message =
`NEW GAS ORDER

Customer: ${name}
Phone: ${phone}
Address: ${address}
Area: ${area}

Product: ${product}
Qty: ${quantity}

Payment: ${payment}`;

window.open(
`https://wa.me/27725744458?text=${encodeURIComponent(message)}`,
'_blank'
);
  const prices = {

exchange_5kg: 250,
exchange_7kg: 325,
exchange_9kg: 380,
exchange_14kg: 580,
exchange_19kg: 750,
exchange_48kg: 1600,

cylinder_9kg: 650,
cylinder_48kg: 1200,

combo_9kg: 1030, // 650 + 380
combo_48kg: 2800 // 1200 + 1600

};
document
.getElementById("product")
.addEventListener("change", function(){

const product = this.value;

const total = prices[product] || 0;

document.getElementById("totalPrice")
.innerHTML = "Total: R" + total;

});
  document.getElementById('message').innerHTML = 'Order Submitted Successfully';
}
