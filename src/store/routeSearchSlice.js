import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as routeAPI from "../api/routeSearchAPI";

export const findRoute = createAsyncThunk("route/findRoute", async (coordinates) => {
    const res = await routeAPI.searchRoute(coordinates);
    console.log("API 호출");
    return res.data[0];
});

export const traceRoute = createAsyncThunk("route/traceRoute", async (coordinates) => {
    const res = await routeAPI.traceRoute(coordinates);
    console.log("API 호출");
    return res.data;
})

const routeSearchSlice = createSlice({
    name: "route",
    initialState: {
        routeResult: {
            // { latitude: 0.0, longitude: 0.0 }
            start: null,
            end: null,
            // { latitude: 0.0, longitude: 0.0 }
            routeList: []
        },
        traceRouteResult: {
            start: null,
            end: null,
            routeCoordinates: [],
            traceRoutes: [
                // parentCoordinate : { latitude: 0.0, longitude: 0.0 }
                // visitedCoordinate : [{ latitude: 0.0, longitude: 0.0 }]
            ],
            searchTime: null,
        }
    },
    extraReducers: (builder) => {
        builder.addCase(findRoute.fulfilled, (state, action) => {
            state.routeResult = action.payload;
        })
        builder.addCase(traceRoute.fulfilled, (state, action) => {
            state.traceRouteResult = action.payload;
        })
    }
})

export default routeSearchSlice.reducer;