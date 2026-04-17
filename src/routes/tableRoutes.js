import express from 'express';
import TableController from '../controllers/tableController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { ROLE } from '../constant/enum.js';

const router = express.Router();

router.use(requireAuth);

router.get('/v1/menu/:customerID/choose', TableController.getChosenItems);
router.get('/v1/orders/:customerID/bill', TableController.getBill);
router.get('/v1/menu-item', TableController.showMenuItems);

router.post('/v1/:tableID/customers', requireRole(ROLE.STAFF), TableController.registerCustomer);
router.post('/v1/menu/:customerID/choose', requireRole(ROLE.STAFF), TableController.chooseMenuItems);
router.put('/v1/menu/:customerID/choose', requireRole(ROLE.STAFF), TableController.editChosenItems);
router.post('/v1/menu/:customerID/submit', requireRole(ROLE.STAFF), TableController.submitOrder);
router.post('/v1/orders/:customerID/checkout', requireRole(ROLE.STAFF), TableController.checkoutBill);

export default router;
