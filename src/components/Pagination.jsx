import usePagination from "../hooks/usePagination";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const { handleNext, handlePrev, handlePageClick, canNext, canPrev } = usePagination(currentPage, totalPages, onPageChange);

    const itemsPerPage = 5;
    const startPage = Math.floor((currentPage - 1) / itemsPerPage) * itemsPerPage + 1;
    const endPage = Math.min(startPage + itemsPerPage - 1, totalPages);
    const pagesArray = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    return (
        <div className="flex justify-center items-center mt-2 mb-2 ">
            <ul className="flex flex-row justify-center">
                <li className="text-black p-4 hover:bg-gray-200 rounded-full flex items-center justify-center w-4 h-4 cursor-pointer" onClick={handlePrev} disabled={!canPrev}>
                    &lt;
                </li>
                {pagesArray.map((page) => (
                    <li
                        key={page}
                        className={`p-4 rounded-full flex items-center justify-center w-4 h-4 cursor-pointer ${currentPage === page ? "bg-blue-500 text-white font-bold" : "text-black hover:bg-gray-200"}`}
                        onClick={() => handlePageClick(page)}
                    >
                        {page}
                    </li>
                ))}
                <li className="text-black p-4 hover:bg-gray-200 rounded-full flex items-center justify-center w-4 h-4 cursor-pointer" onClick={handleNext} disabled={!canNext}>
                    &gt;
                </li>
            </ul>
        </div>
    );
};

export default Pagination;
