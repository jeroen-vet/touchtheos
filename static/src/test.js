odoo.define('test_assets/test', function (require) {
    'use strict';
    console.log('TEST: test.js is loading');

    try {
        var publicWidget = require('web.public.widget');
        console.log('TEST: Successfully loaded web.public.widget in test module!');
    } catch (e) {
        console.error('ERROR in test module: Failed to load web.public.widget', e);
    }

    console.log('TEST: test.js fully loaded');
});
