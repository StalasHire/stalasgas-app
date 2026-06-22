const SUPABASE_URL =
'https://prgyyylrwxkzelydtaaw.supabase.co';

const SUPABASE_KEY =
'sb_publishable_DsBKId5DVPYVOsKMLuOfAQ_Rqb1jwTY';

const client =
supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

loadOrders();

async function loadOrders(){

const {data}=await client
.from('orders')
.select('*');

let html=
'<tr><th>ID</th><th>Product</th><th>Qty</th><th>Amount</th></tr>';

data.forEach(order=>{

html+=`
<tr>
<td>${order.id}</td>
<td>${order.product}</td>
<td>${order.quantity}</td>
<td>R${order.amount}</td>
</tr>
`;

});

document.getElementById('ordersTable').innerHTML=
html;
}
