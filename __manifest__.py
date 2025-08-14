{
    'name': 'Touchtheos Donation Module',
    'version': '1.0',
    'category': 'Website',
    'summary': 'Add custom donation options to products',
    'depends': ['website', 'website_sale'],  # Added 'website' for better frontend deps
    'data': [
        'views/product_template.xml',
    ],
    'assets': {
        'website.assets_frontend': [  # Changed to website-specific bundle
            '/touchtheos/static/src/js/donation.js',  # Added leading '/' for absolute path (Odoo convention)
        ],
    },
    'installable': True,
    'application': False,
}



