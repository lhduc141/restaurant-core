// src/routes/User/UserLayout.jsx
import { Outlet, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useRestaurantAgent } from "../../agent/useRestaurantAgent";
import VoiceAssistantButton from "../../components/VoiceAssistantButton";
import AgentTranscriptPanel from "../../components/AgentTranscriptPanel";

export default function UserLayout() {
    const navigate = useNavigate();

    const helpers = useMemo(
        () => ({
            navigate,
            setMenuFilter: (section) => {
                window.dispatchEvent(
                    new CustomEvent("agent:set-menu-filter", { detail: { section } })
                );
            },
            openDishDetail: (dishId) => {
                window.dispatchEvent(
                    new CustomEvent("agent:open-dish-detail", { detail: { dishId } })
                );
            },
            highlightDish: (dishId) => {
                window.dispatchEvent(
                    new CustomEvent("agent:highlight-dish", { detail: { dishId } })
                );
            },
            setCart: (cart) => {
                window.dispatchEvent(
                    new CustomEvent("agent:set-cart", { detail: { cart } })
                );
            },
        }),
        [navigate]
    );

    const agent = useRestaurantAgent({
        userId: "guest", // thay bằng current logged-in user id nếu có
        helpers,
    });

    return (
        <>
            <Outlet />
            <VoiceAssistantButton agent={agent} />
            <AgentTranscriptPanel
                messages={agent.messages}
                isLoading={agent.isLoading}
            />
        </>
    );
}