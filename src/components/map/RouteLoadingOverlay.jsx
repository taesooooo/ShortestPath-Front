import { useSelector } from "react-redux";
import { LuMapPin, LuNavigation } from "react-icons/lu";
import LoadingOverlay from "../common/LoadingOverlay";

const RouteLoadingGraphic = () => (
    <div className="relative mx-auto mb-6 h-24 w-56" aria-hidden="true">
        <div className="route-loading-path absolute left-6 right-6 top-1/2 h-0.5 -translate-y-1/2 overflow-hidden rounded-full bg-blue-100">
            <div className="route-loading-progress h-full w-1/2 rounded-full bg-gradient-to-r from-blue-400 via-sky-500 to-blue-600" />
        </div>

        <div className="absolute left-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm ring-4 ring-white">
            <LuMapPin size={24} strokeWidth={2.4} />
        </div>
        <div className="absolute right-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-300 ring-4 ring-white">
            <LuNavigation size={23} strokeWidth={2.4} />
        </div>

        <span className="route-loading-dot absolute left-[30%] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-sky-500 shadow-[0_0_0_5px_rgba(14,165,233,0.16)]" />
    </div>
);

const RouteLoadingOverlay = () => {
    const { findRoute, traceRoute } = useSelector((state) => state.route.loading);
    const isLoading = findRoute || traceRoute;

    const title = traceRoute ? "경로를 추적하고 있어요" : "가장 좋은 경로를 찾고 있어요";
    const description = traceRoute ? "양쪽 방향에서 탐색한 경로를 비교하고 있습니다." : "출발지와 도착지 사이의 경로를 계산하고 있습니다.";

    return (
        <LoadingOverlay isOpen={isLoading} title={title} description={description} statusText="경로 탐색 중입니다. 잠시만 기다려 주세요.">
            <RouteLoadingGraphic />
        </LoadingOverlay>
    );
};

export default RouteLoadingOverlay;
