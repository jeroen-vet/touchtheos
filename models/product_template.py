from odoo import models

class ProductTemplate(models.Model):
    _inherit = 'product.template'

    def _get_donation_amount(self, amount):
        try:
            amount = float(amount)
            if amount < 100:
                return 100.0
            return amount
        except ValueError:
            return 100.0
