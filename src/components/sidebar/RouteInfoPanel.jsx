import { LuClock3, LuMapPinned, LuNavigation, LuRoute, LuX } from "react-icons/lu";
import { useDispatch } from "react-redux";
import { clearHoveredRouteStep, focusRouteStep, setHoveredRouteStep } from "../../store/routeSearchSlice";

const directionLabels = {
    START: "출발",
    STRAIGHT: "직진",
    LEFT: "좌회전",
    RIGHT: "우회전",
    U_TURN: "유턴",
    END: "도착",
};

const formatCoordinate = (coordinate) => {
    if (!coordinate) return "-";
    return `${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`;
};

const formatDistance = (meters) => {
    if (!Number.isFinite(meters)) return "-";
    if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
    return `${Math.round(meters)} m`;
};

const formatSearchTime = (searchTime) => {
    if (!Number.isFinite(searchTime)) return "-";
    if (searchTime >= 1000) return `${(searchTime / 1000).toFixed(2)} s`;
    return `${searchTime.toFixed(1)} ms`;
};

const getDistanceInMeters = (from, to) => {
    const earthRadius = 6371000;
    const toRadians = (value) => (value * Math.PI) / 180;
    const latitudeDistance = toRadians(to.latitude - from.latitude);
    const longitudeDistance = toRadians(to.longitude - from.longitude);
    const fromLatitude = toRadians(from.latitude);
    const toLatitude = toRadians(to.latitude);

    const a = Math.sin(latitudeDistance / 2) ** 2 + Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDistance / 2) ** 2;

    return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getRouteDistance = (coordinates = []) => {
    if (coordinates.length < 2) return null;
    return coordinates.slice(1).reduce((distance, coordinate, index) => distance + getDistanceInMeters(coordinates[index], coordinate), 0);
};

const getRouteStepDistance = (routeSteps, startIndex, endIndex) => {
    let distance = 0;

    for (let index = startIndex + 1; index <= endIndex; index++) {
        const previousCoordinate = routeSteps[index - 1]?.coordinate;
        const currentCoordinate = routeSteps[index]?.coordinate;

        if (previousCoordinate && currentCoordinate) {
            distance += getDistanceInMeters(previousCoordinate, currentCoordinate);
        }
    }

    return distance;
};

const getGuideSteps = (routeSteps = []) => {
    const guideSteps = [];

    for (let index = 0; index < routeSteps.length; index++) {
        const routeStep = routeSteps[index];

        if (!routeStep?.turnDirection || !routeStep.coordinate) continue;

        if (routeStep.turnDirection !== "STRAIGHT") {
            guideSteps.push({
                ...routeStep,
                stepIndex: index,
                endStepIndex: index,
                straightCount: 0,
            });
            continue;
        }

        const straightStartIndex = index;
        let straightEndIndex = index;

        while (straightEndIndex + 1 < routeSteps.length && routeSteps[straightEndIndex + 1]?.turnDirection === "STRAIGHT" && routeSteps[straightEndIndex + 1]?.coordinate) {
            straightEndIndex++;
        }

        guideSteps.push({
            ...routeStep,
            coordinate: routeSteps[straightEndIndex].coordinate,
            startCoordinate: routeStep.coordinate,
            endCoordinate: routeSteps[straightEndIndex].coordinate,
            stepIndex: straightStartIndex,
            endStepIndex: straightEndIndex,
            straightCount: straightEndIndex - straightStartIndex + 1,
            distance: getRouteStepDistance(routeSteps, straightStartIndex, straightEndIndex),
        });

        index = straightEndIndex;
    }

    return guideSteps;
};

const getStepTitle = (step) => {
    const label = directionLabels[step.turnDirection] ?? step.turnDirection;

    if (step.turnDirection === "STRAIGHT") {
        const distanceText = Number.isFinite(step.distance) ? formatDistance(step.distance) : "";

        return distanceText ? `${label} (${distanceText})` : label;
    }

    return label;
};

