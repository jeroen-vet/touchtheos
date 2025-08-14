from odoo import http
from odoo.http import request
from odoo.addons.website_sale.controllers.main import WebsiteSale

class WebsiteSaleExtended(WebsiteSale):
    @http.route(['/shop/cart/update'], type='http', auth="public", methods=['POST'], website=True)
    def cart_update(self, product_id, add_qty=1, set_qty=0, **kw):
        product = request.env['product.product'].sudo().browse(int(product_id))
        if product.name == 'One-Time Donation':  # Target specific product
            custom_amount = kw.get('donation_amount')
            if custom_amount:
                validated_amount = product.product_tmpl_id._get_donation_amount(custom_amount)
                # Override price for this cart item
                sale_order = request.website.sale_get_order(force_create=True)
                line = sale_order._cart_find_product_line(product.id)
                if line:
                    line[0].sudo().write({'price_unit': validated_amount})
                else:
                    sale_order._cart_update(product_id=product.id, add_qty=add_qty, set_qty=set_qty, product_custom_attribute_values=[{'attribute_value_id': False, 'custom_value': str(validated_amount)}])
                return request.redirect("/shop/cart")
        return super(WebsiteSaleExtended, self).cart_update(product_id, add_qty, set_qty, **kw)
