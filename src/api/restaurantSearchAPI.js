export const searchRestaurantsByAddress = async (address) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // 더미 데이터
            const restaurants = [
                {
                    id: 1,
                    name: "맛있는 한식당",
                    address: address,
                    category: "한식",
                    rating: 4.5,
                    reviews: 128,
                },
                {
                    id: 2,
                    name: "중국음식점",
                    address: address,
                    category: "중식",
                    rating: 4.2,
                    reviews: 95,
                },
                {
                    id: 3,
                    name: "피자하우스",
                    address: address,
                    category: "양식",
                    rating: 4.1,
                    reviews: 67,
                },
                {
                    id: 4,
                    name: "일식당",
                    address: address,
                    category: "일식",
                    rating: 4.8,
                    reviews: 156,
                },
                {
                    id: 5,
                    name: "카페 & 베이커리",
                    address: address,
                    category: "카페",
                    rating: 4.3,
                    reviews: 203,
                },
            ];
            resolve({ data: restaurants });
        }, 500);
    });
};
