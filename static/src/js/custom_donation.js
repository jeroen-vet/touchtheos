console.log("Touchtheos JS loaded! 🌊");  // Confirm the file is included

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded. Initializing donation logic.");

    // Selectors (adjust if your page structure differs)
    const donationOptions = document.querySelector('.donation-options');
    const customAmountInput = document.querySelector('#custom_amount');
    const radioInputs = document.querySelectorAll('input[name="donation_amount"]');
    const priceElement = document.querySelector('.oe_product .oe_currency_value');  // More specific: Within product container

    if (!donationOptions || !customAmountInput || radioInputs.length === 0) {
        console.error("Required elements not found! Check XML injection and selectors.");
        return;  // Exit if elements are missing
    }
    if (!priceElement) {
        console.warn("Price element not found! Selector: .oe_product .oe_currency_value");
    }

    // Function to toggle custom field visibility
    function toggleCustomField() {
        const selectedValue = document.querySelector('input[name="donation_amount"]:checked').value;
        customAmountInput.style.display = (selectedValue === 'custom') ? 'block' : 'none';
        if (selectedValue === 'custom') {
            customAmountInput.focus();
        }
        console.log("Toggled custom field. Visible:", selectedValue === 'custom');
    }

    // Function to update price
    function updatePrice(amount) {
        if (priceElement) {
            priceElement.textContent = amount.toFixed(2);
            console.log("Price updated to:", amount);
        } else {
            console.warn("No price element to update!");
        }
    }

    // Event listeners for radio changes
    radioInputs.forEach(radio => {
        radio.addEventListener('change', function () {
            const amount = this.value;
            console.log("Selected amount:", amount);
            try {
                if (amount !== 'custom') {
                    updatePrice(parseFloat(amount));
                }
                toggleCustomField();
            } catch (error) {
                console.error("Error handling radio change:", error);
            }
        });
    });

    // Event listener for custom amount input
    customAmountInput.addEventListener('input', function () {
        const customAmount = parseFloat(this.value) || 0;
        console.log("Custom amount updated:", customAmount);
        try {
            updatePrice(customAmount);
        } catch (error) {
            console.error("Error handling custom input:", error);
        }
    });

    // Initial setup (e.g., hide custom field if not selected by default)
    toggleCustomField();
    console.log("Donation logic initialized! Ready for interactions.");
});
