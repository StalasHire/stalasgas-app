const SUPABASE_URL =
"https://prgyyylrwxkzelydtaaw.supabase.co";

const SUPABASE_KEY =
sb_publishable_DsBKId5DVPYVOsKMLuOfAQ_Rqb1jwTY

const supabase =
window.supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
);

async function loadDashboard() {

const { data: customers } =
await supabase
.from("customers")
.select("*");

document.getElementById("customers")
.innerText = customers.length;

const { data: orders } =
await supabase
.from("orders")
.select("*");

document.getElementById("orders")
.innerText = orders.length;

let revenue = 0;

orders.forEach(order=>{
revenue += Number(order.total || 0);
});

document.getElementById("revenue")
.innerText = "R" + revenue;
}

loadDashboard();
