import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as routeAPI from "../api/routeSearchAPI";

const emptyRouteResult = {
    start: null,
    end: null,
    routeList: [],
    routeSteps: [],
};

const emptyTraceRouteResult = {
    start: null,
    end: null,
    routeCoordinates: [],
    traceRoutes: [],
    searchTime: null,
};

export const findRoute = createAsyncThunk("route/findRoute", async (coordinates) => {
    const res = await routeAPI.searchRoute(coordinates);
    return Array.isArray(res.data) ? res.data : (res.data ?? emptyRouteResult);
});

export const traceRoute = createAsyncThunk("route/traceRoute", async (coordinates) => {
    const res = await routeAPI.traceRoute(coordinates);
    return res.data ?? emptyTraceRouteResult;
});

const routeSearchSlice = createSlice({
    name: "route",
    initialState: {
        routeResult: emptyRouteResult,
        traceRouteResult: emptyTraceRouteResult,
        selectedRoute: null,
        hoveredRouteStep: null,
        focusedRouteStep: null,
    },
    reducers: {
        selectRoute: (state, action) => {
            state.selectedRoute = action.payload;
        },
        clearSelectedRoute: (state) => {
            state.selectedRoute = null;
            state.hoveredRouteStep = null;
            state.focusedRouteStep = null;
        },
        setHoveredRouteStep: (state, action) => {
            state.hoveredRouteStep = action.payload;
        },
        clearHoveredRouteStep: (state) => {
            state.hoveredRouteStep = null;
        },
        focusRouteStep: (state, action) => {
            state.focusedRouteStep = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(findRoute.fulfilled, (state, action) => {
            state.routeResult = action.payload;
            state.selectedRoute = null;
            state.hoveredRouteStep = null;
            state.focusedRouteStep = null;
        });
        builder.addCase(traceRoute.fulfilled, (state, action) => {
            state.traceRouteResult = action.payload;
            state.selectedRoute = null;
            state.hoveredRouteStep = null;
            state.focusedRouteStep = null;
        });
    },
});

export const { selectRoute, clearSelectedRoute, setHoveredRouteStep, clearHoveredRouteStep, focusRouteStep } = routeSearchSlice.actions;

export default routeSearchSlice.reducer;
