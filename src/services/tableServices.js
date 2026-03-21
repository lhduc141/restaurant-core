import bcrypt from "bcrypt";
import initModels from "../models/init-models.js";
import sequelize from "../config/database.js";
import {
  checkRefToken,
  checkToken,
  createRefToken,
  createToken,
  decodeToken,
} from "../config/jwt.js";
import Joi from "joi";
import { Sequelize } from "sequelize";
let Op = Sequelize.Op;


let model = initModels(sequelize);

export const signupService = async (
  role_id,
  email,
  password,
  name,
  quantity
) => {
  try {
    let check_user = await model.Account.findOne({
      where: { email },
    });

    if (check_user) {
      return { error: "Email exists, use another email", status: 400 };
    }

    let hashedPassword = bcrypt.hashSync(password, 10);
    let newUser = await model.Account.create({
      roleID: role_id,
      email,
      password: hashedPassword,
    });

    let roleDetails = null;

    switch (role_id) {
      case 1: // Table 
        const table = await model.TableEntity.create({
          userID: newUser.userID,
          tableName: name,
          quantity: quantity,
          status: 0, 
        });
        roleDetails = {
          role: "Table",
          tableName: table.tableName,
          quantity: table.quantity
        };
        break;
      case 2: // Admin
        const admin = await model.Admin.create({
          userID: newUser.userID,
          adminName: name
        });
        roleDetails = {
          role: "Admin",
          adminName: admin.adminName
        };
        break;
    }

    return {
      data: {
        userID: newUser.userID,
        roleID: newUser.roleID,
        email: newUser.email,
        role_details: roleDetails
      },
      status: 200
    };
  } catch (error) {
    console.error(error);
    return { error: "Error creating user", status: 500 };
  }
};



export const showMenuItemsService = async () => {
  try {
    // Fetch distinct types of food
    const types = await model.Menu_Item.findAll({
      attributes: ['type_of_food'],
      group: ['type_of_food'], // Get unique type_of_food values
      order: [['type_of_food', 'ASC']], // Sort types alphabetically
    });
    // Extract type_of_food values
    const typeNames = types.map(type => type.type_of_food);

    // // Initialize an array to hold grouped menu items
    const groupedMenuItems = [];

    // For each type_of_food, fetch corresponding menu items
    for (const type of typeNames) {
      const items = await model.Menu_Item.findAll({
        where: { type_of_food: type },
        attributes: [
          'itemID',
          'itemName',
          'type_of_food',
          'price',
          'descriptions',
          'preparation_time',
          'status'
        ],
        order: [['itemName', 'ASC']], // Sort items alphabetically within each type
      });

      // Add the type and its items to the grouped result
      groupedMenuItems.push({ type_of_food: type, items });
    }
      return { data: groupedMenuItems, status: 200 };

  } catch (err) {
      console.error(err);
      return { error: "Error showing ", status: 500 };
  }
};



export const registerCustomerService = async (      
  customerName,
  phone,
  age,
  tableID
) => {
  try {
    // Check if the table is vacant
    const table = await model.TableEntity.findOne({
      where: { tableID, Status: false }, // Status: false means vacant
    });
    if (!table) {
      return { error: "Table is already occupied or does not exist", status: 400 };
    }
    // Create a new customer
    const newCustomer = await model.Customer.create(
      {
        tableID,
        customerName: customerName,
        phone: phone,
        age: age,
      },
    );

    // Update the table's status to occupied
    table.status = true
    await table.save();
    return { data: newCustomer, status: 200 };


  } catch (err) {
      console.error(err);
      return { error: "Error registering the customer ", status: 500 };
  }
};



export const chooseMenuItemsService = async (
  customerID,
  items
) => {
  try {
    const chooseEntries = [];

      for (const item of items) {
        const { itemID, quantity, note } = item;

        // Fetch the original price of the item from Menu_Item table
        const menuItem = await model.Menu_Item.findOne({ where: { itemID } });
        
        if (!menuItem) {
          return { error: `Item with ID ${itemID} does not exist`, status: 404 };
        }
         // Calculate total price based on quantity
         const totalPrice = menuItem.price * quantity;

         // Create a new entry in the Choose table
         const newChoose = await model.Choose.create(
           {
             customerID,
             itemID,
             note: note || null,
             price: totalPrice,
             quantity,
             status: 'order', // Default status is 'order'
           }
         );

        //  // Add preparation_time to the response data
        //   const newChooseWithPrepTime = {
        //     ...newChoose.toJSON(), // Convert Sequelize instance to plain object
        //     preparation_time: menuItem.preparation_time,
        //   };
 
         chooseEntries.push(newChoose);
      }
    
      return { data: chooseEntries, status: 200 };

  } catch (err) {
      console.error(err);
      return { error: "Error choosing menu items ", status: 500 };
  }
};


