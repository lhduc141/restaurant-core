import sequelize from "../src/config/database.js";

const migrateMenuItemData = async () => {
  const transaction = await sequelize.transaction();

  try {
    const [[{ legacyCount }]] = await sequelize.query(
      "SELECT COUNT(*) AS legacyCount FROM Menu_Item",
      { transaction }
    );

    const [[{ currentCount }]] = await sequelize.query(
      "SELECT COUNT(*) AS currentCount FROM MenuItem",
      { transaction }
    );

    console.log(`[menu-migrate] Before: Menu_Item=${legacyCount}, MenuItem=${currentCount}`);

    await sequelize.query(
      `
      INSERT INTO MenuItem (
        itemID,
        itemName,
        typeOfFood,
        price,
        descriptions,
        preparationTime,
        status,
        image,
        createdAt,
        updatedAt
      )
      SELECT
        itemID,
        itemName,
        type_of_food,
        CAST(price AS DECIMAL(10,2)),
        descriptions,
        CAST(preparation_time AS SIGNED),
        status,
        image,
        NOW(),
        NOW()
      FROM Menu_Item
      ON DUPLICATE KEY UPDATE
        itemName = VALUES(itemName),
        typeOfFood = VALUES(typeOfFood),
        price = VALUES(price),
        descriptions = VALUES(descriptions),
        preparationTime = VALUES(preparationTime),
        status = VALUES(status),
        image = VALUES(image),
        updatedAt = NOW()
      `,
      { transaction }
    );

    const [[{ maxID }]] = await sequelize.query(
      "SELECT COALESCE(MAX(itemID), 0) AS maxID FROM MenuItem",
      { transaction }
    );

    const nextAutoIncrement = Number(maxID) + 1;
    await sequelize.query(
      `ALTER TABLE MenuItem AUTO_INCREMENT = ${nextAutoIncrement}`,
      { transaction }
    );

    const [[{ migratedCount }]] = await sequelize.query(
      "SELECT COUNT(*) AS migratedCount FROM MenuItem",
      { transaction }
    );

    await transaction.commit();

    console.log(
      `[menu-migrate] After: Menu_Item=${legacyCount}, MenuItem=${migratedCount}, AUTO_INCREMENT=${nextAutoIncrement}`
    );
    console.log("[menu-migrate] Migration completed successfully.");
  } catch (error) {
    await transaction.rollback();
    console.error("[menu-migrate] Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

migrateMenuItemData();
