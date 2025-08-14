{
    'name': 'Touchtheos Donation Module',
    'version': '1.0',
    'category': 'Website',
    'summary': 'Custom donation options for one-time donations',
    'description': 'Adds dynamic donation amounts to the one-time donation product.',
    'depends': ['website_sale'],  # Depends on e-commerce module
    'data': [
        'views/product_template.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'touchtheos/static/src/js/donation.js',
        ],
    },
    'installable': True,
    'auto_install': False,
}

