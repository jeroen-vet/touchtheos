{
    'name': 'Touchtheos Custom Donation',
    'version': '1.0',
    'category': 'Website',
    'summary': 'Custom JS for donation product page',
    'description': 'Adds radio buttons, custom amount field, and JS logic for hiding/showing and price updates.',
    'depends': ['website_sale'],  # Requires the eCommerce module
    'data': [
        'views/product_template.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            '/touchtheos_custom/static/src/js/custom_donation.js',
        ],
    },
    'installable': True,
    'auto_install': False,
}
