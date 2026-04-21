import {
  getMenuTool,
  searchDishTool,
  getDishDetailTool,
  getDishIngredientsTool,
} from "./tool-handlers/menu.tools.js";
import {
  addToCartTool,
  removeFromCartTool,
  viewCartTool,
} from "./tool-handlers/cart.tools.js";
import {
  prepareOrderSubmissionTool,
  openBillTool,
} from "./tool-handlers/order.tools.js";
import {
  setTabTool,
  filterMenuSectionTool,
  highlightDishTool,
  openDishDetailTool,
} from "./tool-handlers/ui.tools.js";

export const tools = [
  getMenuTool,
  searchDishTool,
  getDishDetailTool,
  getDishIngredientsTool,
  addToCartTool,
  removeFromCartTool,
  viewCartTool,
  prepareOrderSubmissionTool,
  openBillTool,
  setTabTool,
  filterMenuSectionTool,
  highlightDishTool,
  openDishDetailTool,
];