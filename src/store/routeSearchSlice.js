import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { searchRoute } from "../api/routeSearchAPI";

export const findRoute = createAsyncThunk("route/findRoute", async (coordinates) => {
    const res = await searchRoute(coordinates);
    console.log("API 호출");
    return res.data[0];
});

const routeSearchSlice = createSlice({
    name: "route",
    initialState: {
        routeResult: {
            start: { latitude: 0.0, longitude: 0.0 },
            end: { latitude: 0.0, longitude: 0.0 },
            routeList: [{
                latitude: 0.0, longitude: 0.0
            }]
        }
    },
    extraReducers: (builder) => {
        builder.addCase(findRoute.fulfilled, (state, action) => {
            state.routeResult = action.payload;
        })
    }
})

export default routeSearchSlice.reducer;