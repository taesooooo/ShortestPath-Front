import defaultAxios from "./defaultAxios";

export const searchRoute = (coordinates) => {
    const params = encodeURIComponent(`${coordinates.start.lat}/${coordinates.start.lon}|${coordinates.end.lat}/${coordinates.end.lon}`);
    return defaultAxios.get(`/api/map/find-path?coordinates=${params}`);
};

export const traceRoute = (coordinates) => {
    const params = encodeURIComponent(`${coordinates.start.lat}/${coordinates.start.lon}|${coordinates.end.lat}/${coordinates.end.lon}`);
    return defaultAxios.get(`/api/map/search-route-track?coordinates=${params}`);
};
