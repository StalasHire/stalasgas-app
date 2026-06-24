// Initialization
const SUPABASE_URL = 'https://prgyyylrwxkzelydtaaw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DsBKId5DVPYVOsKMLuOfAQ_Rqb1jwTY';
const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Format product cleaner identifiers back to human-readable names
const productNames = {
  exchange_5kg: "5kg Exchange",
  exchange_7kg: "7kg Exchange",
  exchange_9kg: "9kg Exchange",
  exchange_14kg: "14kg Exchange",
  exchange_19kg: "19kg Exchange",
  exchange_48kg: "48kg Exchange",
  cylinder_9kg: "9kg Empty Cylinder",
  cylinder_48kg: "48kg Empty Cylinder",
  combo_9kg: "9kg Cylinder + Gas",
  combo_48kg: "48kg Cylinder + Gas"
};

async function loadDashboardData() {
  try {
    // Fetch orders and fetch nested customer relation data implicitly
    const { data: orders, error } = await client
      .from('orders')
      .select(`
        id,
        created_at,
        product,
        quantity,
        amount,
        customers (
          name,
          phone,
          area
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch total customer count
    const { count: customerCount, error: customerError } = await client
      .from('customers')
      .select('*', { count: 'exact', head: true });

    if (customerError) throw customerError;

    // Process & Display Metrics
    calculateMetrics(orders, customerCount);
    
    // Render HTML Table Lines
    renderTable(orders);

  } catch (err) {
    console.error('Dashboard loading failed:', err);
    document.getElementById('orderTableBody').innerHTML = 
      `<tr><td colspan="7" style="text-align: center; color: red;">Failed to sync live server dashboard data.</td></tr>`;
  }
}

function calculateMetrics(orders, customerCount) {
  let totalRevenue = 0;
  let totalOrders = orders.length;

  orders.forEach(order => {
    totalRevenue += Number(order.amount || 0);
  });

  // Inject metric elements to UI viewport
  document.getElementById('totalRevenue').innerText = `R${totalRevenue}`;
  document.getElementById('totalOrders').innerText = totalOrders;
  document.getElementById('totalCustomers').innerText = customerCount || 0;
}

function renderTable(orders) {
  const tableBody = document.getElementById('orderTableBody');
  
  if (!orders || orders.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #999;">No active orders found yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = ''; // Wipe loader text out

  orders.forEach(order => {
    const customer = order.customers || {};
    const formattedDate = new Date(order.created_at).toLocaleDateString('en-ZA', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
    });

    const rowHTML = `
      <tr>
        <td>${formattedDate}</td>
        <td><strong>${customer.name || 'N/A'}</strong></td>
        <td>${customer.phone || 'N/A'}</td>
        <td>${customer.area || 'N/A'}</td>
        <td>${productNames[order.product] || order.product}</td>
        <td>${order.quantity}</td>
        <td><strong style="color: var(--secondary-color);">R${order.amount}</strong></td>
      </tr>
    `;
    tableBody.innerHTML += rowHTML;
  });
}

// Initial Run hook execution on window mount loading phases automatically
window.onload = loadDashboardData;
