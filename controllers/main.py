from odoo import http
from odoo.http import request
from odoo.addons.website_sale.controllers.main import WebsiteSale

class CustomWebsiteSale(WebsiteSale):
    @http.route(['/shop/cart/update_json'], type='json', auth="public", methods=['POST'], website=True, csrf=False)
    def cart_update_json(self, product_id, line_id=None, add_qty=None, set_qty=None, display=True, **kw):
        # Add custom price handling
        fixed_price = kw.get('fixed_price') or kw.get('price_unit')
        if fixed_price:
            # Find or create the line and set price
            order = request.website.sale_get_order()
            line = order.order_line.filtered(lambda l: l.product_id.id == int(product_id))
            if line:
                line.price_unit = float(fixed_price)
        return super().cart_update_json(product_id, line_id, add_qty, set_qty, display, **kw)