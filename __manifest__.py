{
    'name': 'Test Assets Module',
    'version': '1.0',
    'category': 'Hidden',
    'depends': ['website'],  # Minimal dep for frontend
    'assets': {
        'website.assets_frontend': [
            '/test_assets/static/src/js/test.js',
        ],
    },
    'installable': True,
    'auto_install': False,
}



