from odoo import http
from odoo.http import request
from odoo.addons.website_sale.controllers.main import WebsiteSale

class WebsiteSaleExtended(WebsiteSale):

    @http.route(['/shop/cart/update_json'], type='json', auth="public", methods=['POST'], website=True, csrf=False)
    def cart_update_json(self, product_id, line_id=None, add_qty=None, set_qty=None, display=True, **kw):
        print("DEBUG: Custom cart_update_json ENTERED! Incoming product_id=%s, template_id=%s, params=%s" % (product_id, kw.get('product_template_id'), kw))  # Debug: Confirm call and params

        # Call the original method to handle standard cart update
        result = super(WebsiteSaleExtended, self).cart_update_json(product_id, line_id, add_qty, set_qty, display, **kw)

        # Custom logic: Override price for donation product template (ID 3)
        donation_template_id = 3  # Your template ID
        order = request.website.sale_get_order()
        if order:
            # Find lines matching the template (handles any variants)
            lines = order.order_line.filtered(lambda l: l.product_id.product_tmpl_id.id == donation_template_id)
            if lines:
                # Get custom price from params (fallbacks, ensure it's a float)
                custom_price_str = kw.get('fixed_price') or kw.get('price_unit') or kw.get('amount') or kw.get('price') or kw.get('set_price') or '0.0'
                try:
                    custom_price = float(custom_price_str)
                except ValueError:
                    custom_price = 0.0
                if custom_price <= 0:
                    custom_price = 0.01  # Minimum to ensure rendering and avoid Odoo complaints
                print("DEBUG: Found %s matching lines. Setting price_unit=%s (parsed from '%s')" % (len(lines), custom_price, custom_price_str))  # Debug

                for line in lines:
                    line.price_unit = custom_price
                    line._onchange_product_id()  # Recompute taxes/etc.
                
                order._compute_amounts()  # Update totals
                
                # Update result with new data
                result['amount'] = order.amount_total
                result['minor_amount'] = int(order.amount_total * 100)  # For payment if needed
                # Re-render cart HTML to reflect changes
                result['website_sale.cart_lines'] = request.env['ir.ui.view']._render_template('website_sale.cart_lines', {'website_sale_order': order})
                result['website_sale.total'] = request.env['ir.ui.view']._render_template('website_sale.total', {'website_sale_order': order})
                
                print("DEBUG: Price override APPLIED! New total=%s, rendered cart_lines length=%s" % (order.amount_total, len(result['website_sale.cart_lines'])))  # Debug
            else:
                print("DEBUG: No matching lines found for template %s" % donation_template_id)  # Debug if skipped
        else:
            print("DEBUG: No order found in session")  # Debug if skipped

        print("DEBUG: Custom cart_update_json EXITING with result amount=%s" % result.get('amount'))  # Final debug
        return result
