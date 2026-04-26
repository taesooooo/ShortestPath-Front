import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as restaurantAPI from "../api/restaurantSearchAPI";

export const searchRestaurants = createAsyncThunk(
    "restaurant/searchRestaurants",
    async (requestInfo) => {
        const pageInfo = { page: requestInfo.page, size: requestInfo.size };

        const res = await restaurantAPI.searchRestaurants(pageInfo, requestInfo.keyword, requestInfo.category, requestInfo.boundingBox);
        return res.data;
    }
);

export const searchRestaurantsByCategory = createAsyncThunk(
    "restaurant/searchRestaurantsByCategory",
    async (requestInfo) => {
        const pageInfo = { page: requestInfo.page, size: requestInfo.size };
        const category = requestInfo.category;
        const res = await restaurantAPI.searchRestaurantsByCategory(pageInfo, category);
        return res.data;
    }
);


const getPageInfo = (payload) => {
    const { totalElements, totalPages, currentPage, pageSize } = payload;
    return { totalElements, totalPages, currentPage, pageSize };
};

const restaurantSearchSlice = createSlice({
    name: "restaurant",
    initialState: {
        searchAddress: "",
        keyword: "",
        category: "",
        pageInfo: {
            totalElements: 0,
            totalPages: 0,
            currentPage: 1,
            pageSize: 10
        },
        restaurants: [],
        selectedRestaurant: null,
        loading: {},
        error: null,
    },
    reducers: {
        setSearchAddress: (state, action) => {
            state.searchAddress = action.payload;
        },
        updateKeyword: (state, action) => {
            state.keyword = action.payload;
        },
        updateCategory: (state, action) => {
            state.category = action.payload;
        },
        clearRestaurants: (state) => {
            state.restaurants = [];
            state.searchAddress = "";
            state.selectedRestaurant = null;
        },
        selectRestaurant: (state, action) => {
            state.selectedRestaurant = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchRestaurants.pending, (state, action) => {
                state.loading[searchRestaurants.typePrefix] = true;
                state.error = null;
            })
            .addCase(searchRestaurants.fulfilled, (state, action) => {
                state.loading[searchRestaurants.typePrefix] = false;
                state.pageInfo = getPageInfo(action.payload);
                state.restaurants = action.payload.content;
            })
            .addCase(searchRestaurants.rejected, (state, action) => {
                state.loading[searchRestaurants.typePrefix] = false;
                state.restaurants = [];
                state.error = action.error.message;
            })
            .addCase(searchRestaurantsByCategory.pending, (state, action) => {
                state.loading[searchRestaurantsByCategory.typePrefix] = true;
                state.error = null;
            })
            .addCase(searchRestaurantsByCategory.fulfilled, (state, action) => {
                state.loading[searchRestaurantsByCategory.typePrefix] = false;
                state.pageInfo = getPageInfo(action.payload);
                state.restaurants = action.payload.content;
            })
            .addCase(searchRestaurantsByCategory.rejected, (state, action) => {
                state.loading[searchRestaurantsByCategory.typePrefix] = false;
                state.restaurants = [];
                state.error = action.error.message;
            });
    },
});

export const { setSearchAddress, updateKeyword, updateCategory, clearRestaurants, selectRestaurant } = restaurantSearchSlice.actions;
export default restaurantSearchSlice.reducer;
