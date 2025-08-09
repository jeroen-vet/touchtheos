odoo.define('touchtheos.custom_donation', function (require) {
    'use strict';
    console.log('Touchtheos JS loaded! 🌊');  // Debug: Confirms module loaded

    var publicWidget = require('web.public.widget');

    publicWidget.registry.CustomDonation = publicWidget.Widget.extend({
        selector: '.oe_product',  // Targets product detail pages
        start: function () {
            console.log('Widget started! Ready for donations.');  // Debug
            this._super.apply(this, arguments);
            // Initial hide of custom amount
            $('#custom_amount').hide();
        },
        events: {
            'change input[name="donation_type"]': '_onChangeDonationType',
            'input #custom_amount': '_onChangeAmount',  // Use 'input' for real-time updates
        },
        _onChangeDonationType: function (ev) {
            try {
                var selectedValue = $(ev.currentTarget).val();
                console.log('Selected donation type:', selectedValue);  // Debug

                var customInput = $('#custom_amount');
                if (selectedValue === 'custom') {
                    customInput.show().focus();
                } else {
                    customInput.hide().val('');
                    this._updatePrice(parseFloat(selectedValue) || 0);
                }
            } catch (e) {
                console.error('Error in _onChangeDonationType:', e);
            }
        },
        _onChangeAmount: function (ev) {
            try {
                var amount = parseFloat($(ev.currentTarget).val()) || 0;
                console.log('Custom amount entered:', amount);  // Debug
                this._updatePrice(amount);
            } catch (e) {
                console.error('Error in _onChangeAmount:', e);
            }
        },
        _updatePrice: function (amount) {
            var priceDisplay = $('.oe_currency_value');
            if (priceDisplay.length) {
                priceDisplay.text(amount.toFixed(2));
                console.log('Price updated to:', amount.toFixed(2));  // Debug
            } else {
                console.warn('Price display element not found!');  // Debug if selector issue
            }
            // Optional: Update hidden form field for cart if needed, e.g., $('input[name="amount"]').val(amount);
        },
    });

    return publicWidget.registry.CustomDonation;
});
