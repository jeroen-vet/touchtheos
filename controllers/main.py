from odoo import http
from odoo.http import request
from odoo.addons.website_sale.controllers.main import WebsiteSale

class CustomWebsiteSale(WebsiteSale):
    @http.route(['/shop/cart/update_json'], type='json', auth="public", methods=['POST'], website=True, csrf=False)
    def cart_update_json(self, product_id, line_id=None, add_qty=None, set_qty=None, display=True, **kw):
        # Call the original method to add/update the line normally
        response = super(CustomWebsiteSale, self).cart_update_json(product_id, line_id, add_qty, set_qty, display, **kw)

        # Now, check for custom price param and apply it if present
        fixed_price = kw.get('fixed_price') or kw.get('price_unit') or kw.get('price')
        if fixed_price:
            try:
                price = float(fixed_price)
                order = request.website.sale_get_order()
                # Find the newly added/updated line (by product_id, since line_id might not be reliable)
                line = order.order_line.filtered(lambda l: l.product_id.id == int(product_id))[-1]  # Get the last matching line
                if line:
                    line.price_unit = price  # Override the price_unit
                    line._compute_amount()  # Recompute line totals
                    order._compute_amounts()  # Recompute order totals
                    # Update the response with new HTML snippets to reflect the change
                    response['result']['amount'] = order.amount_total
                    response['result']['website_sale.total'] = request.env['ir.ui.view']._render_template('website_sale.total', {'website_sale_order': order})
                    response['result']['website_sale.cart_lines'] = request.env['ir.ui.view']._render_template('website_sale.cart_lines', {'website_sale_order': order})
            except ValueError:
                pass  # Ignore if price isn't a valid float

        return response
