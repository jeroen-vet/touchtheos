import logging
from odoo import http
from odoo.http import request
from odoo.addons.website_sale.controllers.main import WebsiteSale

_logger = logging.getLogger(__name__)

class WebsiteSaleExtended(WebsiteSale):
    @http.route(['/shop/cart/update'], type='http', auth="public", methods=['POST'], website=True)
    def cart_update(self, product_id, add_qty=1, set_qty=0, **kw):
        try:
            # Call super first to perform the standard cart update
            response = super(WebsiteSaleExtended, self).cart_update(product_id, add_qty, set_qty, **kw)
            
            # Now check if it's our donation product and override price if needed
            product = request.env['product.product'].sudo().browse(int(product_id))
            if product.name == 'One-Time Donation':  # Replace with your exact product name if different
                custom_amount = kw.get('donation_amount')
                if custom_amount:
                    validated_amount = product.product_tmpl_id._get_donation_amount(custom_amount)
                    sale_order = request.website.sale_get_order()
                    if sale_order:
                        lines = sale_order._cart_find_product_line(product.id)
                        if lines:
                            lines[0].sudo().write({'price_unit': validated_amount})
                            _logger.info(f"Donation price overridden to {validated_amount} for order {sale_order.id}")
                        else:
                            _logger.warning(f"No cart line found for product {product.id}")
            
            return response  # Return the super response (e.g., redirect to cart)
        except Exception as e:
            _logger.error(f"Error in custom cart_update: {str(e)}")
            return super(WebsiteSaleExtended, self).cart_update(product_id, add_qty, set_qty, **kw)  # Fallback to default
