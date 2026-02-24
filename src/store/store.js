import { configureStore } from "@reduxjs/toolkit";
import routeSearchReducer from "./routeSearchSlice";
import restaurantSearchReducer from "./restaurantSearchSlice";

const store = configureStore({
    reducer: {
        route: routeSearchReducer,
        restaurant: restaurantSearchReducer,
    },
});

export default store;