import { configureStore } from "@reduxjs/toolkit";
import routeSearchReducer from "./routeSearchSlice"

const store = configureStore({
    reducer: {
        route: routeSearchReducer
    }
})

export default store;