import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as restaurantAPI from "../api/restaurantSearchAPI";

export const searchRestaurants = createAsyncThunk(
    "restaurant/searchRestaurants",
    async (address) => {
        const res = await restaurantAPI.searchRestaurantsByAddress(address);
        return res.data;
    }
);

const restaurantSearchSlice = createSlice({
    name: "restaurant",
    initialState: {
        searchAddress: "",
        restaurants: [],
        loading: false,
        error: null,
    },
    reducers: {
        setSearchAddress: (state, action) => {
            state.searchAddress = action.payload;
        },
        clearRestaurants: (state) => {
            state.restaurants = [];
            state.searchAddress = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchRestaurants.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchRestaurants.fulfilled, (state, action) => {
                state.loading = false;
                state.restaurants = action.payload;
            })
            .addCase(searchRestaurants.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { setSearchAddress, clearRestaurants } = restaurantSearchSlice.actions;
export default restaurantSearchSlice.reducer;
