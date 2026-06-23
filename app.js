const SUPABASE_URL =
'https://prgyyylrwxkzelydtaaw.supabase.co';

const SUPABASE_KEY =
'sb_publishable_DsBKId5DVPYVOsKMLuOfAQ_Rqb1jwTY';

const client =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

const prices={
'5kg':250,
'7kg':325,
'9kg':380,
'14kg':580,
'19kg':750,
'48kg':1600
};

async function submitOrder(){

const name=document.getElementById('name').value;
const phone=document.getElementById('phone').value;
const product=document.getElementById('product').value;
const quantity=parseInt(document.getElementById('quantity').value);

let amount=
prices[product]*quantity;

const customer = {
  name: document.getElementById("name").value,
  phone: document.getElementById("phone").value,
  address: document.getElementById("address").value,
  area: document.getElementById("area").value
};

await supabase
  .from("customers")
  .insert([customer]);
const customer=
await client
.from('customers')
.insert([{
name:name,
phone:phone
}])
.select();

const customerId=
customer.data[0].id;

await client
.from('orders')
.insert([{
customer_id:customerId,
product:product,
quantity:quantity,
amount:amount
}]);

const address = document.getElementById('address').value;
const area = document.getElementById('area').value;

document.getElementById('message').innerHTML=
'Order Submitted Successfully';
}