const RouteInfoPanel = ({ route, onClear }) => {
    const dispatch = useDispatch();
    const hasRoute = Boolean(route);
    const routeCoordinates = route?.routeCoordinates ?? [];
    const visibleSteps = getGuideSteps(route?.routeSteps);
    const selectedStep = route?.selectedStep;
    const selectedDirection = selectedStep?.turnDirection;
    const routeTypeText = route?.source === "trace" ? "추적 경로" : hasRoute ? `경로 ${route.routeIndex + 1}` : "경로 정보";
    const handleStepMouseEnter = (step) => {
        dispatch(
            setHoveredRouteStep({
                ...step,
                source: route?.source,
                routeIndex: route?.routeIndex,
            }),
        );
    };

    const handleStepMouseLeave = () => {
        dispatch(clearHoveredRouteStep());
    };

    const handleStepClick = (step) => {
        dispatch(
            focusRouteStep({
                ...step,
                source: route?.source,
                routeIndex: route?.routeIndex,
            }),
        );
    };

    return (
        <section className="flex h-full flex-col overflow-hidden border-b border-gray-200 bg-white">
            <div className="flex shrink-0 items-center justify-between px-4 py-3">
                <div>
                    <p className="text-xs font-semibold text-blue-600">{routeTypeText}</p>
                    <h2 className="text-base font-bold text-gray-900">{hasRoute ? "선택한 루트" : "루트 정보"}</h2>
                </div>
                <button onClick={onClear} className="rounded-md border border-gray-200 p-1 text-gray-500 hover:bg-gray-100" title="루트 사이드바 닫기">
                    <LuX size={18} />
                </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-4">
                <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md border border-gray-200 p-3">
                        <p className="flex items-center gap-1 text-xs text-gray-500">
                            <LuRoute size={14} />
                            거리
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{formatDistance(getRouteDistance(routeCoordinates))}</p>
                    </div>
                    <div className="rounded-md border border-gray-200 p-3">
                        <p className="flex items-center gap-1 text-xs text-gray-500">
                            <LuNavigation size={14} />
                            좌표
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{hasRoute ? `${routeCoordinates.length}개` : "-"}</p>
                    </div>
                </div>

                {route?.searchTime != null && (
                    <div className="flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                        <LuClock3 size={16} />
                        탐색 시간 {formatSearchTime(route.searchTime)}
                    </div>
                )}

                <div className="space-y-2 text-xs text-gray-600">
                    <p>
                        <span className="font-semibold text-gray-800">출발</span> {formatCoordinate(route?.start)}
                    </p>
                    <p>
                        <span className="font-semibold text-gray-800">도착</span> {formatCoordinate(route?.end)}
                    </p>
                </div>

                {selectedDirection && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
                        선택 지점: {getStepTitle(selectedStep)}
                    </div>
                )}

                <div className="flex min-h-0 flex-1 flex-col">
                    <p className="mb-2 flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-700">
                        <LuMapPinned size={14} />
                        안내 지점
                    </p>
                    {visibleSteps.length > 0 ? (
                        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                            {visibleSteps.map((step, index) => (
                                <div
                                    key={`${step.turnDirection}-${index}`}
                                    className="cursor-pointer rounded-md border border-gray-200 px-3 py-2 transition-colors hover:border-blue-200 hover:bg-blue-50"
                                    onClick={() => handleStepClick(step)}
                                    onMouseEnter={() => handleStepMouseEnter(step)}
                                    onMouseLeave={handleStepMouseLeave}
                                >
                                    <p className="text-sm font-semibold text-gray-800">{getStepTitle(step)}</p>
                                    <p className="mt-1 text-xs text-gray-500">{formatCoordinate(step.coordinate)}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-500">
                            {hasRoute ? "표시할 안내 지점이 없습니다." : "지도에서 탐색된 루트를 선택하면 안내 지점이 표시됩니다."}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default RouteInfoPanel;
