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

// The full donation initialization logic
function initializeDonationLogic() {
    console.log("Step 6: Attempting to initialize donation logic...");

    // Selectors - adjusted based on your HTML
    const donationOptions = document.querySelector('.donation-options');  // Optional wrapper
    const customAmountInput = document.querySelector('#custom_amount');
    const radioInputs = document.querySelectorAll('input[name="donation_amount"]');
    const priceElement = document.querySelector('.oe_currency_value');  // Visible price display
    const hiddenPriceInput = document.querySelector('input[name="price"]');  // Hidden input for cart
    const cartForm = document.querySelector('form[action="/shop/cart/update"]');  // Cart form (if present)
    const addToCartButton = document.querySelector('#add_to_cart');  // Matches your HTML

    // Additional selectors for cart params (expanded for common Odoo names)
    const productIdInput = document.querySelector('input[name="product_id"]') || 
                           document.querySelector('input[name="product_template_id"]') || 
                           document.querySelector('input[name="product_no_variant_attribute_value_ids"]');  // Fallbacks
    const currentProductId = productIdInput ? parseInt(productIdInput.value) : 3;  // Default to 3; CHANGE TO YOUR ACTUAL ID (e.g., from URL like /shop/product/donation-42 → 42)

    // Debugging logs
    console.log("Found donation options wrapper:", !!donationOptions);
    console.log("Found custom input:", !!customAmountInput, "(ID: #custom_amount)");
    console.log("Found radio inputs:", radioInputs.length);
    radioInputs.forEach((radio, index) => {
        console.log(`Radio ${index}: value=${radio.value}, checked=${radio.checked}`);
    });
    console.log("Found visible price element:", !!priceElement, "(Current text:", priceElement ? priceElement.textContent : "N/A)");
    console.log("Found hidden price input:", !!hiddenPriceInput, "(Current value:", hiddenPriceInput ? hiddenPriceInput.value : "N/A)", "(Selector used: 'input[name=\"price\"]')");
    console.log("Found cart form:", !!cartForm, "(Action:", cartForm ? cartForm.action : "N/A)");
    console.log("Found add to cart button:", !!addToCartButton, "(Text:", addToCartButton ? addToCartButton.textContent : "N/A)", "(Selector used: '#add_to_cart')");
    console.log("Found product ID input:", !!productIdInput, "(Value:", currentProductId, "(Name:", productIdInput ? productIdInput.name : "N/A) - If wrong, inspect URL or hidden input and update default in JS (line ~70)!)");

    // Condition: Require key elements
    if (radioInputs.length === 0 || !customAmountInput || !priceElement || !hiddenPriceInput || !addToCartButton) {
        console.warn("Step 7: Required elements not found yet. Will retry...");
        return false;  // Not ready; retry later
    }
    if (currentProductId <= 0) {
        console.warn("Invalid product ID (" + currentProductId + "); cart add will fail. Inspect and update default in JS.");
    }

    // Toggle custom field function
    function toggleCustomField() {
        const selectedValue = document.querySelector('input[name="donation_amount"]:checked')?.value || 'none';
        customAmountInput.style.display = (selectedValue === 'custom') ? 'block' : 'none';
        if (selectedValue === 'custom') customAmountInput.focus();
        console.log("Step 8: Toggled custom field. Visible:", selectedValue === 'custom', "(Selected:", selectedValue, ")");
    }

    // Update price function (updates BOTH visible text and hidden input, triggers change event)
    function updatePrice(amount) {
        priceElement.textContent = amount.toFixed(2);
        if (hiddenPriceInput) hiddenPriceInput.value = amount.toFixed(2);  // Sync if exists
        if (hiddenPriceInput) hiddenPriceInput.dispatchEvent(new Event('change'));
        console.log("Step 9: Price updated to:", amount.toFixed(2), "(Visible and hidden input synced; change event triggered)");
    }

    // Bind events to radios
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

    // Bind event to custom input
    customAmountInput.addEventListener('input', function () {
        const customAmount = parseFloat(this.value) || 0;
        console.log("Step 11: Custom input change detected! Amount:", customAmount);
        updatePrice(customAmount);
    });

    // Bind click event to button for manual AJAX add-to-cart
    addToCartButton.addEventListener('click', function (event) {
        event.preventDefault();  // Prevent Odoo's default handler
        console.log("Step 16: Add to Cart button clicked! Preventing default. Current hidden price:", hiddenPriceInput ? hiddenPriceInput.value : "N/A");

        // Get current amount (from custom or selected radio)
        const selectedRadio = document.querySelector('input[name="donation_amount"]:checked');
        const amount = selectedRadio ? (selectedRadio.value === 'custom' ? parseFloat(customAmountInput.value) || 0 : parseFloat(selectedRadio.value) || 0) : 0;

        // Collect params for AJAX
        const params = {
            product_id: currentProductId,  // Key: Ensure this is correct!
            product_template_id: currentProductId,  // Fallback
            add_qty: 1,
            fixed_price: amount.toFixed(2),  // For variable-price/donations
            price: amount.toFixed(2),  // Fallback
            amount: amount.toFixed(2),  // Common for donations
            product_custom_attribute_values: JSON.stringify([]),  // Add if needed
        };

        console.log("Step 17: Preparing manual AJAX to /shop/cart/update_json with params:", params);

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
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log("Step 18: AJAX response:", data);
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
            // Success: Use data.result (the actual cart data)
            const result = data.result || {};
            console.log("Step 18: Result data:", result);
            if (result.quantity > 0 || (result.cart_quantity && result.cart_quantity > 0)) {
                alert("Added to cart successfully! Redirecting to cart...");
                window.location.href = '/shop/cart';  // Auto-redirect to confirm
            } else {
                console.warn("Step 18: No items added (quantity: " + (result.quantity || 0) + "). Warning:", result.warning || "None");
                alert("Item not added to cart. Check console for details: " + (result.warning || "Unknown issue"));
            }
        })
        .catch(error => {
            console.error("Step 18: AJAX failed:", error);
            alert("Error adding to cart: " + error.message);
        });
    });

    // Initial setup
    toggleCustomField();
    const initialAmount = document.querySelector('input[name="donation_amount"]:checked')?.value;
    if (initialAmount && initialAmount !== 'custom') {
        updatePrice(parseFloat(initialAmount) || 0);
    } else if (initialAmount === 'custom') {
        updatePrice(parseFloat(customAmountInput.value) || 0);
    }
    console.log("Step 12: Donation logic FULLY initialized! Events bound and ready. 🎉 (Added JSON-RPC wrapper for params)");
    return true;  // Success
}

// Run the logic when ready, with retries if needed
ready(function() {
    console.log("Step 6a: DOM is ready! Starting initialization.");
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
            console.error("Max retries reached. Check selectors.");
        }
    }, 500);
});

// End of file
console.log("Step 13: End of script reached. Success! (Outside ready)");
