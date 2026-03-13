import styles from './Pagination.module.css';
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange?: (items: number) => void;
  totalItems: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems
}: PaginationProps) {
  if (totalPages <= 1 && totalItems <= itemsPerPage) return null;

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={styles.pagination}>
      <div className={styles.info}>
        Mostrando <strong>{startIdx}-{endIdx}</strong> de <strong>{totalItems}</strong>
      </div>
      
      <div className={styles.controls}>
        {onItemsPerPageChange && (
          <div className={styles.pageSize}>
            <select 
              value={itemsPerPage} 
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className={styles.select}
            >
              <option value={10}>10 por pág.</option>
              <option value={20}>20 por pág.</option>
              <option value={50}>50 por pág.</option>
              <option value={100}>100 por pág.</option>
            </select>
          </div>
        )}

        <div className={styles.buttons}>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.btn}
          >
            <CaretLeft size={16} />
          </button>
          
          <span className={styles.pageIndicator}>
            Página <strong>{currentPage}</strong> de {totalPages}
          </span>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.btn}
          >
            <CaretRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
