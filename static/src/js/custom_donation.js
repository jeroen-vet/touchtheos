console.log("Touchtheos JS loaded! 🌊");

function initializeDonationLogic() {
    console.log("Attempting to initialize donation logic...");

    // Selectors (adjust these if inspection shows different ones)
    const donationOptions = document.querySelector('.donation-options');
    const customAmountInput = document.querySelector('#custom_amount');
    const radioInputs = document.querySelectorAll('input[name="donation_amount"]');
    const priceElement = document.querySelector('.oe_currency_value');  // Common Odoo price selector; adjust based on inspection

    // Debugging logs
    console.log("Found donation options:", !!donationOptions);
    console.log("Found custom input:", !!customAmountInput, "(Value:", customAmountInput ? customAmountInput.value : "N/A)");
    console.log("Found radio inputs:", radioInputs.length);
    radioInputs.forEach((radio, index) => console.log(`Radio ${index}: name=${radio.name}, value=${radio.value}, checked=${radio.checked}`));
    console.log("Found price element:", !!priceElement, "(Current text:", priceElement ? priceElement.textContent : "N/A)");

    if (!donationOptions || !customAmountInput || radioInputs.length === 0 || !priceElement) {
        console.warn("Some elements not found yet. Will retry...");
        return false;  // Not ready; retry later
    }

    // Toggle function
    function toggleCustomField() {
        const selectedValue = document.querySelector('input[name="donation_amount"]:checked')?.value || 'none';
        customAmountInput.style.display = (selectedValue === 'custom') ? 'block' : 'none';
        if (selectedValue === 'custom') customAmountInput.focus();
        console.log("Toggled custom field. Visible:", selectedValue === 'custom', "(Selected:", selectedValue, ")");
    }

    // Update price function
    function updatePrice(amount) {
        priceElement.textContent = amount.toFixed(2);
        console.log("Price updated to:", amount);
    }

    // Bind events
    radioInputs.forEach(radio => {
        radio.addEventListener('change', function () {
            const amount = this.value;
            console.log("Radio change detected! Amount:", amount);
            if (amount !== 'custom') {
                updatePrice(parseFloat(amount) || 0);
            }
            toggleCustomField();
        });
    });

    customAmountInput.addEventListener('input', function () {
        const customAmount = parseFloat(this.value) || 0;
        console.log("Custom input detected! Amount:", customAmount);
        updatePrice(customAmount);
    });

    // Initial setup
    toggleCustomField();
    console.log("Donation logic FULLY initialized! Events bound and ready.");
    return true;  // Success
}

// Run on DOMContentLoaded, then retry every 500ms if needed
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded. Starting initialization.");
    if (initializeDonationLogic()) return;  // Success on first try

    // Retry mechanism for dynamic content
    const retryInterval = setInterval(() => {
        if (initializeDonationLogic()) clearInterval(retryInterval);
    }, 500);
});
