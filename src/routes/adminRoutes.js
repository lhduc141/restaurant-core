import express from 'express';
import AdminController from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middlewares/auth.js';
import { ROLE } from '../constant/enum.js';

const router = express.Router();

router.use(requireAuth, requireRole(ROLE.ADMIN));

router.put('/v1/:adminID/tables/status', AdminController.editStatusOfMenuItems);
router.patch('/v1/:adminID/tables/:tableID/status', AdminController.updateTableStatus);
router.get('/v1/tables', AdminController.getItemsOfTables);
router.get('/v1/tables/:tableID', AdminController.getTableDetail);
router.get('/v1/revenue', AdminController.getDailyRevenue);
router.get('/v1/transaction', AdminController.viewDetailTransaction);
router.patch('/v1/:adminID/transactions/:transactionID/confirm-payment', AdminController.confirmPayment);
router.get('/v1/vacant', AdminController.listTables);
router.put('/v1/edit_menu', AdminController.editMenu);
router.post('/v1/new_dish', AdminController.addNewFood);

export default router;
