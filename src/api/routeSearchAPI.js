import QueryString from "qs";
import defaultAxios from "./defaultAxios";

const searchRoute = (coordinates) => {
    const params = `${coordinates.start.lat}/${coordinates.start.lon}|${coordinates.end.lat}/${coordinates.end.lon}`
    return defaultAxios.get(`/api/map/find-path?coordinates=${params}`);
};

export { searchRoute };