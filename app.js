/* app.js - Stala'sGas Order Form */

const supabase = Supabase.createClient(
'https://prgyyylrwxkzelydtaaw.supabase.co',
'sb_publishable_DsBKId5DVPYVOsKMLuOfAQ_Rqb1jwTY'
);

document.addEventListener('DOMContentLoaded', function () {

const productSelect = document.getElementById('product');
const quantityInput = document.getElementById('quantity');
const totalPriceEl = document.getElementById('totalPrice');
const paymentSelect = document.getElementById('payment');

function updateTotal() {
const selectedOption =
productSelect.options[productSelect.selectedIndex];

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

localStorage.setItem(
  'stalasgas_order',
  JSON.stringify(formData)
);

}

function restoreFormData() {
const saved =
JSON.parse(localStorage.getItem('stalasgas_order'));

if (!saved) return;

document.getElementById('name').value =
  saved.name || '';

document.getElementById('phone').value =
  saved.phone || '';

document.getElementById('address').value =
  saved.address || '';

document.getElementById('area').value =
  saved.area || '';

document.getElementById('product').value =
  saved.product || '';

document.getElementById('quantity').value =
  saved.quantity || 1;

document.getElementById('payment').value =
  saved.payment || '';

document.getElementById('submitMethod').value =
  saved.submitMethod || '';

updateTotal();

}

restoreFormData();

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

async function submitOrder() {

const messageDiv = document.getElementById('message');
messageDiv.innerHTML = '';

const name =
document.getElementById('name').value.trim();

const phone =
document.getElementById('phone').value.trim();

const address =
document.getElementById('address').value.trim();

const area =
document.getElementById('area').value.trim();

const productSelectEl =
document.getElementById('product');

const productOption =
productSelectEl.options[
productSelectEl.selectedIndex
];

const productText =
productOption.textContent;

const quantity =
parseInt(
document.getElementById('quantity').value
) || 1;

const payment =
document.getElementById('payment').value;

const submitMethod =
document.getElementById('submitMethod').value;

if (
!name ||
!phone ||
!address ||
!area ||
!productSelectEl.value ||
!payment ||
!submitMethod
) {
messageDiv.innerHTML =
'<p style="color:red;">Please fill in all fields.</p>';
return;
}

const selectedPrice =
parseFloat(productOption.dataset.price) || 0;

const total =
selectedPrice * quantity;

try {

const { error } =
  await supabase
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
  console.error(error);
}

} catch (err) {
console.error(err);
}

let orderDetails =
`New Stala'sGas Order

👤 Name: ${name}
📞 Phone: ${phone}
📍 Address: ${address}
🏠 Area: ${area}

🛒 Product: ${productText}
🔢 Quantity: ${quantity}
💰 Total: R${total}
💳 Payment: ${payment}

`;

if (payment.toUpperCase() === 'EFT') {

orderDetails +=

`🏦 BANKING DETAILS

Account Name: Stala'sGas
Bank: FNB
Account Type: Cheque
Account Number: 62732719797

Please send proof of payment to:
0725744458

`;
}

messageDiv.innerHTML =
'<p style="color:green;">✅ Order submitted successfully!</p>';

if (submitMethod === 'whatsapp') {

const whatsappNumber =
  '27725744458';

const whatsappUrl =
  `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(orderDetails)}`;

window.open(
  whatsappUrl,
  '_blank'
);

} else {

const emailSubject =
  encodeURIComponent(
    "New Stala'sGas Order"
  );

const emailBody =
  encodeURIComponent(orderDetails);

const mailtoLink =
  `mailto:info@stala.co.za?subject=${emailSubject}&body=${emailBody}`;

window.location.href =
  mailtoLink;

}

setTimeout(() => {
messageDiv.innerHTML = '';
}, 6000);
  }
