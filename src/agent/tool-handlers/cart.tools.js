const cartStore = new Map();

function getUserCart(userId) {
    if (!cartStore.has(userId)) {
        cartStore.set(userId, []);
    }
    return cartStore.get(userId);
}

function setUserCart(userId, cart) {
    cartStore.set(userId, cart);
    return cart;
}

function getDishId(item) {
    return item?.itemID ?? item?.id ?? null;
}

export const addToCartTool = {
    name: "add_to_cart",
    description: "Add a menu item to the temporary agent cart",
    parameters: {
        type: "object",
        properties: {
            dishId: { type: "number" },
            quantity: { type: "number" },
            note: { type: "string" },
        },
        required: ["dishId", "quantity"],
    },
    async execute({ userId, context, args }) {
        const menuItems = Array.isArray(context?.menuItems) ? context.menuItems : [];
        const dish = menuItems.find((item) => getDishId(item) === args.dishId);

        if (!dish) {
            return { error: "Dish not found" };
        }

        const cart = getUserCart(userId);
        const existing = cart.find((item) => item.dishId === args.dishId);

        if (existing) {
            existing.quantity += Number(args.quantity || 1);
            if (typeof args.note === "string") {
                existing.note = args.note;
            }
        } else {
            cart.push({
                dishId: args.dishId,
                itemID: args.dishId,
                quantity: Number(args.quantity || 1),
                note: typeof args.note === "string" ? args.note : "",
                menuItem: dish,
            });
        }

        return {
            ok: true,
            cart,
        };
    },
};

export const removeFromCartTool = {
    name: "remove_from_cart",
    description: "Remove a menu item from the temporary agent cart",
    parameters: {
        type: "object",
        properties: {
            dishId: { type: "number" },
        },
        required: ["dishId"],
    },
    async execute({ userId, args }) {
        const cart = getUserCart(userId).filter((item) => item.dishId !== args.dishId);
        setUserCart(userId, cart);

        return {
            ok: true,
            cart,
        };
    },
};

export const viewCartTool = {
    name: "view_cart",
    description: "View the current temporary cart",
    parameters: {
        type: "object",
        properties: {},
    },
    async execute({ userId }) {
        return {
            cart: getUserCart(userId),
        };
    },
};