export const editChosenItemsService = async (
  customerID,
  items
) => {
  try {
    const updatedItems = [];

      for (const item of items) {
        const { itemID, note, quantity, deleted } = item;
        // Find the chosen item
        const chosenItem = await model.Choose.findOne({
          where: {
            customerID,
            itemID,
            status: 'order', // Only allow edits for items with 'order' status
          },
        });

        if (!chosenItem) {
          return {
            error: `Item with ID ${itemID} either does not belong to customer ${customerID} or is not in 'order' status`,
            status: 404,
          };
        }
         // Validate quantity
         if (quantity <= 0) {
          return { error: `Quantity for item ${itemID} must be greater than 0`, status: 400 };
        }

        // Calculate the updated price (based on quantity and original price)
        const menuItem = await model.Menu_Item.findOne({ where: { itemID } });
        const updatedPrice = menuItem.price * quantity;

        // Update the chosen item
        chosenItem.note = note || chosenItem.note; // Update note if provided
        chosenItem.quantity = quantity || chosenItem.quantity; // Update quantity
        chosenItem.price = updatedPrice || chosenItem.price; // Update price
        chosenItem.deleted = deleted !== undefined ? deleted : chosenItem.deleted; // Update deleted if provided
        // Add preparation_time to the response data
 
        await chosenItem.save();

        updatedItems.push(chosenItem);

        if (!menuItem) {
          return { error: `Menu item with ID ${itemID} does not exist`, status: 404 };
        }
      }
    
      return { data: updatedItems, status: 200 };

  } catch (err) {
      console.error(err);
      return { error: "Error editing menu items ", status: 500 };
  }
};

export const checkoutBillService = async (
  customerID,
  payment_method, 
  feedback
) => {
  try {
    // Update the table status to 0 (vacant)
    const currentCustomer = await model.Customer.findOne({
      where: { customerID },
    });

    const currentTable = await model.TableEntity.findOne({
      where: {
        tableID: currentCustomer.tableID
      }
    })

    if (!currentTable) {
      return res.status(404).json({ error: "Table not found" });
    }
    
    // Check if the table's status is 0 (vacant)
    if (currentTable.status == 0) {
      return res.status(400).json({ error: "Table is vacant. Cannot proceed." });
    }

    // Find all Choose records for the customer with status NOT 'order' and deleted == 0
    const chosenItems = await model.Choose.findAll({
      where: {
        customerID,
        status: { [Op.ne]: 'order' }, // Not 'order'
        deleted: false,
      }
    });
    if (!chosenItems.length) {
      return { error: "No items found to checkout for this customer", status: 400 };
    }
    // Calculate total price
    const totalPrice = chosenItems.reduce((sum, item) => sum + item.price, 0);
    // Create a transaction record
    const transactionRecord = await model.Transaction.create(
      {
        customerID,
        payment_method,
        feedback,
        totalPrice,
      }
    );
    // Create orders for each chosen item
    const orders = [];
    for (const chosenItem of chosenItems) {
      const order = await model.Order.create(
        {
          transactionID: transactionRecord.transactionID,
          chooseID: chosenItem.chooseID,
        },
      );
      orders.push(order);
    }
    
    
    currentTable.status = 0; // Set table status to vacant
    await currentTable.save();

      return { data: { 
        transaction: transactionRecord,
        orders 
      }, status: 200 };

  } catch (err) {
      console.error(err);
      return { error: "Error checking out bill", status: 500 };
  }
};



export const getChosenItemsService = async (customerID) => {
  try {
    // Fetch distinct types of food
    const types = await model.Choose.findAll({
      where:{customerID},
      attributes: ['status'],
      group: ['status'], // Get unique type_of_food values
      order: [['status', 'ASC']], // Sort types alphabetically
    });
    // Extract type_of_food values
    const typeNames = types.map(type => type.status);

    // // Initialize an array to hold grouped menu items
    const groupedMenuItems = [];

    // For each type_of_food, fetch corresponding menu items
    for (const type of typeNames) {
      const items = await model.Choose.findAll({
        where: { 
          status: type,
          customerID: customerID
         },
        attributes: [
          'itemID',
          'note',
          'price',
          'quantity',
          'status'
        ],
        include: [
          {
            model: model.Menu_Item,
            as: 'item', // Assuming a proper association exists
            attributes: ['itemName','type_of_food', 'descriptions','preparation_time'], // Include menu item details
          },
        ],
      });


      // Add the type and its items to the grouped result
      groupedMenuItems.push({ status: type, items });
    }
      return { data: groupedMenuItems, status: 200 };

  } catch (err) {
      console.error(err);
      return { error: "Error showing ", status: 500 };
  }
};
