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

    // Selectors - adjust these based on your HTML inspection if needed
    const donationOptions = document.querySelector('.donation-options');  // Wrapper for radios, if it exists
    const customAmountInput = document.querySelector('#custom_amount');
    const radioInputs = document.querySelectorAll('input[name="donation_amount"]');
    const priceElement = document.querySelector('.oe_product .oe_currency_value');  // Common Odoo price selector; inspect to confirm

    // Debugging logs
    console.log("Found donation options wrapper:", !!donationOptions);
    console.log("Found custom input:", !!customAmountInput, "(ID: #custom_amount)");
    console.log("Found radio inputs:", radioInputs.length);
    radioInputs.forEach((radio, index) => {
        console.log(`Radio ${index}: value=${radio.value}, checked=${radio.checked}`);
    });
    console.log("Found price element:", !!priceElement, "(Current text:", priceElement ? priceElement.textContent : "N/A)");

    if (radioInputs.length === 0 || !customAmountInput || !priceElement) {
        console.warn("Step 7: Some elements not found yet. Will retry...");
        return false;  // Not ready; retry later
    }

    // Toggle custom field function
    function toggleCustomField() {
        const selectedValue = document.querySelector('input[name="donation_amount"]:checked')?.value || 'none';
        customAmountInput.style.display = (selectedValue === 'custom') ? 'block' : 'none';
        if (selectedValue === 'custom') customAmountInput.focus();
        console.log("Step 8: Toggled custom field. Visible:", selectedValue === 'custom', "(Selected:", selectedValue, ")");
    }

    // Update price function
    function updatePrice(amount) {
        priceElement.textContent = amount.toFixed(2);
        console.log("Step 9: Price updated to:", amount.toFixed(2));
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

    // Initial setup
    toggleCustomField();
    console.log("Step 12: Donation logic FULLY initialized! Events bound and ready. 🎉");
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
            console.error("Max retries reached. Elements not found. Check selectors/HTML.");
        }
    }, 500);
});

// End of file
console.log("Step 13: End of script reached. Success! (Outside ready)");
