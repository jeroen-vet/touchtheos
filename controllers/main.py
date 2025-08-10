from odoo import http
from odoo.http import request
from odoo.addons.website_sale.controllers.main import WebsiteSale

class WebsiteSaleExtended(WebsiteSale):

    @http.route(['/shop/cart/update_json'], type='json', auth="public", methods=['POST'], website=True, csrf=False)
    def cart_update_json(self, product_id, line_id=None, add_qty=None, set_qty=None, display=True, **kw):
        # Call the original method to handle standard cart update
        result = super(WebsiteSaleExtended, self).cart_update_json(product_id, line_id, add_qty, set_qty, display, **kw)

        # Custom logic: Override price for donation product (ID 3)
        donation_product_id = 3  # Your product ID; update if needed
        if int(product_id) == donation_product_id:
            order = request.website.sale_get_order()
            if order:
                # Find the newly added/updated line (last one matching product)
                lines = order.order_line.filtered(lambda l: l.product_id.id == donation_product_id)
                if lines:
                    line = lines[-1]  # Last one is the newest
                    # Get custom price from params (fallbacks: fixed_price > price_unit > amount > price)
                    custom_price = float(kw.get('fixed_price') or kw.get('price_unit') or kw.get('amount') or kw.get('price') or 0.0)
                    if custom_price > 0:
                        line.price_unit = custom_price
                        line._onchange_product_id()  # Recompute taxes/etc.
                        order._compute_amounts()  # Update totals
                        # Update result with new totals (for JS response)
                        result['amount'] = order.amount_total
                        # Optionally update cart_lines HTML (re-render if needed)
                        result['website_sale.cart_lines'] = request.env['ir.ui.view']._render_template('website_sale.cart_lines', {'website_sale_order': order})
                        result['website_sale.total'] = request.env['ir.ui.view']._render_template('website_sale.total', {'website_sale_order': order})

        return result