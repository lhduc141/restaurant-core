import express from 'express';
import TableController from '../controllers/tableController.js';

const router = express.Router();

router.post('/v1/:tableID/customers', TableController.registerCustomer);
router.get('/v1/menu/:customerID/choose', TableController.getChosenItems);
router.post('/v1/menu/:customerID/choose', TableController.chooseMenuItems);
router.put('/v1/menu/:customerID/choose', TableController.editChosenItems);
router.post('/v1/orders/:customerID/checkout', TableController.checkoutBill);
router.get('/v1/menu-item', TableController.showMenuItems);

export default router;
