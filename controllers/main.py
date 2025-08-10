from odoo import http
from odoo.http import request
from odoo.addons.website_sale.controllers.main import WebsiteSale

class WebsiteSaleExtended(WebsiteSale):

    @http.route(['/shop/cart/update_json'], type='json', auth="public", methods=['POST'], website=True, csrf=False)
    def cart_update_json(self, product_id, line_id=None, add_qty=None, set_qty=None, display=True, **kw):
        print("DEBUG: Custom cart_update_json called! Incoming product_id=%s, params=%s" % (product_id, kw))  # Debug: Confirm entry

        # Call the original method to handle standard cart update
        result = super(WebsiteSaleExtended, self).cart_update_json(product_id, line_id, add_qty, set_qty, display, **kw)

        # Custom logic: Override price for donation product template (ID 3)
        donation_template_id = 3  # Your template ID
        order = request.website.sale_get_order()
        if order:
            # Find lines matching the template (handles variants)
            lines = order.order_line.filtered(lambda l: l.product_id.product_tmpl_id.id == donation_template_id)
            if lines:
                # Get custom price from params (fallbacks)
                custom_price = float(kw.get('fixed_price') or kw.get('price_unit') or kw.get('amount') or kw.get('price') or kw.get('set_price') or 0.0)
                if custom_price <= 0:
                    custom_price = 0.01  # Minimum to avoid "unknown price" popup; adjust or remove
                print("DEBUG: Found %s matching lines. Setting price_unit=%s (from param %s)" % (len(lines), custom_price, kw.get('fixed_price')))  # Debug

                for line in lines:
                    line.price_unit = custom_price
                    line._onchange_product_id()  # Recompute taxes/etc.
                
                order._compute_amounts()  # Update totals
                
                # Update result with new data
                result['amount'] = order.amount_total
                result['minor_amount'] = int(order.amount_total * 100)  # If needed for payment
                # Re-render cart HTML to reflect changes
                result['website_sale.cart_lines'] = request.env['ir.ui.view']._render_template('website_sale.cart_lines', {'website_sale_order': order})
                result['website_sale.total'] = request.env['ir.ui.view']._render_template('website_sale.total', {'website_sale_order': order})
                
                print("DEBUG: Price override applied! New total=%s" % order.amount_total)  # Debug

        return result

