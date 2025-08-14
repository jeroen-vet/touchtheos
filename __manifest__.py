{
    'name': 'Touchtheos Custom Donation Module',  # Or whatever you have
    'version': '1.0',
    'category': 'Website',
    'summary': 'Add custom donation options to products',
    'depends': ['website_sale'],  # Essential for inheriting website_sale views
    'data': [
        'views/product_template.xml',
    ],
    'assets': {
        'web.assets_frontend': [  # This is the correct bundle for website JS
            'touchtheos/static/src/js/donation.js',  # Exact path to your JS file
        ],
    },
    'installable': True,
    'application': False,
}


