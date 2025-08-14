odoo.define('custom_donation.donation', function (require) {
    'use strict';

    var publicWidget = require('web.public.widget');

    publicWidget.registry.DonationWidget = publicWidget.Widget.extend({
        selector: '.donation-options',
        events: {
            'change .donation-radio': '_onChangeAmount',
            'input #custom_donation': '_onCustomInput',
        },

        _onChangeAmount: function (ev) {
            var value = $(ev.currentTarget).val();
            var customField = $('#custom-amount-field');
            var priceElement = $('.oe_currency_value');  // Odoo's price display element

            if (value === 'custom') {
                customField.show();
                var customVal = $('#custom_donation').val() || 100;
                this._updatePrice(customVal);
            } else {
                customField.hide();
                this._updatePrice(value);
            }
        },

        _onCustomInput: function (ev) {
            var value = $(ev.currentTarget).val();
            if (value < 100) {
                $(ev.currentTarget).val(100);  // Enforce min
                value = 100;
            }
            this._updatePrice(value);
        },

        _updatePrice: function (amount) {
            $('.oe_currency_value').text(parseFloat(amount).toFixed(2));
            // Also update the hidden input for cart submission if needed
            if (!$('#donation_amount_input').length) {
                $('form[action="/shop/cart/update"]').append('<input type="hidden" id="donation_amount_input" name="donation_amount" />');
            }
            $('#donation_amount_input').val(amount);
        },
    });

    return publicWidget.registry.DonationWidget;
});
