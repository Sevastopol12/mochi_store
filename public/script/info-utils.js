document.addEventListener('DOMContentLoaded', () => {
    const startDateInput = document.getElementById('start-date');
    const startTimeInput = document.getElementById('start-time'); // New: Get start time input
    const endDateInput = document.getElementById('end-date');
    const endTimeInput = document.getElementById('end-time');     // New: Get end time input
    const orderListBody = document.querySelector('#order-list tbody');
    const noOrdersMsg = document.getElementById('no-orders');

    // Set Default Date and Time Values 
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0'); 
    const currentDay = String(today.getDate()).padStart(2, '0');
    const todayDateString = `${currentYear}-${currentMonth}-${currentDay}`;

    // Calculate date for one month ago
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const prevYear = oneMonthAgo.getFullYear();
    const prevMonth = String(oneMonthAgo.getMonth() + 1).padStart(2, '0');
    const prevDay = String(oneMonthAgo.getDate()).padStart(2, '0');
    const oneMonthAgoDateString = `${prevYear}-${prevMonth}-${prevDay}`;

    // Get current time in HH:MM format for the to time
    const currentHours = String(today.getHours()).padStart(2, '0');
    const currentMinutes = String(today.getMinutes()).padStart(2, '0');
    const currentTime24Hr = `${currentHours}:${currentMinutes}`;

    // Set initial values for inputs
    startDateInput.value = oneMonthAgoDateString; 
    startTimeInput.value = "00:00"; 
    endDateInput.value = todayDateString;      
    endTimeInput.value = "23:59";               

    // Function to fetch and render orders based on selected date and time range 
    function fetchAndRenderOrders() {
        const start = startDateInput.value;
        const end = endDateInput.value;
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;     

        // Construct API URL with both date and time parameters
        const apiUrl = `/api/my-orders` + `?start=${encodeURIComponent(start)}` + `&startTime=${encodeURIComponent(startTime)}` + `&end=${encodeURIComponent(end)}` + `&endTime=${encodeURIComponent(endTime)}`;

        fetch(apiUrl)
            .then(res => {
                return res.json();
            })
            .then(orders => {
                orderListBody.innerHTML = ''; 
                console.log('Orders fetched:', orders);

                if (!orders || orders.length === 0) {
                    noOrdersMsg.style.display = 'block';
                    console.log('No orders found.');
                    return;
                }

                noOrdersMsg.style.display = 'none';

                // Sort orders by date and then time in descending order
                Object.values(orders).sort((a, b) => {
                    const dateA = new Date(`${a.date}T${a.time || '00:00:00'}`);
                    const dateB = new Date(`${b.date}T${b.time || '00:00:00'}`);
                    return dateB.getTime() - dateA.getTime(); 
                });

                Object.values(orders).forEach(o => {
                const row = document.createElement('tr');

                let orderDateTime;
                
                // Parse time
                if (o.date && typeof o.date === 'string') {
                    // Time defaults to '00:00:00' if empty or null
                    const timePart = o.time && typeof o.time === 'string' && o.time.trim() !== '' ? o.time : '00:00:00';

                    let isoDateTimeString = `${o.date}T${timePart}`;
                    orderDateTime = new Date(isoDateTimeString);

                    // If it's an Invalid Date, it might be the MM/DD/YYYY format
                    if (isNaN(orderDateTime.getTime())) {
                        let commonFormatString = `${o.date} ${timePart}`;
                        orderDateTime = new Date(commonFormatString);

                        if (isNaN(orderDateTime.getTime())) {
                            console.error(`Invalid Date encountered for order ID: ${o.id}. Date string: "${o.date}", Time string: "${o.time}". Attempted full string: "${isoDateTimeString}" and "${commonFormatString}".`);
                            orderDateTime = new Date();
                        }
                    }
                } else {
                    console.warn(`Order ${o.id} has missing or invalid 'date' property:`, o.date);
                    orderDateTime = new Date();
                }

                const displayDate = orderDateTime.toLocaleDateString();
                const displayTime = orderDateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const displayTotal = (o.total !== undefined && o.total !== null) ? `$ ${o.total}` : '$0.00';

                let statusText;
                let statusBadgeClass;
                switch (o.status) {
                    case 0:
                        statusText = 'On-going';
                        statusBadgeClass = 'bg-warning text-dark';
                        break;
                    case 1:
                        statusText = 'Delivered';
                        statusBadgeClass = 'bg-success';
                        break;
                    default:
                        statusText = 'Unknown';
                        statusBadgeClass = 'bg-secondary';
                }

                row.innerHTML = `
                    <td>${displayDate} <br> <small class="text-muted">${displayTime}</small></td>
                    <td>${o.id}</td>
                    <td><span class="badge ${statusBadgeClass}">${statusText}</span></td>
                    <td>${displayTotal}</td>
                    <td>
                        <button
                            class="btn btn-sm btn-info view-products-btn"
                            data-order-id="${o.id}"
                            data-order-products='${JSON.stringify(o.products || [])}' type="button"
                        >
                            View Products
                        </button>
                    </td>
                `;
                orderListBody.appendChild(row);
            });

                orderListBody.removeEventListener('click', handleOrderProductButtonClick);
                orderListBody.addEventListener('click', handleOrderProductButtonClick);
            })
            .catch(err => {
                console.error('Error fetching orders:', err);
                orderListBody.innerHTML = '<tr><td colspan="5" style="color: red;">Failed to load orders. Please try again later.</td></tr>';
                noOrdersMsg.style.display = 'none';
            });
    }

    // Event handler for "View Products" buttons
    function handleOrderProductButtonClick(event) {
        if (event.target.classList.contains('view-products-btn')) {
            displayOrderProducts(event);
        }
    }

    // Function to display products in the modal
    function displayOrderProducts(event) {
        console.log('View Products button clicked.');
        const button = event.currentTarget;
        const orderId = button.dataset.orderId;
        const productsString = button.dataset.orderProducts;

        let products = [];
        try {
            products = JSON.parse(productsString);
            console.log('Parsed products:', products);
        } catch (e) {
            console.error('Error parsing products JSON from data-order-products:', e);
            products = [];
        }

        modalOrderId.textContent = orderId;
        modalProductsList.innerHTML = '';

        if (!products || products.length === 0) {
            noProductsMsg.style.display = 'block';
            console.log('No products found for this order.');
        } else {
            noProductsMsg.style.display = 'none';
            const ul = document.createElement('ul');
            ul.classList.add('list-group');

            Object.values(products).forEach(product => {
                const li = document.createElement('li');
                li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');

                const productName = product.name || 'N/A';
                const productQty = product.quantity || 1;
                const productPrice = (typeof product.price === 'number' && !isNaN(product.price)) ? `${formatPriceVND(product.price)}` : '$0.00';


                li.innerHTML = `
                    <span>${productName}</span>
                    <span class="badge bg-primary rounded-pill">Qty: ${productQty} | Price: ${productPrice}</span>
                `;
                ul.appendChild(li);
            });
            modalProductsList.appendChild(ul);
        }

        productsModal.show();
    }

    // Attach Event Listeners to Date AND Time Inputs
    Object.values([startDateInput, startTimeInput, endDateInput, endTimeInput]).forEach(input => {
        input.addEventListener('change', fetchAndRenderOrders);
    });

    // Initial load
    fetchAndRenderOrders();
});