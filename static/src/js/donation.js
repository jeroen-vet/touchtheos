odoo.define('donation.donation', function (require) {
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
            var priceElement = $('.oe_currency_value');

            if (value === 'custom') {
                customField.show();
                var customVal = parseFloat($('#custom_donation').val()) || 100;
                this._updatePrice(customVal);
            } else {
                customField.hide();
                this._updatePrice(parseFloat(value));
            }
        },

        _onCustomInput: function (ev) {
            var value = parseFloat($(ev.currentTarget).val());
            if (isNaN(value) || value < 100) {
                $(ev.currentTarget).val(100);
                value = 100;
            }
            this._updatePrice(value);
        },

        _updatePrice: function (amount) {
            if (isNaN(amount)) amount = 100;
            $('.oe_currency_value').text(amount.toFixed(2));
            if (!$('#donation_amount_input').length) {
                $('form[action="/shop/cart/update"]').append('<input type="hidden" id="donation_amount_input" name="donation_amount" />');
            }
            $('#donation_amount_input').val(amount);
        },
    });

    return publicWidget.registry.DonationWidget;
});

