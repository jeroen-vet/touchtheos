console.log("Touchtheos JS loaded! 🌊 Step 1: Script started.");

// Immediate logs to test basic execution
console.log("Step 2: This should appear right after Step 1.");
console.log("Step 3: If you see this, the file is parsing fully! 🎉");
console.log("Step 4: Testing a basic variable:", 2 + 2);  // Should log 4

// Reliable DOM ready function (handles if DOM is already loaded)
function ready(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // DOM is already ready; run immediately
        setTimeout(fn, 1);  // Slight delay for safety in async environments
    } else {
        // Wait for DOMContentLoaded
        document.addEventListener('DOMContentLoaded', fn);
    }
    console.log("Step 5: Ready handler set up. Waiting for DOM if needed.");
}

// Function to parse product ID from URL (e.g., '3' from '/shop/one-time-donation-3')
function getProductIdFromUrl() {
    const path = window.location.pathname;
    const match = path.match(/\/shop\/.*-(\d+)$/);  // Looks for '-<number>' at end
    return match ? parseInt(match[1]) : null;
}

// The full donation initialization logic
function initializeDonationLogic() {
    console.log("Step 6: Attempting to initialize donation logic...");

    // Selectors - adjusted based on your HTML
    const donationOptions = document.querySelector('.donation-options');  // Optional wrapper
    const customAmountInput = document.querySelector('#custom_amount');
    const radioInputs = document.querySelectorAll('input[name="donation_amount"]');
    const priceElements = document.querySelectorAll('.oe_currency_value');  // ALL visible price displays (in case multiple)
    const hiddenPriceInput = document.querySelector('input[name="price"]');  // Hidden input (might be gone)
    const cartForm = document.querySelector('form[action="/shop/cart/update"]');  // Cart form (if present)
    const addToCartButton = document.querySelector('#add_to_cart');  // Matches your HTML

    // Additional selectors for cart params (expanded for common Odoo names)
    const productIdInput = document.querySelector('input[name="product_id"]') || 
                           document.querySelector('input[name="product_template_id"]') || 
                           document.querySelector('input[name="product_no_variant_attribute_value_ids"]');  // Fallbacks
    let currentProductId = productIdInput ? parseInt(productIdInput.value) : getProductIdFromUrl() || 3;  // Use URL parse or default to 3

    // Debugging logs (unchanged)
    console.log("URL-based product ID parse:", getProductIdFromUrl(), "(Full URL:", window.location.pathname, ")");
    console.log("Found donation options wrapper:", !!donationOptions);
    console.log("Found custom input:", !!customAmountInput, "(ID: #custom_amount)");
    console.log("Found radio inputs:", radioInputs.length);
    radioInputs.forEach((radio, index) => {
        console.log(`Radio ${index}: value=${radio.value}, checked=${radio.checked}`);
    });
    console.log("Found visible price elements:", priceElements.length, "(Texts:", Array.from(priceElements).map(el => el.textContent).join(", "), ")");
    console.log("Found hidden price input:", !!hiddenPriceInput, "(Current value:", hiddenPriceInput ? hiddenPriceInput.value : "N/A)", "(Selector used: 'input[name=\"price\"]')");
    console.log("Found cart form:", !!cartForm, "(Action:", cartForm ? cartForm.action : "N/A)");
    console.log("Found add to cart button:", !!addToCartButton, "(Text:", addToCartButton ? addToCartButton.textContent : "N/A)", "(Selector used: '#add_to_cart')");
    console.log("Found product ID input:", !!productIdInput, "(Value:", currentProductId, "(Name:", productIdInput ? productIdInput.name : "N/A) - If wrong, inspect URL or hidden input and update default in JS (line ~70)!)");

    // Condition: Require key elements (relaxed hiddenPriceInput since it might be gone)
    if (radioInputs.length === 0 || !customAmountInput || priceElements.length === 0 || !addToCartButton) {
        console.warn("Step 7: Required elements not found yet. Will retry...");
        return false;  // Not ready; retry later
    }
    if (currentProductId <= 0) {
        console.warn("Invalid product ID (" + currentProductId + "); cart add will fail. Inspect and update default in JS.");
    }

    // Toggle custom field function (unchanged)
    function toggleCustomField() {
        const selectedValue = document.querySelector('input[name="donation_amount"]:checked')?.value || 'none';
        customAmountInput.style.display = (selectedValue === 'custom') ? 'block' : 'none';
        if (selectedValue === 'custom') customAmountInput.focus();
        console.log("Step 8: Toggled custom field. Visible:", selectedValue === 'custom', "(Selected:", selectedValue, ")");
    }

    // Update price function (unchanged)
    function updatePrice(amount) {
        const formattedAmount = amount.toFixed(2);
        priceElements.forEach(el => {
            el.textContent = formattedAmount;
        });
        if (hiddenPriceInput) {
            hiddenPriceInput.value = formattedAmount;  // Sync if exists
            hiddenPriceInput.dispatchEvent(new Event('change'));
        }
        console.log("Step 9: Price updated to:", formattedAmount, `(Synced ${priceElements.length} visible elements; hidden if present; change event triggered)`);
    }

    // Bind events to radios (unchanged)
    radioInputs.forEach(radio => {
        radio.addEventListener('change', function () {
            const amount = this.value;
            console.log("Step 10: Radio change detected! Value:", amount);
            if (amount !== 'custom') {
                updatePrice(parseFloat(amount) || 0);
            }
            toggleCustomField();
        });
    });

    // Bind event to custom input (unchanged)
    customAmountInput.addEventListener('input', function () {
        const customAmount = parseFloat(this.value) || 0;
        console.log("Step 11: Custom input change detected! Amount:", customAmount);
        updatePrice(customAmount);
    });

    // Bind click event to button for manual AJAX add-to-cart
    addToCartButton.addEventListener('click', function (event) {
        event.preventDefault();  // Prevent Odoo's default handler
        console.log("Step 16: Add to Cart button clicked! Preventing default. Current hidden price:", hiddenPriceInput ? hiddenPriceInput.value : "N/A (might be gone)");

        // Get current amount (from custom or selected radio)
        const selectedRadio = document.querySelector('input[name="donation_amount"]:checked');
        const amount = selectedRadio ? (selectedRadio.value === 'custom' ? parseFloat(customAmountInput.value) || 0 : parseFloat(selectedRadio.value) || 0) : 0;
        const formattedAmount = amount.toFixed(2);
        // Enhanced params for better price override (unchanged)
        const params = {
            type: 'add',  // Explicitly specify add operation
            product_id: currentProductId,
            product_template_id: currentProductId,
            add_qty: 1,
            fixed_price: formattedAmount,  // Primary override
            price_unit: formattedAmount,   // Fallback for sale order lines
            price: formattedAmount,        // General fallback
            amount: formattedAmount,       // Custom if backend reads it
            set_price: formattedAmount,    // Another variant
            product_no_variant_attribute_value_ids: [],  // Force no variants
            product_custom_attribute_values: [],         // No custom attributes
            no_variant_attribute_values: [],             // Additional force
            express: 1                                   // Quick add
        };


        params.fixed_price = parseFloat(customAmountInput.value || 0);

        console.log("Step 17: Preparing manual AJAX to /shop/cart/update_json with enhanced params:", params);

        // Wrap in JSON-RPC structure (required for Odoo JSON routes)
        const rpcBody = {
            jsonrpc: "2.0",
            method: 'call',
            params: params,
            id: Math.floor(Math.random() * 1000000000)  // Random ID
        };

        console.log("Step 17a: Wrapped RPC body:", rpcBody);

        // Send manual AJAX request
        fetch('/shop/cart/update_json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(rpcBody)
        })
        .then(response => {
            if (!response.ok) {
                console.error("Step 18: HTTP error! Status:", response.status, "Response:", response);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Step 18: Full AJAX response:", data);

            if (data.error) {
                // Handle Odoo JSON errors with deeper logging
                console.error("Step 18: Odoo error details:", data.error);
                if (data.error.data) {
                    console.error("Error type:", data.error.data.name || "Unknown");
                    console.error("Error message:", data.error.data.message || "No message");
                    console.error("Error debug/traceback:", data.error.data.debug || "No debug");
                    console.error("Error arguments:", data.error.data.arguments || "None");
                }
                alert("Error from Odoo: " + (data.error.data?.message || data.error.message || "Unknown error") + ". Check console for full details.");
                return;  // Stop here
            }

            // Success: Inspect result for cart details
            const result = data.result || {};
            console.log("Step 18: Result data:", result);

            // Improved: Parse the HTML snippet to find the price for our product ID
            let serverPrice = 0;
            if (result['website_sale.cart_lines']) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(result['website_sale.cart_lines'], 'text/html');
                const productDiv = doc.querySelector(`[data-product-id="${currentProductId}"]`);
                if (productDiv) {
                    const priceEl = productDiv.querySelector('.oe_currency_value');  // Or adjust selector based on your theme
                    serverPrice = priceEl ? parseFloat(priceEl.textContent.trim()) : 0;
                }
            }
            console.log("Step 18: Server-reported price for added line (parsed from HTML):", serverPrice);

            if (parseFloat(serverPrice) !== parseFloat(formattedAmount)) {
                console.warn("Step 18: Warning - Server overrode price! Sent:", formattedAmount, "but server used:", serverPrice, ". If backend module is installed, verify product config (list_price=0, type=service, no variants).");
            }

            const successMessage = `Added to cart successfully! Price sent: ${formattedAmount} (Server used: ${serverPrice}). If not matching, check backend module installation. Redirecting to cart...`;
            console.log("Step 18: Success message (also alerting):", successMessage);
            alert(successMessage);

            // Redirect to cart
            window.location.href = '/shop/cart';
        })
        .catch(error => {
            console.error("Step 18: AJAX failed:", error);
            alert("Error adding to cart: " + error.message + ". Falling back to form submission...");

            // Fallback: Simulate form submission if AJAX fails
            if (cartForm) {
                // Dynamically add hidden inputs to the form
                const form = cartForm;
                form.innerHTML += `<input type="hidden" name="product_id" value="${currentProductId}">`;
                form.innerHTML += `<input type="hidden" name="add_qty" value="1">`;
                form.innerHTML += `<input type="hidden" name="fixed_price" value="${formattedAmount}">`;  // Try override
                form.innerHTML += `<input type="hidden" name="price_unit" value="${formattedAmount}">`;
                form.submit();  // Submit the form
                console.log("Step 18 fallback: Submitted hidden form with params.");
            } else {
                console.error("No cart form found for fallback.");
            }
        });
    });

    // Initial setup (unchanged)
    toggleCustomField();
    const initialAmount = document.querySelector('input[name="donation_amount"]:checked')?.value;
    if (initialAmount && initialAmount !== 'custom') {
        updatePrice(parseFloat(initialAmount) || 0);
    } else if (initialAmount === 'custom') {
        updatePrice(parseFloat(customAmountInput.value) || 0);
    }
    console.log("Step 12: Donation logic FULLY initialized! Events bound and ready. 🎉 (Updates ALL visible prices; better response price extraction from HTML)");
    return true;  // Success
}

// Run the logic when ready, with retries if needed—but only on product pages (unchanged)
ready(function() {
    // Updated check: Run on /shop/ pages that aren't cart or categories
    const path = window.location.pathname;
    if (!path.startsWith('/shop/') || path === '/shop/cart' || path.startsWith('/shop/category/')) {
        console.log("Step 6a: Not on a product detail page (URL: " + path + "). Skipping initialization to avoid errors on cart/category/etc.");
        return;  // Exit early
    }
    console.log("Step 6a: On product detail page! Starting initialization.");

    if (initializeDonationLogic()) return;  // Success on first try

    // Retry every 500ms if elements not found
    let retryCount = 0;
    const maxRetries = 20;  // ~10 seconds
    const retryInterval = setInterval(() => {
        retryCount++;
        console.log(`Retry ${retryCount}/${maxRetries}: Checking elements again...`);
        if (initializeDonationLogic()) {
            clearInterval(retryInterval);
        } else if (retryCount >= maxRetries) {
            clearInterval(retryInterval);
            console.error("Max retries reached. Check selectors or if page HTML changed after removing attributes.");
        }
    }, 500);
});

// End of file
console.log("Step 13: End of script reached. Success! (Outside ready)");
