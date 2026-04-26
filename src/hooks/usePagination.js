const usePagination = (currentPage, totalPages, onPageChange) => {
    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handlePageClick = (page) => {
        onPageChange(page);
    };

    const canNext = currentPage < totalPages;
    const canPrev = currentPage > 1;

    return { handleNext, handlePrev, handlePageClick, canNext, canPrev };
};

export default usePagination;