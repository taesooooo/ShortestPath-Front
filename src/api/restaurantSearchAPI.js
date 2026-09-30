import QueryString from "qs";
import defaultAxios from "./defaultAxios";

export const searchRestaurants = (pageInfo, keyword, category, boundingBox) => {
    const param = {
        page: pageInfo.page,
        size: pageInfo.size,
        keyword,
        category,
        minLat: boundingBox ? boundingBox[1] : null,
        minLon: boundingBox ? boundingBox[0] : null,
        maxLat: boundingBox ? boundingBox[3] : null,
        maxLon: boundingBox ? boundingBox[2] : null,
    }

    const requestParams = QueryString.stringify(param, {
        filter: (prefix, value) => {
            if (value === null || value === undefined || value === '') {
                return;
            }

            return value;
        }
    });

    return defaultAxios.get(`/api/restaurants/search?${requestParams}`);
};

export const searchRestaurantsByCategory = (pageInfo, category) => {
    const params = `page=${pageInfo.page}&size=${pageInfo.size}`;
    return defaultAxios.get(`/api/restaurants/category/${category}?${params}`);
}

