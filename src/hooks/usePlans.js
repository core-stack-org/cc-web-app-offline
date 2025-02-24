import { create } from "zustand";

const usePlansStore = create((set) => ({
    currentPlan: null,
    plans: null,
    isOffline: localStorage.getItem("isOffline"),
    focusTrigger: false,

    //? Store Zoom levels and map center also
    zoomLevel: null,
    mapCenter: null,

    setOfflineMode: (status) => {
        localStorage.setItem("isOffline", status);
        set({ isOffline: status === "true" });
    },

    loadPlansFromUrl: () => {
        try {
            const plansData = localStorage.getItem("plans");
            const parsedData = JSON.parse(decodeURIComponent(plansData));
            if (parsedData && parsedData.plans) {
                set({ plans: parsedData.plans });
                console.log('Successfully loaded plans from localStorage');
            }
        } catch (error) {
            console.error('Error loading plans from localStorage:', error);
        }
    },

    fetchPlans: async (url) => {
        if (localStorage.getItem("isOffline") === "true") {
            console.log("In offline mode - loading plans from localStorage");
            usePlansStore.getState().loadPlansFromUrl();
            return;
        }

        try {
            console.log("Online mode - Fetching Plans from url: ", url);
            let response = await fetch(url, {
                method: "GET",
                headers: {
                    "ngrok-skip-browser-warning": "1",
                    "Content-Type": "application/json",
                }
            });
            response = await response.json();

            console.log("Response from Fetching Plans", response);
            set({ plans: response.plans });
        } catch (e) {
            console.log("Error Fetching Plans", e);
            // localStorage.setItem("isOffline", "true");
            // set({ isOffline: true });
            // Try to load plans from localStorage when fetch fails
            // usePlansStore.getState().loadPlansFromUrl();
        }
    },

    setCurrentPlan: (id) => set((state) => ({ currentPlan: id })),
    setFocusTrigger: (currentState) => set((state) => ({ focusTrigger: currentState })),

    //* Set the Zoom and map center level here
    setZoomLevel: (level) => set((state) => ({ zoomLevel: level })),
    setMapCenter: (coord) => set((state) => ({ mapCenter: coord }))

}))

export default usePlansStore;