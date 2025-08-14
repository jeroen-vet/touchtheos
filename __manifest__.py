{
    'name': 'Touchtheos Donation',  # Friendly name
    'version': '1.0',
    'category': 'Website',
    'summary': 'Custom donation options for website shop',
    'description': 'Adds dynamic donation amounts to specific products.',
    'depends': ['website_sale'],  # Required for inheriting website_sale.product
    'data': [
        'views/product_template.xml',  # This is the key line! Registers your XML views
    ],
    'installable': True,
    'auto_install': False,
    'application': False,
}



