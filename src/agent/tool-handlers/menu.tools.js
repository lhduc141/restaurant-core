const normalize = (value) => String(value || "").trim().toLowerCase();

function findItemId(item) {
    return item?.itemID ?? item?.id ?? null;
}

function matchesKeyword(item, keyword) {
    const q = normalize(keyword);
    if (!q) return true;

    const candidates = [
        item?.itemName,
        item?.name,
        item?.description,
        item?.type_of_food,
        item?.category,
    ]
        .filter(Boolean)
        .map((x) => normalize(x));

    return candidates.some((x) => x.includes(q));
}

function matchesSection(item, section) {
    const q = normalize(section);
    if (!q) return true;

    const sectionFields = [
        item?.type_of_food,
        item?.category,
        item?.section,
        item?.groupName,
    ]
        .filter(Boolean)
        .map((x) => normalize(x));

    return sectionFields.some((x) => x.includes(q));
}

export const getMenuTool = {
    name: "get_menu",
    description: "Get menu items from provided context data",
    parameters: {
        type: "object",
        properties: {
            section: { type: "string" },
            keyword: { type: "string" },
        },
    },
    async execute({ context, args }) {
        const menuItems = Array.isArray(context?.menuItems) ? context.menuItems : [];

        const items = menuItems.filter(
            (item) =>
                matchesSection(item, args?.section || "") &&
                matchesKeyword(item, args?.keyword || "")
        );

        return {
            count: items.length,
            items: items.slice(0, 20),
        };
    },
};

export const searchDishTool = {
    name: "search_dish",
    description: "Search a dish by name or keyword",
    parameters: {
        type: "object",
        properties: {
            query: { type: "string" },
        },
        required: ["query"],
    },
    async execute({ context, args }) {
        const menuItems = Array.isArray(context?.menuItems) ? context.menuItems : [];
        const items = menuItems.filter((item) => matchesKeyword(item, args.query));

        return {
            count: items.length,
            items: items.slice(0, 10),
        };
    },
};

export const getDishDetailTool = {
    name: "get_dish_detail",
    description: "Get a single dish detail from context",
    parameters: {
        type: "object",
        properties: {
            dishId: { type: "number" },
        },
        required: ["dishId"],
    },
    async execute({ context, args }) {
        const menuItems = Array.isArray(context?.menuItems) ? context.menuItems : [];
        const dish = menuItems.find((item) => findItemId(item) === args.dishId);

        if (!dish) {
            return { error: "Dish not found" };
        }

        return { dish };
    },
};

export const getDishIngredientsTool = {
    name: "get_dish_ingredients",
    description: "Get ingredients of a dish when available in context",
    parameters: {
        type: "object",
        properties: {
            dishId: { type: "number" },
        },
        required: ["dishId"],
    },
    async execute({ context, args }) {
        const menuItems = Array.isArray(context?.menuItems) ? context.menuItems : [];
        const dish = menuItems.find((item) => findItemId(item) === args.dishId);

        if (!dish) {
            return { error: "Dish not found" };
        }

        return {
            dishId: args.dishId,
            ingredients:
                dish.ingredients ||
                dish.ingredient ||
                dish.recipe ||
                dish.description ||
                "Ingredients are not available in the current dataset.",
        };
    },
};